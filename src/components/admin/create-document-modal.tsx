"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PdfUpload } from "./pdf-upload";
import { createDocument } from "@/lib/actions/documents";
import { uploadPdf } from "@/lib/actions/storage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDocumentModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDocument({
        title: form.get("title") as string,
        doc_number: (form.get("doc_number") as string) || undefined,
        doc_type: form.get("doc_type") as "policy",
        urgency: form.get("urgency") as "normal",
        target: form.get("target") as "all",
        summary: (form.get("summary") as string) || undefined,
      });

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Lỗi tạo văn bản");
        return;
      }

      // Upload PDF if selected
      if (pdfFile && result.data?.id) {
        const uploadForm = new FormData();
        uploadForm.set("file", pdfFile);
        await uploadPdf(uploadForm, result.data.id);
      }

      onOpenChange(false);
      if (result.data?.id) {
        router.push(`/admin/docs/${result.data.id}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo văn bản mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc_number">Số văn bản</Label>
            <Input id="doc_number" name="doc_number" placeholder="VB-2026-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Loại văn bản</Label>
              <Select name="doc_type" defaultValue="policy">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy">Chính sách</SelectItem>
                  <SelectItem value="regulation">Quy định</SelectItem>
                  <SelectItem value="guideline">Hướng dẫn</SelectItem>
                  <SelectItem value="circular">Thông tư</SelectItem>
                  <SelectItem value="decision">Quyết định</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mức độ</Label>
              <Select name="urgency" defaultValue="normal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="important">Quan trọng</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phạm vi</Label>
            <Select name="target" defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toàn hệ thống</SelectItem>
                <SelectItem value="branch">Theo chi nhánh</SelectItem>
                <SelectItem value="department">Theo phòng ban</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Tóm tắt</Label>
            <Textarea id="summary" name="summary" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>File PDF</Label>
            <PdfUpload
              onFileSelect={(file) => setPdfFile(file)}
              onRemove={() => setPdfFile(null)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo văn bản"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
