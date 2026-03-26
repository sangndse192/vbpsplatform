"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentDetailTab } from "./document-detail-tab";
import { DocumentFaqTab } from "./document-faq-tab";
import { DocumentQuizTab } from "./document-quiz-tab";
import { DocumentCommentsTab } from "./document-comments-tab";
import type { Document, UserProgress } from "@/lib/supabase/types";

type Props = {
  document: Document;
  progress: UserProgress | null;
  initialTab: string;
  counts: {
    faqs: number;
    quizzes: number;
    comments: number;
  };
};

const TABS = ["detail", "faq", "quiz", "comments"] as const;

export function DocumentDetailClient({ document, progress, initialTab, counts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? initialTab;

  function handleTabChange(value: string | number | null) {
    if (value === null) return;
    const tab = String(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/employee/docs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold truncate">{document.title}</h1>
          {document.doc_number && (
            <p className="text-sm text-muted-foreground">{document.doc_number}</p>
          )}
        </div>
      </div>

      <Tabs
        defaultValue={TABS.includes(currentTab as typeof TABS[number]) ? currentTab : "detail"}
        onValueChange={handleTabChange}
      >
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="detail">Chi tiết</TabsTrigger>
          <TabsTrigger value="faq" className="gap-1">
            FAQ
            {counts.faqs > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                {counts.faqs}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1">
            Quiz
            {counts.quizzes > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                {counts.quizzes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-1">
            Góp ý
            {counts.comments > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                {counts.comments}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="mt-4">
          <DocumentDetailTab document={document} progress={progress} />
        </TabsContent>
        <TabsContent value="faq" className="mt-4">
          <DocumentFaqTab documentId={document.id} />
        </TabsContent>
        <TabsContent value="quiz" className="mt-4">
          <DocumentQuizTab documentId={document.id} />
        </TabsContent>
        <TabsContent value="comments" className="mt-4">
          <DocumentCommentsTab documentId={document.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
