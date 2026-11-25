import { desc } from "drizzle-orm";
import { db } from "~/server/db";
import { prescriptionRequests } from "~/server/db/schema";
import Link from "next/link";

type Status = (typeof prescriptionRequests.$inferSelect)["status"];

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  denied: "bg-rose-50 text-rose-700 ring-rose-600/20",
  shipped: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const STATUSES = Object.keys(STATUS_STYLES) as Status[];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const StatusBadge = ({ status }: { status: Status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[status]}`}
  >
    {status}
  </span>
);

const RequestsPage = async () => {
  const rows = await db
    .select()
    .from(prescriptionRequests)
    .orderBy(desc(prescriptionRequests.createdAt));

  const counts = STATUSES.map((status) => ({
    status,
    count: rows.filter((r) => r.status === status).length,
  }));

  return (
    <div className="px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Prescription Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? "request" : "requests"} in the
            queue, newest first.
          </p>
        </header>

        {/* Status summary */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map(({ status, count }) => (
            <div
              key={status}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <StatusBadge status={status} />
              <p className="mt-3 text-2xl font-semibold">{count}</p>
            </div>
          ))}
        </section>

        {/* Requests list */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-medium">No requests yet</p>
              <p className="mt-1 text-sm text-slate-500">
                New prescription requests will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Patient</th>
                    <th className="px-6 py-3 font-medium">Medication</th>
                    <th className="px-6 py-3 font-medium">Symptoms</th>
                    <th className="px-6 py-3 font-medium">Submitted</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="relative focus-within:bg-sky-50 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {/* "Stretched link": the ::after overlay covers the whole row */}
                        <Link
                          href={`/requests/${row.id}`}
                          className="after:absolute after:inset-0 focus:outline-none"
                        >
                          {row.patientName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{row.medication}</td>
                      <td className="max-w-xs truncate px-6 py-4 text-slate-500">
                        {row.symptoms}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {dateFormatter.format(row.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <ul className="divide-y divide-slate-100 md:hidden">
                {rows.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`/requests/${row.id}`}
                      className="block p-4 hover:bg-slate-50 focus:bg-sky-50 focus:outline-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{row.patientName}</p>
                          <p className="text-sm text-slate-700">
                            {row.medication}
                          </p>
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {row.symptoms}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {dateFormatter.format(row.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default RequestsPage;
