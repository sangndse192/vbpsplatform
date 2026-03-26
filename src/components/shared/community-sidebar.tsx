"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCommunityStats, getPopularTags } from "@/lib/actions/posts";
import { AmbassadorLeaderboard } from "./ambassador-leaderboard";

type HotDocument = {
  id: string;
  title: string;
  view_count: number;
};

type Props = {
  onTagClick?: (tag: string) => void;
  hotDocuments?: HotDocument[];
};

export function CommunitySidebar({ onTagClick, hotDocuments }: Props) {
  const [stats, setStats] = useState({ totalPosts: 0, totalMembers: 0, postsToday: 0, newAnswers: 0 });
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    getCommunityStats().then((s) =>
      setStats({ totalPosts: s.totalPosts, totalMembers: s.totalMembers, postsToday: s.postsToday, newAnswers: 0 })
    );
    getPopularTags().then(setTags);
  }, []);

  return (
    <div className="space-y-4">
      {/* Widget 1: Hot Documents */}
      {hotDocuments && hotDocuments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🔥 Văn bản đang hot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {hotDocuments.slice(0, 3).map((doc, i) => (
              <div key={doc.id} className="flex items-start gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4 shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug line-clamp-2">{doc.title}</p>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                    <Eye className="h-3 w-3" />
                    {doc.view_count.toLocaleString("vi-VN")} lượt xem
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Widget 2: Ambassador Leaderboard */}
      <AmbassadorLeaderboard />

      {/* Widget 3: Popular Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🏷️ Chủ đề phổ biến</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-1.5 flex-wrap">
            {tags.map((t) => (
              <Badge
                key={t.tag}
                variant="secondary"
                className="cursor-pointer text-xs hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                onClick={() => onTagClick?.(t.tag)}
              >
                #{t.tag} ({t.count})
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Widget 4: Community Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">📊 Thống kê cộng đồng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bài đăng hôm nay</span>
            <span className="font-semibold">{stats.postsToday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Thành viên tham gia</span>
            <span className="font-semibold">{stats.totalMembers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Câu trả lời mới</span>
            <span className="font-semibold">{stats.newAnswers}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
