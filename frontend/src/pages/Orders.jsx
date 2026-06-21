import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, MapPin, ExternalLink, PackageOpen } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";

const statusSteps = ["Pending", "Processing", "Delivered"];

const StatusTracker = ({ status }) => {
  if (status === "Cancelled") {
    return <span className="badge bg-red-100 text-red-600">Cancelled</span>;
  }

  const currentIndex = statusSteps.indexOf(status);

  return (
    <div className="flex items-center">
      {statusSteps.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                idx <= currentIndex ? "bg-pasture-600 text-white" : "bg-cream-200 dark:bg-noir-800 text-ink-700/50 dark:text-cream-100/40"
              }`}
            >
              {idx < currentIndex ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </div>
            <span className={`mt-1 text-[10px] font-semibold ${idx <= currentIndex ? "text-pasture-700 dark:text-gold-400" : "text-ink-700/40 dark:text-cream-100/30"}`}>
              {step}
            </span>
          </div>
          {idx < statusSteps.length - 1 && (
            <div className={`mx-1 h-0.5 w-10 sm:w-16 ${idx < currentIndex ? "bg-pasture-600" : "bg-cream-200 dark:bg-noir-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/user");
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) return <Loader label="Loading your orders" />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <PackageOpen className="mx-auto h-10 w-10 text-ink-700/30 dark:text-cream-100/20" />
        <h1 className="mt-3 text-2xl font-semibold">No orders yet</h1>
        <p className="mt-2 text-sm text-ink-700/70 dark:text-cream-100/60">Place your first order to see it tracked here.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-semibold">My Orders</h1>

      <div className="space-y-5">
        {orders.map((order) => (
          <div key={order._id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 dark:border-noir-700 pb-4">
              <div>
                <p className="text-xs text-ink-700/50 dark:text-cream-100/40">Order #{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-ink-700/50 dark:text-cream-100/40">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              {order.subscriptionType !== "None" && (
                <span className="badge bg-milk-100 text-milk-700">{order.subscriptionType} subscription</span>
              )}
            </div>

            <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <StatusTracker status={order.status} />
              <p className="font-semibold text-pasture-700 dark:text-gold-400">₹{order.totalPrice}</p>
            </div>

            <div className="space-y-1 border-t border-cream-200 dark:border-noir-700 pt-3 text-sm text-ink-700/80 dark:text-cream-100/70">
              {order.products.map((p, idx) => (
                <p key={idx}>
                  {p.name} × {p.quantity} — ₹{p.price * p.quantity}
                </p>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-cream-200 dark:border-noir-700 pt-3 text-xs text-ink-700/60 dark:text-cream-100/50">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {order.address}
              </span>
              {order.googleMapLink && (
                <a
                  href={order.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-milk-600 hover:underline dark:text-milk-300"
                >
                  View on map <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
