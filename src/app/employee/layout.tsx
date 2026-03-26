import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { EMPLOYEE_NAV_ITEMS } from "@/lib/constants";

export default async function EmployeeLayout({
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
    .select("role, full_name, branch_id, branches(name)")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin/dashboard");

  const branchName =
    profile?.branches && !Array.isArray(profile.branches)
      ? (profile.branches as { name: string }).name
      : Array.isArray(profile?.branches) && profile.branches.length > 0
        ? (profile.branches[0] as { name: string }).name
        : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        navItems={EMPLOYEE_NAV_ITEMS}
        role="employee"
        userProfile={{
          name: profile?.full_name || "",
          branch: branchName,
          isAmbassador: profile?.role === "ambassador",
        }}
        switchUrl={profile?.role === "admin" ? "/admin/dashboard" : undefined}
        switchLabel="Chuyển sang Admin"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={profile?.full_name}
          userRole={branchName}
        />
        <main className="flex-1 overflow-y-auto bg-[#f0f4ff] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
