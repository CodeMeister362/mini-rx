"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export const ReviewActions = ({ id }: { id: number }) => {
  const router = useRouter();

  const updateStatus = api.request.updateStatus.useMutation({
    // After approving or denying, go back to the queue.
    onSuccess: () => router.push("/requests"),
  });

  return (
    <div className="mt-6">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={updateStatus.isPending}
          onClick={() => updateStatus.mutate({ id, status: "approved" })}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={updateStatus.isPending}
          onClick={() => updateStatus.mutate({ id, status: "denied" })}
          className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
        >
          Deny
        </button>
      </div>

      {updateStatus.error && (
        <p className="mt-3 text-sm text-rose-600">
          {updateStatus.error.message}
        </p>
      )}
    </div>
  );
};
