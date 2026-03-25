"use client";

import { useEffect, useState, useRef } from "react";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { createClient } from "@/lib/supabase/client";
import { trackProgress } from "@/lib/actions/progress";
import type { DocumentFaq } from "@/lib/supabase/types";

type Props = {
  documentId: string;
};

export function DocumentFaqTab({ documentId }: Props) {
  const [faqs, setFaqs] = useState<DocumentFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("document_faqs")
      .select("*")
      .eq("document_id", documentId)
      .order("sort_order")
      .then(({ data }) => {
        setFaqs((data ?? []) as DocumentFaq[]);
        setLoading(false);
      });
  }, [documentId]);

  function handleAccordionOpen() {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackProgress(documentId, "viewed_faq");
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <HelpCircle className="h-8 w-8" />
        <p>Chua co FAQ cho van ban nay</p>
      </div>
    );
  }

  return (
    <Accordion onValueChange={handleAccordionOpen}>
      {faqs.map((faq, i) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                {i + 1}
              </span>
              {faq.question}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="whitespace-pre-wrap pl-7">{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
