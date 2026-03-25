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
        setError(typeof result.error === "string" ? result.error : "Loi tao van ban");
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
          <DialogTitle>Tao van ban moi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc_number">So van ban</Label>
            <Input id="doc_number" name="doc_number" placeholder="VB-2026-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Tieu de *</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Loai van ban</Label>
              <Select name="doc_type" defaultValue="policy">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy">Chinh sach</SelectItem>
                  <SelectItem value="regulation">Quy dinh</SelectItem>
                  <SelectItem value="guideline">Huong dan</SelectItem>
                  <SelectItem value="circular">Cong van</SelectItem>
                  <SelectItem value="decision">Quyet dinh</SelectItem>
                  <SelectItem value="other">Khac</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Muc do</Label>
              <Select name="urgency" defaultValue="normal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Binh thuong</SelectItem>
                  <SelectItem value="important">Quan trong</SelectItem>
                  <SelectItem value="urgent">Khan cap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pham vi</Label>
            <Select name="target" defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toan he thong</SelectItem>
                <SelectItem value="branch">Theo chi nhanh</SelectItem>
                <SelectItem value="department">Theo phong ban</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Tom tat</Label>
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
              Huy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Dang tao..." : "Tao van ban"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
