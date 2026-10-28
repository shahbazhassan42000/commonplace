import type { Metadata } from "next";
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

export default async function AdminPage() {
  // Reading the session cookie opts this route into dynamic rendering.
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
