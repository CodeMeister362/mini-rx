"use client";

import { useActionState } from "react";
import createRequest, { type RequestFormState } from "../actions";

const initialState: RequestFormState = {};

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

const FieldError = ({ messages }: { messages?: string[] }) =>
  messages?.length ? (
    <p className="mt-1 text-sm text-rose-600">{messages[0]}</p>
  ) : null;

const NewRequestPage = () => {
  const [state, formAction, isPending] = useActionState(
    createRequest,
    initialState,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">New Prescription Request</h1>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="patientName" className="text-sm font-medium">
              Patient name
            </label>
            <input id="patientName" name="patientName" className={inputClass} />
            <FieldError messages={state.errors?.patientName} />
          </div>

          <div>
            <label htmlFor="medication" className="text-sm font-medium">
              Medication
            </label>
            <input id="medication" name="medication" className={inputClass} />
            <FieldError messages={state.errors?.medication} />
          </div>

          <div>
            <label htmlFor="symptoms" className="text-sm font-medium">
              Symptoms
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={4}
              className={inputClass}
            />
            <FieldError messages={state.errors?.symptoms} />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {isPending ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default NewRequestPage;
