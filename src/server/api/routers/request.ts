import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prescriptionRequests } from "~/server/db/schema";

export const requestRouter = createTRPCRouter({
  /**
   * A provider approves or denies a pending request.
   */
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["approved", "denied"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Conditional update: only matches if the row is still pending.
      // Doing the check inside the UPDATE avoids a race where two
      // providers review the same request at the same time.
      const [updated] = await ctx.db
        .update(prescriptionRequests)
        .set({ status: input.status })
        .where(
          and(
            eq(prescriptionRequests.id, input.id),
            eq(prescriptionRequests.status, "pending"),
          ),
        )
        .returning();

      if (updated) return updated;

      // Nothing updated: figure out why so the client gets a useful error.
      const existing = await ctx.db.query.prescriptionRequests.findFirst({
        where: eq(prescriptionRequests.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found." });
      }

      throw new TRPCError({
        code: "CONFLICT",
        message: `Request is already ${existing.status}.`,
      });
    }),
});
