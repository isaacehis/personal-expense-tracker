import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

import { SettingsForms } from "./settings-forms";

export const metadata: Metadata = {
  title: "Account settings",
  description: "Update your name, email, currency, timezone, and account password securely.",
};

export default async function SettingsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return <SettingsForms user={session.user} />;
}
