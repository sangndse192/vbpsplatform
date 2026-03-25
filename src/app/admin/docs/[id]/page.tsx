import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentDetail } from "@/components/admin/document-detail";
import { FaqManager } from "@/components/admin/faq-manager";
import { QuizManager } from "@/components/admin/quiz-manager";
import { getDocumentById } from "@/lib/actions/documents";
import { getFaqsByDocument } from "@/lib/actions/faqs";
import { getQuizzesByDocument } from "@/lib/actions/quizzes";
import { getSignedUrl } from "@/lib/actions/storage";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminDocDetailPage({ params }: Props) {
  const { id } = await params;

  const [docResult, faqsResult, quizzesResult] = await Promise.all([
    getDocumentById(id),
    getFaqsByDocument(id),
    getQuizzesByDocument(id),
  ]);

  if (docResult.error || !docResult.data) notFound();

  const doc = docResult.data;
  let pdfUrl: string | null = null;
  if (doc.file_url) {
    const urlResult = await getSignedUrl(doc.file_url);
    pdfUrl = urlResult.data ?? null;
  }

  return (
    <div className="space-y-6">
      <DocumentDetail document={doc} pdfUrl={pdfUrl} />

      <Tabs defaultValue="faqs">
        <TabsList>
          <TabsTrigger value="faqs">FAQ ({faqsResult.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz ({quizzesResult.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="faqs" className="mt-4">
          <FaqManager documentId={id} faqs={faqsResult.data ?? []} />
        </TabsContent>
        <TabsContent value="quizzes" className="mt-4">
          <QuizManager documentId={id} quizzes={quizzesResult.data ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
