"use client";

import { useFormState } from "react-dom";
import { joinTournament, type JoinState } from "@/app/join/actions";

const initialState: JoinState = { ok: false, message: "" };

export default function JoinForm() {
  const [state, formAction] = useFormState(joinTournament, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">الاسم</label>
        <input
          name="name"
          placeholder="اكتب الاسم هنا"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
      >
        تسجيل
      </button>
      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-600"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
