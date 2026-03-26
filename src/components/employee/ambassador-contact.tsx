import { UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/supabase/types";

type AmbassadorContactProps = {
  ambassador: Pick<Profile, "full_name" | "avatar_url" | "phone" | "position"> | null;
};

export function AmbassadorContact({ ambassador }: AmbassadorContactProps) {
  if (!ambassador) return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <Avatar className="h-10 w-10">
          {ambassador.avatar_url ? (
            <img
              src={ambassador.avatar_url}
              alt={ambassador.full_name ?? "Ambassador"}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {ambassador.full_name ?? "Đại sứ"}
          </p>
          {ambassador.position && (
            <p className="text-xs text-muted-foreground">{ambassador.position}</p>
          )}
          {ambassador.phone && (
            <p className="text-xs text-muted-foreground">{ambassador.phone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
