"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Shield, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { createComment, getCommentsByDocument } from "@/lib/actions/comments";

type Props = {
  documentId: string;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  reply_content: string | null;
  replied_at: string | null;
  user: { full_name: string | null; avatar_url: string | null } | null;
  replier: { full_name: string | null } | null;
};

export function DocumentCommentsTab({ documentId }: Props) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadComments() {
    const res = await getCommentsByDocument(documentId);
    if (res.data) setComments(res.data as unknown as CommentRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadComments();
  }, [documentId]);

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const res = await createComment(documentId, text);
    setSubmitting(false);
    if (res.data) {
      setText("");
      loadComments();
    }
  }

  return (
    <div className="space-y-4">
      {/* Feedback form */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <Textarea
            placeholder="Gop y ve van ban nay..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length}/500
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Dang gui..." : "Gui gop y"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <MessageSquare className="h-8 w-8" />
          <p>Hay la nguoi dau tien gop y</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="py-3 space-y-2">
                {/* User info */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    {comment.user?.avatar_url ? (
                      <img
                        src={comment.user.avatar_url}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                        <UserCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium">
                    {comment.user?.full_name ?? "Nhan vien"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Comment content */}
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

                {/* HQ Reply */}
                {comment.reply_content ? (
                  <div className="mt-2 rounded-lg bg-blue-50 p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <Shield className="mr-1 h-3 w-3" />
                        Phan hoi chinh thuc
                      </Badge>
                      {comment.replier?.full_name && (
                        <span className="text-xs text-blue-600">
                          {comment.replier.full_name}
                        </span>
                      )}
                      {comment.replied_at && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(comment.replied_at).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {comment.reply_content}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Dang cho phan hoi tu HQ
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
