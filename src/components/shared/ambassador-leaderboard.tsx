"use client";

import { useEffect, useState } from "react";
import { Star, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { getTopAmbassadors } from "@/lib/actions/ambassadors";

type Ambassador = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  post_count: number;
};

export function AmbassadorLeaderboard() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);

  useEffect(() => {
    getTopAmbassadors(5).then(setAmbassadors);
  }, []);

  if (ambassadors.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          Dai su tieu bieu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ambassadors.map((a, i) => (
          <div key={a.id} className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
            <Avatar className="h-7 w-7">
              {a.avatar_url ? (
                <img src={a.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-amber-50">
                  <UserCircle className="h-4 w-4 text-amber-600" />
                </div>
              )}
            </Avatar>
            <span className="text-sm truncate flex-1">{a.full_name ?? "Dai su"}</span>
            <span className="text-xs text-muted-foreground">{a.post_count} bai</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
