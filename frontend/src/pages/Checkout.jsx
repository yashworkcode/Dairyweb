import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, ExternalLink } from "lucide-react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const subscriptionOptions = [
  { value: "None", label: "One-time order" },
  { value: "Daily", label: "Daily delivery" },
  { value: "Weekly", label: "Weekly delivery" },
  { value: "Monthly", label: "Monthly delivery" },
];

const buildGoogleMapLink = (address) => {
  if (!address.trim()) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
};

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919506236287";

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    subscriptionType: "None",
    paymentMethod: "COD",
  });
  const [submitting, setSubmitting] = useState(false);

  const mapLink = buildGoogleMapLink(form.address);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) {
      toast.error("Please fill in your name, phone and address");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...form,
      };
      const { data } = await api.post("/orders", payload);

      toast.success("Order placed successfully!");

      // WhatsApp order confirmation
      const summary = items.map((i) => `${i.name} x${i.quantity}`).join(", ");
      const waMessage = encodeURIComponent(
        `New Vaishnavi Milk Dairy order #${data.order._id.slice(-6)}\nItems: ${summary}\nTotal: ₹${totalPrice}\nAddress: ${form.address}`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${waMessage}`, "_blank");

      clearCart();
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-ink-700/70 dark:text-cream-100/60">Your cart is empty. Add products before checking out.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-semibold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-5 p-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Full name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} className="input-field" placeholder="Asha Verma" />
            </div>
            <div>
              <label className="label-text">Phone number</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className="label-text">Email (optional)</label>
            <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label className="label-text">Full delivery address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="House no., street, locality, city, pincode"
            />
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-milk-600 hover:underline dark:text-milk-300"
              >
                <MapPin className="h-3.5 w-3.5" /> Open in Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div>
            <label className="label-text">Delivery plan</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {subscriptionOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm((prev) => ({ ...prev, subscriptionType: opt.value }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    form.subscriptionType === opt.value
                      ? "border-pasture-600 bg-pasture-50 text-pasture-700 dark:border-gold-400 dark:bg-noir-800 dark:text-gold-300"
                      : "border-cream-200 dark:border-noir-700 text-ink-700/70 dark:text-cream-100/60 hover:border-pasture-300 dark:hover:border-gold-400/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">Payment method</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "COD", label: "Cash on Delivery" },
                { value: "Online", label: "Online Payment" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: opt.value }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    form.paymentMethod === opt.value
                      ? "border-milk-600 bg-milk-50 text-milk-700 dark:border-milk-400 dark:bg-noir-800 dark:text-milk-300"
                      : "border-cream-200 dark:border-noir-700 text-ink-700/70 dark:text-cream-100/60 hover:border-milk-300 dark:hover:border-milk-400/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Placing order..." : `Place Order · ₹${totalPrice}`}
          </button>
        </form>

        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Order Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-ink-700/80 dark:text-cream-100/70">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-cream-200 dark:border-noir-700 pt-4 font-semibold">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
