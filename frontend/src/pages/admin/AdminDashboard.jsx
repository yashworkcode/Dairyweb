import { useEffect, useState } from "react";
import { Users, ClipboardList, IndianRupee, Clock, Truck, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold text-ink-700/60 dark:text-cream-100/50">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/users/admin/analytics");
        setAnalytics(data.analytics);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;

  const breakdown = analytics?.statusBreakdown || {};

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={analytics?.totalUsers ?? 0} color="bg-milk-100 text-milk-700" />
        <StatCard icon={ClipboardList} label="Total Orders" value={analytics?.totalOrders ?? 0} color="bg-pasture-100 text-pasture-700" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${analytics?.totalRevenue ?? 0}`} color="bg-butter-300/40 text-ink-700" />
        <StatCard icon={Clock} label="Pending Orders" value={breakdown.Pending ?? 0} color="bg-red-50 text-red-500" />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Order Status Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs text-ink-700/60 dark:text-cream-100/50">Pending</p>
              <p className="font-semibold">{breakdown.Pending ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-milk-600" />
            <div>
              <p className="text-xs text-ink-700/60 dark:text-cream-100/50">Processing</p>
              <p className="font-semibold">{breakdown.Processing ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-pasture-600" />
            <div>
              <p className="text-xs text-ink-700/60 dark:text-cream-100/50">Delivered</p>
              <p className="font-semibold">{breakdown.Delivered ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
