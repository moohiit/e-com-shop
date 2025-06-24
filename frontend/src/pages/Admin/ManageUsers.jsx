import React, { useState } from "react";
import {
  useAdminGetAllUsersQuery,
  useAdminDeleteUserMutation,
  useAdminToggleUserMutation,
} from "../../features/admin/adminApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function ManageUsers() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, error } = useAdminGetAllUsersQuery({
    keyword: search,
    sortBy,
    order,
    page,
    limit,
  });
  const [deleteUser] = useAdminDeleteUserMutation();
  const [toggleUser] = useAdminToggleUserMutation();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
        toast.success("User deleted successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleUser(id).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle user status");
    }
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* Search, Sort */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email..."
          className="border px-3 py-2 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-2 py-2 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option value="createdAt" className="dark:bg-gray-800">
            Created At
          </option>
          <option value="name" className="dark:bg-gray-800">
            Name
          </option>
          <option value="email" className="dark:bg-gray-800">
            Email
          </option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border px-2 py-2 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option value="desc" className="dark:bg-gray-800">
            Desc
          </option>
          <option value="asc" className="dark:bg-gray-800">
            Asc
          </option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : isError ? (
        <div className="p-4 text-red-500">
          Error: {error?.data?.message || error?.message}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full bg-white dark:bg-gray-800 border">
              <thead className="bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-left">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((user, idx) => (
                  <tr
                    key={user._id}
                    className="border-b text-sm dark:text-gray-200"
                  >
                    <td className="p-3">{(page - 1) * limit + idx + 1}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3">
                      {user.isActive ? (
                        <span className="text-green-500">Active</span>
                      ) : (
                        <span className="text-red-500">Inactive</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggle(user._id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                      >
                        {user.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded bg-gray-200 dark:bg-gray-700"
            >
              Prev
            </button>
            <span className="px-2 py-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded bg-gray-200 dark:bg-gray-700"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ManageUsers;
