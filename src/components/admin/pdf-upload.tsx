"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type PdfUploadProps = {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  currentFileName?: string | null;
};

export function PdfUpload({ onFileSelect, onRemove, currentFileName }: PdfUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (file.type !== "application/pdf") return;
    if (file.size > 20 * 1024 * 1024) return;
    setSelectedFile(file);
    onFileSelect(file);
  }

  const displayName = selectedFile?.name || currentFileName;

  if (displayName) {
    return (
      <div className="flex items-center gap-3 rounded-md border p-3">
        <FileText className="h-5 w-5 text-red-500 shrink-0" />
        <span className="text-sm truncate flex-1">{displayName}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setSelectedFile(null);
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 cursor-pointer transition-colors ${
        dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-300"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="h-8 w-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-600">Keo tha hoac click de tai len PDF</p>
      <p className="text-xs text-gray-400 mt-1">Toi da 20MB</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
