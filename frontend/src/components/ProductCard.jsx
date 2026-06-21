import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

const categoryColors = {
  Milk: "bg-milk-100 text-milk-700",
  Curd: "bg-pasture-100 text-pasture-700",
  Paneer: "bg-butter-300/40 text-ink-700",
  Ghee: "bg-butter-300/60 text-ink-700",
  Butter: "bg-butter-300/50 text-ink-700",
  Cheese: "bg-milk-100 text-milk-700",
  Other: "bg-cream-200 text-ink-700",
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-soft dark:hover:shadow-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200 dark:bg-noir-800">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`badge absolute left-3 top-3 ${categoryColors[product.category] || categoryColors.Other}`}>
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-ink dark:text-cream-50">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-ink-700/70 dark:text-cream-100/60">{product.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-pasture-700 dark:text-gold-400">₹{product.price}</span>
            <span className="ml-1 text-xs text-ink-700/60 dark:text-cream-100/50">/ {product.unit}</span>
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            className="flex items-center gap-1 rounded-full bg-pasture-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-pasture-700 active:scale-95 dark:bg-gold-400 dark:text-noir-950 dark:hover:bg-gold-300"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
