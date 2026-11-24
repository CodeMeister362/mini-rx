import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/server/db";
import { prescriptionRequests } from "~/server/db/schema";

/**
 * Webhook the (pretend) pharmacy calls when it ships a prescription.
 *
 *   POST /api/webhooks/pharmacy
 *   Header: x-pharmacy-signature: <hex HMAC-SHA256 of the raw body>
 *   Body:   { "event": "prescription.shipped", "requestId": 1 }
 */

const payloadSchema = z.object({
  event: z.literal("prescription.shipped"),
  requestId: z.number().int().positive(),
});

/** Recompute the signature with our shared secret and compare in constant time. */
function isValidSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "hex");
  const computed = Buffer.from(expected, "hex");

  // timingSafeEqual throws if lengths differ, so check that first.
  return received.length === computed.length && timingSafeEqual(received, computed);
}

export async function POST(req: Request) {
  const secret = env.PHARMACY_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed: never accept webhooks if we can't verify them.
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // 1. Verify the signature against the *raw* body, before parsing anything.
  const rawBody = await req.text();
  if (!isValidSignature(rawBody, req.headers.get("x-pharmacy-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Parse and validate the payload.
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { requestId } = parsed.data;

  // 3. Only approved requests can ship. The status check lives inside the
  //    UPDATE so concurrent deliveries can't both succeed.
  const [updated] = await db
    .update(prescriptionRequests)
    .set({ status: "shipped" })
    .where(
      and(
        eq(prescriptionRequests.id, requestId),
        eq(prescriptionRequests.status, "approved"),
      ),
    )
    .returning();

  if (updated) {
    return NextResponse.json({ ok: true, status: updated.status });
  }

  // 4. Nothing updated: work out why.
  const existing = await db.query.prescriptionRequests.findFirst({
    where: eq(prescriptionRequests.id, requestId),
  });

  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (existing.status === "shipped") {
    // Idempotent: webhooks get retried, so a duplicate delivery is a success.
    return NextResponse.json({ ok: true, status: "shipped", duplicate: true });
  }

  return NextResponse.json(
    { error: `Cannot ship a request that is ${existing.status}` },
    { status: 409 },
  );
}
