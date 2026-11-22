import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { prescriptionRequests } from "~/server/db/schema";

const RequestDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [request] = await db
    .select()
    .from(prescriptionRequests)
    .where(eq(prescriptionRequests.id, Number(id)));

    if (!request) notFound();

  return(
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{request.patientName}</h1>
        <p className="mt-1 text-slate-700">{request.medication}</p>
        <p className="mt-4 text-sm text-slate-500">{request.symptoms}</p>
        <p className="mt-4 text-sm capitalize">Status: {request.status}</p>
      </div>
    </main>
  )
}

export default RequestDetailPage;