import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LatestDoc = {
  id: string;
  title: string;
  doc_number: string | null;
  status: string;
  created_at: string;
};

type Props = {
  documents: LatestDoc[];
};

const statusDot: Record<string, string> = {
  published: "bg-green-500",
  draft: "bg-yellow-400",
  paused: "bg-gray-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Vua xong";
  if (hours < 24) return `${hours}h truoc`;
  const days = Math.floor(hours / 24);
  return `${days}d truoc`;
}

export function LatestDocuments({ documents }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tai lieu moi nhat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chua co tai lieu</p>
        ) : (
          documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/admin/docs/${doc.id}`}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
            >
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusDot[doc.status] ?? statusDot.draft}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                {doc.doc_number && (
                  <p className="text-xs text-muted-foreground">{doc.doc_number}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {timeAgo(doc.created_at)}
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
