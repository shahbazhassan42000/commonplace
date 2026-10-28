"use client";

import { useActionState, useId } from "react";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin-shared";
import { setPassword, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { status: "idle" };

export function AdminSetPassword() {
  const [state, formAction, pending] = useActionState(setPassword, initialState);
  const passwordId = useId();
  const confirmId = useId();

  return (
    <form action={formAction} className="flex w-full max-w-[380px] flex-col gap-5">
      <h1 className="text-center text-[30px]">Choose a password</h1>
      <p className="text-center font-hand text-base text-slate">
        First sign-in — set a password you’ll use from now on.
      </p>

      <div className="flex flex-col gap-1">
        <label htmlFor={passwordId} className="pl-[22px] font-hand text-lg">
          New password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          className="field h-[54px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={confirmId} className="pl-[22px] font-hand text-lg">
          Confirm password
        </label>
        <input
          id={confirmId}
          name="confirm"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          className="field h-[54px]"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="font-hand text-base text-burgundy">
          {state.message}
        </p>
      )}

      <button type="submit" className="btn btn-red mt-1" disabled={pending}>
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
