"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

type InviteUserInput = {
  email: string;
  role: UserRole;
  branchId?: string;
};

export async function inviteUser({ email, role, branchId }: InviteUserInput) {
  // Auth guard: only admins can invite
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden" };

  // Use service-role client for admin operations
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: { role, branch_id: branchId },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/invite/accept`,
    }
  );

  if (error) return { error: error.message };

  if (branchId && data.user) {
    await adminClient
      .from("profiles")
      .update({ branch_id: branchId, role })
      .eq("id", data.user.id);
  }

  return { success: true };
}
