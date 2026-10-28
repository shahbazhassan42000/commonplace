"use client";

import { useActionState, useId } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const emailId = useId();
  const passwordId = useId();

  return (
    <form action={formAction} className="flex w-full max-w-[380px] flex-col gap-5">
      <h1 className="text-center text-[30px]">Admin</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor={emailId} className="pl-[22px] font-hand text-lg">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.status === "error" ? state.email : ""}
          className="field h-[54px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={passwordId} className="pl-[22px] font-hand text-lg">
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field h-[54px]"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="font-hand text-base text-burgundy">
          {state.message}
        </p>
      )}

      <button type="submit" className="btn btn-red mt-1" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
