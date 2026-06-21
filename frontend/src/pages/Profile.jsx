import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, ExternalLink, Trash2, Plus } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [label, setLabel] = useState("Home");
  const [fullAddress, setFullAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setAddresses(data.user.addresses || []);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    loadProfile();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!fullAddress.trim()) {
      toast.error("Please enter an address");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/users/address", { label, fullAddress, isDefault: addresses.length === 0 });
      setAddresses(data.addresses);
      setFullAddress("");
      toast.success("Address saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    try {
      const { data } = await api.delete(`/users/address/${addressId}`);
      setAddresses(data.addresses);
      toast.success("Address removed");
    } catch (error) {
      toast.error("Could not remove address");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-semibold">My Profile</h1>
      <p className="mb-6 text-sm text-ink-700/70 dark:text-cream-100/60">{user?.name} · @{user?.username}</p>

      <div className="card mb-6 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Saved addresses</h2>

        {addresses.length === 0 ? (
          <p className="text-sm text-ink-700/60 dark:text-cream-100/50">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr._id} className="flex items-start justify-between rounded-xl border border-cream-200 dark:border-noir-700 p-4">
                <div>
                  <p className="text-xs font-semibold text-pasture-700 dark:text-gold-400">{addr.label} {addr.isDefault && "· Default"}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-700/80 dark:text-cream-100/70">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {addr.fullAddress}
                  </p>
                  {addr.googleMapLink && (
                    <a
                      href={addr.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-milk-600 hover:underline dark:text-milk-300"
                    >
                      Open in Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <button onClick={() => handleDelete(addr._id)} className="rounded-full p-2 text-ink-700/50 dark:text-cream-100/40 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Add a new address</h2>
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="label-text">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="input-field" placeholder="Home / Work" />
          </div>
          <div>
            <label className="label-text">Full address</label>
            <textarea
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="House no., street, locality, city, pincode"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <Plus className="h-4 w-4" /> {saving ? "Saving..." : "Save address"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
