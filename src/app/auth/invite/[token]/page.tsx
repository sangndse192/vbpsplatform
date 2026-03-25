"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAcceptInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mat khau khong khop");
      return;
    }

    if (password.length < 8) {
      setError("Mat khau phai co it nhat 8 ky tu");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as "invite" | "email";

      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type || "invite",
        });
        if (verifyError) {
          setError("Lien ket moi khong hop le hoac da het han");
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { full_name: fullName },
      });

      if (updateError) {
        setError("Khong the cap nhat thong tin. Vui long thu lai.");
        return;
      }

      // Update profile full_name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", user.id);
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Loi he thong. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-indigo-700">
          Chao mung den VBSP Platform
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Thiet lap tai khoan cua ban
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ho va ten</Label>
            <Input
              id="fullName"
              placeholder="Nguyen Van A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mat khau</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xac nhan mat khau</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Dang xu ly..." : "Hoan tat dang ky"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
