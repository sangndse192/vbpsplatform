import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/employee/dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        navItems={ADMIN_NAV_ITEMS}
        theme="indigo"
        portalName="VBSP Admin"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={profile?.full_name} userEmail={user.email} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
