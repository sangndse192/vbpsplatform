"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostComposer } from "./post-composer";
import { PostCard, type PostData } from "./post-card";
import { CommunitySidebar } from "./community-sidebar";
import { getPosts, deletePost } from "@/lib/actions/posts";

type Props = {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
};

export function CommunityFeed({ currentUser }: Props) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (pageNum: number, tag: string | null, append = false) => {
      setLoading(true);
      const result = await getPosts({
        page: pageNum,
        limit: 10,
        tag: tag ?? undefined,
      });

      if (result.data) {
        setPosts((prev) =>
          append ? [...prev, ...(result.data as PostData[])] : (result.data as PostData[])
        );
        setHasMore(result.hasMore ?? false);
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    loadPosts(0, activeTag);
  }, [activeTag, loadPosts]);

  function handleTagClick(tag: string) {
    setActiveTag(tag);
    setPage(0);
  }

  function handleClearTag() {
    setActiveTag(null);
    setPage(0);
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, activeTag, true);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Xoa bai dang nay?")) return;
    const result = await deletePost(postId);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Feed column */}
      <div className="lg:col-span-2 space-y-4">
        <PostComposer
          userId={currentUser.id}
          onPostCreated={() => loadPosts(0, activeTag)}
        />

        {/* Active tag filter */}
        {activeTag && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Loc theo:</span>
            <Badge variant="default" className="gap-1">
              #{activeTag}
              <button onClick={handleClearTag}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Posts */}
        {loading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Chua co bai dang nao. Hay la nguoi dau tien chia se!
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onTagClick={handleTagClick}
                onDelete={handleDelete}
              />
            ))}
            {hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={loading}
              >
                Xem them
              </Button>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block">
        <CommunitySidebar onTagClick={handleTagClick} />
      </div>
    </div>
  );
}
