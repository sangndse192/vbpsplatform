"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp } from "lucide-react";
import { getCommunityStats, getPopularTags } from "@/lib/actions/posts";
import { AmbassadorLeaderboard } from "./ambassador-leaderboard";

type Props = {
  onTagClick?: (tag: string) => void;
};

export function CommunitySidebar({ onTagClick }: Props) {
  const [stats, setStats] = useState({ totalPosts: 0, totalMembers: 0, postsToday: 0 });
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    getCommunityStats().then(setStats);
    getPopularTags().then(setTags);
  }, []);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cong dong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Bai dang
            </span>
            <span className="font-medium">{stats.totalPosts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Thanh vien
            </span>
            <span className="font-medium">{stats.totalMembers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Hom nay
            </span>
            <span className="font-medium">{stats.postsToday}</span>
          </div>
        </CardContent>
      </Card>

      {/* Ambassador Leaderboard */}
      <AmbassadorLeaderboard />

      {/* Popular Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">The pho bien</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-1.5 flex-wrap">
            {tags.map((t) => (
              <Badge
                key={t.tag}
                variant="secondary"
                className="cursor-pointer text-xs hover:bg-blue-100"
                onClick={() => onTagClick?.(t.tag)}
              >
                #{t.tag} ({t.count})
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
