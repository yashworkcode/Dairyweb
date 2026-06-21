import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const categories = ["Milk", "Curd", "Paneer", "Ghee", "Butter", "Cheese", "Other"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  unit: "",
  category: "Milk",
  image: "",
  stock: 100,
  isSubscriptionEligible: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data.products || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      unit: product.unit,
      category: product.category,
      image: product.image,
      stock: product.stock,
      isSubscriptionEligible: product.isSubscriptionEligible,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setShowForm(false);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (error) {
      toast.error("Could not delete product");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Products</h1>
        <button onClick={openCreateForm} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{editingId ? "Edit Product" : "New Product"}</h2>
            <button onClick={() => setShowForm(false)} className="rounded-full p-1.5 hover:bg-cream-200 dark:hover:bg-noir-800">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Price (₹)</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Unit (e.g. 500 ml)</label>
              <input name="unit" value={form.unit} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label-text">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label-text">Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
              <input type="checkbox" name="isSubscriptionEligible" checked={form.isSubscriptionEligible} onChange={handleChange} />
              Eligible for subscriptions
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loader label="Loading products" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cream-200 dark:border-noir-700 text-xs uppercase text-ink-700/50 dark:text-cream-100/40">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-cream-200 dark:border-noir-700 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-semibold">{p.name}</span>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">₹{p.price} / {p.unit}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditForm(p)} className="mr-2 rounded-full p-2 hover:bg-milk-50 text-milk-600 dark:hover:bg-milk-500/10 dark:text-milk-300">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="rounded-full p-2 hover:bg-red-50 text-red-500 dark:hover:bg-red-500/10 dark:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
