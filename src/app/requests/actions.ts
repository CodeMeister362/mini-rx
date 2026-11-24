"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "~/server/db";
import { prescriptionRequests } from "~/server/db/schema";

const requestSchema = z.object({
  patientName: z.string().trim().min(1, "Patient name is required.").max(150),
  medication: z.string().trim().min(1, "Medication is required.").max(256),
  symptoms: z.string().trim().min(1, "Symptoms are required.").max(256),
});

export type RequestFormState = {
  errors?: {
    patientName?: string[];
    medication?: string[];
    symptoms?: string[];
  };
};

export default async function createRequest(
  _prevState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const result = requestSchema.safeParse({
    patientName: formData.get("patientName"),
    medication: formData.get("medication"),
    symptoms: formData.get("symptoms"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  await db.insert(prescriptionRequests).values(result.data);
  revalidatePath("/requests");
  redirect("/requests");
}
