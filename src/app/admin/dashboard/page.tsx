import { getDashboardStats, getBranchViewCounts, getLatestDocuments } from "@/lib/actions/analytics";
import { DashboardStatCards } from "@/components/admin/dashboard-stat-cards";
import { BranchViewsChart } from "@/components/admin/branch-views-chart";
import { LatestDocuments } from "@/components/admin/latest-documents";

export default async function AdminDashboard() {
  try {
    const [stats, branchViews, latestDocs] = await Promise.all([
      getDashboardStats(),
      getBranchViewCounts(),
      getLatestDocuments(4),
    ]);

    return (
      <div className="space-y-6">
        <h1 className="text-[17px] font-extrabold text-slate-800">Dashboard Tổng quan</h1>

        <DashboardStatCards
          totalDocs={stats.totalDocs}
          totalViews={stats.totalViews}
          totalComments={stats.totalComments}
          branchCount={stats.branchCount}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <BranchViewsChart data={branchViews} />
          <LatestDocuments documents={latestDocs} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-[17px] font-extrabold text-slate-800">Dashboard Tổng quan</h1>
        <DashboardStatCards totalDocs={0} totalViews={0} totalComments={0} branchCount={0} />
        <div className="grid gap-6 lg:grid-cols-2">
          <BranchViewsChart data={[]} />
          <LatestDocuments documents={[]} />
        </div>
      </div>
    );
  }
}
