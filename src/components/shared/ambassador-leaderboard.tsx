"use client";

import { useEffect, useState } from "react";
import { Star, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getTopAmbassadors } from "@/lib/actions/ambassadors";

type Ambassador = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  branch?: string | null;
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
          Đại sứ tích cực
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ambassadors.map((a, i) => (
          <div key={a.id} className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
            <Avatar className="h-7 w-7 flex-shrink-0">
              {a.avatar_url ? (
                <img src={a.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-amber-50">
                  <UserCircle className="h-4 w-4 text-amber-600" />
                </div>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate font-medium">{a.full_name ?? "Đại sứ"}</p>
              {a.branch && (
                <p className="text-[10px] text-muted-foreground truncate">{a.branch}</p>
              )}
            </div>
            <Badge className="text-[10px] bg-amber-100 text-amber-700 shrink-0">
              {a.post_count} bài
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
