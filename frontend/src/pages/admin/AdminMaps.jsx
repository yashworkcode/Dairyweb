import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, MapPin } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const AdminMaps = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAddress, setActiveAddress] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/admin");
        setOrders(data.orders || []);
        setActiveAddress(data.orders?.[0]?.address || null);
      } catch (error) {
        toast.error("Failed to load delivery locations");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) return <Loader label="Loading delivery locations" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Delivery Locations</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card max-h-[560px] overflow-y-auto lg:col-span-1">
          {orders.length === 0 ? (
            <p className="p-5 text-sm text-ink-700/60 dark:text-cream-100/50">No delivery addresses yet.</p>
          ) : (
            orders.map((order) => (
              <button
                key={order._id}
                onClick={() => setActiveAddress(order.address)}
                className={`flex w-full items-start gap-2.5 border-b border-cream-200 dark:border-noir-700 p-4 text-left text-sm transition-colors last:border-0 hover:bg-pasture-50 dark:hover:bg-noir-800 ${
                  activeAddress === order.address ? "bg-pasture-50 dark:bg-noir-800" : ""
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pasture-600" />
                <div>
                  <p className="font-semibold">{order.fullName}</p>
                  <p className="text-xs text-ink-700/60 dark:text-cream-100/50">{order.address}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          {activeAddress ? (
            <>
              <iframe
                title="Delivery location map"
                width="100%"
                height="460"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeAddress)}&output=embed`}
              />
              <div className="flex items-center justify-between p-4">
                <p className="text-sm text-ink-700/70 dark:text-cream-100/60">{activeAddress}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-milk-600 hover:underline dark:text-milk-300"
                >
                  Open in Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          ) : (
            <p className="p-10 text-center text-sm text-ink-700/60 dark:text-cream-100/50">Select an order to preview its location.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMaps;
