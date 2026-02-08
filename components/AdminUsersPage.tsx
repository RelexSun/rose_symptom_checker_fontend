"use client";

import { useEffect, useState } from "react";
import type { ApiError, UpdateUserPayload, User } from "@/types";
import { userApi } from "@/lib/api";
import { ErrorMessage } from "./ErrorMessage";
import { AdminTabs } from "./AdminTabs";

interface EditableUser extends User {
  // Make some fields non-optional locally for the form
  full_name: string;
  role_id: number;
  is_active: boolean;
}

const DEFAULT_LIMIT = 10;

export function AdminUsersPage() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [limit] = useState(DEFAULT_LIMIT);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const loadUsers = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * limit;
      const result = await userApi.list({ skip, limit });

      const mapped = result
        .map((u) => ({
          ...u,
          full_name: u.full_name ?? "",
          role_id: u.role_id ?? 0,
          is_active: u.is_active,
        }))
        // Ensure results are ordered by id ascending on the client
        .sort((a, b) => a.id - b.id);

      setUsers(mapped);
      setCurrentPage(page);
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to load users. Please try again." }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      loadUsers(currentPage - 1);
    } else if (direction === "next") {
      loadUsers(currentPage + 1);
    }
  };

  const handleFieldChange = (
    id: number,
    field: keyof EditableUser,
    value: string | boolean | number
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              [field]: value,
            }
          : user
      )
    );
  };

  const handleUpdateUser = async (user: EditableUser) => {
    setUpdatingUserId(user.id);
    setError(null);

    const payload: UpdateUserPayload = {
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role_id: user.role_id,
      is_active: user.is_active,
    };

    try {
      const updated = await userApi.update(user.id, payload);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
      );
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to update user. Please try again." }
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setDeletingUserId(id);
    setError(null);

    try {
      await userApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to delete user. Please try again." }
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <AdminTabs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              User Management
            </h1>
            <p className="text-slate-600 mt-1">
              View, update, and delete users. This area is restricted to
              administrators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadUsers(1)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0114-7M19 5a9 9 0 01-14 7"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <ErrorMessage error={error} onDismiss={() => setError(null)} />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => {
                const isUpdating = updatingUserId === user.id;
                const isDeleting = deletingUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-800 whitespace-nowrap">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <input
                        type="email"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        value={user.email}
                        onChange={(e) =>
                          handleFieldChange(user.id, "email", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        value={user.username}
                        onChange={(e) =>
                          handleFieldChange(user.id, "username", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        value={user.full_name}
                        onChange={(e) =>
                          handleFieldChange(user.id, "full_name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        value={user.role_id}
                        onChange={(e) =>
                          handleFieldChange(
                            user.id,
                            "role_id",
                            Number(e.target.value) || 0
                          )
                        }
                      />
                      {user.role_name && (
                        <div className="mt-1 text-[11px] text-slate-500">
                          {user.role_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(user.id, "is_active", !user.is_active)
                        }
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            user.is_active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {user.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-800 whitespace-nowrap text-xs">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateUser(user)}
                          disabled={isUpdating || isDeleting}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting || isUpdating}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <p className="text-xs text-slate-500">
            Showing {users.length} user{users.length === 1 ? "" : "s"} on page{" "}
            <span className="font-semibold text-slate-700">{currentPage}</span>.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange("prev")}
              disabled={loading || currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{currentPage}</span>
            </span>
            <button
              type="button"
              onClick={() => handlePageChange("next")}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

