"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2, Send, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "@/lib/actions/posts";

type Props = {
  userId: string;
  onPostCreated: () => void;
  userInitial?: string;
};

const PRESET_TAGS = ["Kinh nghiệm", "Hỏi đáp", "Checklist", "Doanh nghiệp"];

export function PostComposer({ userId, onPostCreated, userInitial }: Props) {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    const remaining = 4 - imageFiles.length;
    const toAdd = valid.slice(0, remaining);

    setImageFiles((prev) => [...prev, ...toAdd]);
    for (const file of toAdd) {
      const url = URL.createObjectURL(file);
      setImagePreviews((prev) => [...prev, url]);
    }
    e.target.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);

    try {
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const supabase = createClient();
        for (const file of imageFiles) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${userId}/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from("community-images")
            .upload(path, file);
          if (!error) {
            const { data } = supabase.storage
              .from("community-images")
              .getPublicUrl(path);
            imageUrls.push(data.publicUrl);
          }
        }
      }

      await createPost({
        content: content.trim(),
        images: imageUrls,
        tags: selectedTags,
      });

      setContent("");
      setSelectedTags([]);
      imagePreviews.forEach(URL.revokeObjectURL);
      setImageFiles([]);
      setImagePreviews([]);
      onPostCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Avatar + textarea row */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
            {userInitial ? (
              <span className="text-sm font-semibold text-indigo-700">{userInitial}</span>
            ) : (
              <UserCircle className="h-5 w-5 text-indigo-400" />
            )}
          </div>
          <Textarea
            placeholder="Chia sẻ kinh nghiệm, đặt câu hỏi với cộng đồng..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="flex-1 resize-none"
          />
        </div>

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 flex-wrap pl-12">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-16 h-16">
                <img src={src} alt="" className="w-full h-full object-cover rounded" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap pl-12">
          {PRESET_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer text-xs transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
              }`}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pl-12">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={imageFiles.length >= 4}
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ImagePlus className="h-4 w-4" />
              <span>📷 Thêm ảnh</span>
              {imageFiles.length > 0 && (
                <span className="text-muted-foreground">({imageFiles.length}/4)</span>
              )}
            </div>
          </label>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {submitting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Đăng tải
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
