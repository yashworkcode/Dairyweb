import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const categories = ["All", "Milk", "Curd", "Paneer", "Ghee", "Butter", "Cheese", "Other"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products", { params: { category, search } });
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(loadProducts, 300);
    return () => clearTimeout(debounce);
  }, [category, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Our Products</h1>
        <p className="mt-1 text-sm text-ink-700/70 dark:text-cream-100/60">Live prices, updated daily by our dairy partners.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                category === c ? "bg-pasture-600 text-white dark:bg-gold-400 dark:text-noir-950" : "bg-cream-200 text-ink-700 hover:bg-pasture-100 dark:bg-noir-800 dark:text-cream-100/70 dark:hover:bg-noir-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30" />
          <input
            className="input-field pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Loading products" />
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-700/60 dark:text-cream-100/50">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
