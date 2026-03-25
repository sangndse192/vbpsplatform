"use client";

import { useState } from "react";
import { Heart, MessageCircle, Trash2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ImageGrid } from "./image-grid";
import { toggleLike } from "@/lib/actions/likes";
import { createCommunityComment, getCommunityComments } from "@/lib/actions/community-comments";

type Author = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author: { full_name: string | null; avatar_url: string | null; role: string } | null;
};

export type PostData = {
  id: string;
  title: string | null;
  content: string;
  images: string[];
  tags: string[];
  created_at: string;
  author: Author | null;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
};

type Props = {
  post: PostData;
  currentUserId: string;
  onTagClick?: (tag: string) => void;
  onDelete?: (postId: string) => void;
};

const roleBadge: Record<string, string> = {
  admin: "bg-indigo-100 text-indigo-700",
  employee: "bg-blue-100 text-blue-700",
  ambassador: "bg-amber-100 text-amber-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Vua xong";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function PostCard({ post, currentUserId, onTagClick, onDelete }: Props) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  async function handleLike() {
    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    const result = await toggleLike(post.id);
    if (result.error) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }

  async function handleToggleComments() {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      const result = await getCommunityComments(post.id);
      if (result.data) setComments(result.data as unknown as CommentRow[]);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  }

  async function handleSubmitComment() {
    if (!commentText.trim()) return;
    const result = await createCommunityComment(post.id, commentText);
    if (result.data) {
      setComments((prev) => [...prev, result.data as unknown as CommentRow]);
      setCommentText("");
    }
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {post.author?.full_name ?? "Nhan vien"}
              </span>
              <Badge className={`text-[10px] h-4 ${roleBadge[post.author?.role ?? "employee"] ?? roleBadge.employee}`}>
                {post.author?.role}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
          </div>
          {post.author?.id === currentUserId && onDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(post.id)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Content */}
        {post.title && <h3 className="font-semibold text-sm">{post.title}</h3>}
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        {/* Images */}
        <ImageGrid images={post.images ?? []} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-blue-100"
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1 border-t">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleLike}>
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleToggleComments}>
            <MessageCircle className="h-4 w-4" />
            {post.comment_count + comments.length - (comments.length > 0 ? post.comment_count : 0)}
          </Button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 pl-2 border-l-2 border-gray-100">
            {loadingComments && <p className="text-xs text-muted-foreground">Dang tai...</p>}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-xs">
                <span className="font-medium shrink-0">{c.author?.full_name ?? "User"}</span>
                <span className="text-muted-foreground">{c.content}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Binh luan..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="text-xs h-8"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
