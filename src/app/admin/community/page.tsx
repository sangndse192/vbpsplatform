import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CommunityFeed } from "@/components/shared/community-feed";

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cong dong</h1>
      <CommunityFeed
        currentUser={{
          id: user.id,
          name: profile?.full_name ?? "Admin",
          role: profile?.role ?? "admin",
        }}
      />
    </div>
  );
}
