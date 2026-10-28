import type { Metadata } from "next";
import { Suspense } from "react";
import { readSession } from "@/lib/admin-auth";
import { getAdminLines } from "@/lib/admin-queries";
import { AdminDashboard } from "./dashboard";
import { AdminLogin } from "./login-form";
import { AdminSetPassword } from "./set-password-form";

// Hidden page: not linked anywhere, and kept out of search indexes.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  // The whole page depends on the session cookie, so the dynamic part lives
  // under <Suspense> — Cache Components prerenders the shell and streams this.
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminGate />
    </Suspense>
  );
}

function AdminFallback() {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="h-40 w-full max-w-[380px] animate-pulse rounded-[15px] bg-blush"
      />
    </div>
  );
}

async function AdminGate() {
  const session = await readSession();

  if (!session || session.stage === "reset") {
    return (
      <div className="flex w-full flex-1 items-center justify-center px-6 py-16">
        {session?.stage === "reset" ? <AdminSetPassword /> : <AdminLogin />}
      </div>
    );
  }

  const lines = await getAdminLines();
  return <AdminDashboard lines={lines} />;
}
