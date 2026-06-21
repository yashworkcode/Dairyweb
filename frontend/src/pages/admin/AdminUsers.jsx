import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data.users || []);
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) return <Loader label="Loading users" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">All Users</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-200 dark:border-noir-700 text-xs uppercase text-ink-700/50 dark:text-cream-100/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-cream-200 dark:border-noir-700 last:border-0">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3">{u.email || "—"}</td>
                <td className="px-4 py-3 text-ink-700/70 dark:text-cream-100/60">@{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.role === "admin" ? "bg-butter-300/50 text-ink-700" : "bg-cream-200 dark:bg-noir-800 text-ink-700/70 dark:text-cream-100/60"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-700/60 dark:text-cream-100/50">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
