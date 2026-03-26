"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, MessageSquare, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { globalSearch } from "@/lib/actions/search";

type SearchResult = {
  documents: { id: string; title: string; doc_number: string | null; doc_type: string; status: string }[];
  posts: { id: string; title: string | null; content_preview: string; tags: string[] }[];
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await globalSearch(query);
      setResults(res);
      setOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasResults = results && (results.documents.length > 0 || results.posts.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="pl-8 pr-8 h-8 text-sm"
          aria-label="Tìm kiếm tài liệu và bài viết"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-white shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Đang tìm...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy kết quả</div>
          ) : (
            <>
              {results!.documents.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">Tài liệu</p>
                  {results!.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.status === "published" ? `/employee/docs/${doc.id}` : `/admin/docs/${doc.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{doc.title}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{doc.doc_type}</Badge>
                    </a>
                  ))}
                </div>
              )}
              {results!.posts.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground border-t">Bài viết</p>
                  {results!.posts.map((post) => (
                    <a
                      key={post.id}
                      href="/employee/community"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{post.title || post.content_preview}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
