import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const statuses = ["All", "Pending", "Processing", "Delivered", "Cancelled"];

const statusBadge = {
  Pending: "bg-red-100 text-red-600",
  Processing: "bg-milk-100 text-milk-700",
  Delivered: "bg-pasture-100 text-pasture-700 dark:text-gold-400",
  Cancelled: "bg-cream-200 text-ink-700/60 dark:bg-noir-800 dark:text-cream-100/50",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders/admin", { params: { status: filter } });
      setOrders(data.orders || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/status/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error("Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Manage Orders</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === s ? "bg-pasture-600 text-white dark:bg-gold-400 dark:text-noir-950" : "bg-cream-200 text-ink-700 hover:bg-pasture-100 dark:bg-noir-800 dark:text-cream-100/70 dark:hover:bg-noir-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading orders" />
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-700/60 dark:text-cream-100/50">No orders found for this filter.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-700/50 dark:text-cream-100/40">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="font-semibold">{order.fullName} · {order.phone}</p>
                  <p className="text-xs text-ink-700/60 dark:text-cream-100/50">{order.userId?.email}</p>
                </div>
                <span className={`badge ${statusBadge[order.status]}`}>{order.status}</span>
              </div>

              <div className="mt-3 space-y-1 border-t border-cream-200 dark:border-noir-700 pt-3 text-sm text-ink-700/80 dark:text-cream-100/70">
                {order.products.map((p, idx) => (
                  <p key={idx}>{p.name} × {p.quantity} — ₹{p.price * p.quantity}</p>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 dark:border-noir-700 pt-3">
                <div className="text-xs text-ink-700/60 dark:text-cream-100/50">
                  <p>{order.address}</p>
                  {order.googleMapLink && (
                    <a href={order.googleMapLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-milk-600 hover:underline dark:text-milk-300">
                      View on map <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-semibold text-pasture-700 dark:text-gold-400">₹{order.totalPrice}</p>
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="rounded-full border border-cream-200 dark:border-noir-700 bg-white px-3 py-1.5 text-xs font-semibold dark:bg-noir-800 dark:text-cream-100"
                  >
                    {["Pending", "Processing", "Delivered", "Cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
