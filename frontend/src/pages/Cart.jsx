import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-700/70 dark:text-cream-100/60">Add some fresh dairy to get started.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-semibold">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="card flex items-center gap-4 p-4">
              <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-xs text-ink-700/60 dark:text-cream-100/50">
                  ₹{item.price} / {item.unit}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-cream-200 dark:border-noir-700 px-2 py-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="rounded-full p-1 hover:bg-cream-200 dark:hover:bg-noir-800"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="rounded-full p-1 hover:bg-cream-200 dark:hover:bg-noir-800"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="w-20 text-right font-semibold text-pasture-700 dark:text-gold-400">₹{item.price * item.quantity}</p>

              <button
                onClick={() => removeFromCart(item.productId)}
                className="rounded-full p-2 text-ink-700/50 dark:text-cream-100/40 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Order Summary</h2>
          <div className="flex justify-between text-sm text-ink-700/70 dark:text-cream-100/60">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-700/70 dark:text-cream-100/60">
            <span>Delivery</span>
            <span className="text-pasture-600 dark:text-gold-300">Free</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-cream-200 dark:border-noir-700 pt-3 font-semibold">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary mt-5 w-full">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
