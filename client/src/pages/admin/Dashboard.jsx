import { WalletCards, Clock, CheckCircle, Users } from "lucide-react";
import { SummaryCard, Card } from "../../components/ui";

function Dashboard() {
  return (
    <>
      <div className="responsive-grid-4">
        <SummaryCard
          title="Total Collections"
          value="₱24,500"
          icon={WalletCards}
          note="Across all active collections"
        />

        <SummaryCard
          title="Pending Payments"
          value="18"
          icon={Clock}
          note="Needs student follow-up"
        />

        <SummaryCard
          title="Paid Students"
          value="42"
          icon={CheckCircle}
          note="Updated today"
        />

        <SummaryCard
          title="Total Students"
          value="60"
          icon={Users}
          note="Enrolled in active sections"
        />
      </div>

      <div style={{ marginTop: "24px" }}>
        <Card>
          <h2>Collection Overview</h2>
          <p className="text-muted" style={{ marginTop: "6px" }}>
            AI summaries, payment progress, and collection insights will appear here.
          </p>
        </Card>
      </div>
    </>
  );
}

export default Dashboard;