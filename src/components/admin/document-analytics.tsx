import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentAnalytics } from "@/lib/actions/analytics";

type Props = {
  documentId: string;
};

export async function DocumentAnalytics({ documentId }: Props) {
  const { viewsByBranch, quizCompletionRate, totalViews } = await getDocumentAnalytics(documentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Thong ke</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center rounded-lg bg-blue-50 p-3">
            <p className="text-2xl font-bold text-blue-700">{totalViews}</p>
            <p className="text-xs text-muted-foreground">Tong luot xem</p>
          </div>
          <div className="text-center rounded-lg bg-green-50 p-3">
            <p className="text-2xl font-bold text-green-700">{quizCompletionRate}%</p>
            <p className="text-xs text-muted-foreground">Da lam quiz</p>
          </div>
        </div>

        {/* Views by branch */}
        {viewsByBranch.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Luot xem theo chi nhanh</p>
            <div className="space-y-1.5">
              {viewsByBranch.slice(0, 8).map((item) => {
                const maxViews = viewsByBranch[0].views;
                const width = maxViews > 0 ? (item.views / maxViews) * 100 : 0;

                return (
                  <div key={item.branch} className="flex items-center gap-2 text-xs">
                    <span className="w-24 truncate text-muted-foreground">{item.branch}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium">{item.views}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewsByBranch.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">Chua co luot xem</p>
        )}
      </CardContent>
    </Card>
  );
}
