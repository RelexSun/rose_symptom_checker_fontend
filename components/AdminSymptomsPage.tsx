"use client";

import { useEffect, useState } from "react";
import type { ApiError, Symptom, SymptomPayload, SymptomSeverity } from "@/types";
import { symptomApi } from "@/lib/api";
import { ErrorMessage } from "./ErrorMessage";
import { AdminTabs } from "./AdminTabs";

interface EditableSymptom extends Symptom {}

const DEFAULT_LIMIT = 10;

const severityOptions: SymptomSeverity[] = ["mild", "moderate", "severe"];

export function AdminSymptomsPage() {
  const [symptoms, setSymptoms] = useState<EditableSymptom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [limit] = useState(DEFAULT_LIMIT);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">(
    "all"
  );

  const [newSymptom, setNewSymptom] = useState<SymptomPayload>({
    code: "",
    name: "",
    description: "",
    category: "",
    severity: "moderate",
    is_active: true,
    display_order: 0,
  });

  const loadSymptoms = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * limit;

      const is_activeParam =
        filterActive === "all"
          ? null
          : filterActive === "active"
          ? true
          : false;

      const result = await symptomApi.list({
        skip,
        limit,
        is_active: is_activeParam,
      });

      // Ensure results are ordered by id ascending on the client
      setSymptoms([...result].sort((a, b) => a.id - b.id));
      setCurrentPage(page);
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to load symptoms. Please try again." }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadSymptoms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reload when filter changes
    loadSymptoms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterActive]);

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      loadSymptoms(currentPage - 1);
    } else if (direction === "next") {
      loadSymptoms(currentPage + 1);
    }
  };

  const handleFieldChange = (
    id: number,
    field: keyof EditableSymptom,
    value: string | boolean | number
  ) => {
    setSymptoms((prev) =>
      prev.map((symptom) =>
        symptom.id === id
          ? {
              ...symptom,
              [field]: value,
            }
          : symptom
      )
    );
  };

  const handleSaveSymptom = async (symptom: EditableSymptom) => {
    setSavingId(symptom.id);
    setError(null);

    const payload: SymptomPayload = {
      code: symptom.code,
      name: symptom.name,
      description: symptom.description,
      category: symptom.category,
      severity: symptom.severity,
      is_active: symptom.is_active,
      display_order: symptom.display_order,
    };

    try {
      const updated = await symptomApi.update(symptom.id, payload);
      setSymptoms((prev) =>
        prev.map((s) => (s.id === symptom.id ? { ...s, ...updated } : s))
      );
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to update symptom. Please try again." }
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSymptom = async (id: number) => {
    if (!confirm("Are you sure you want to delete this symptom?")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await symptomApi.delete(id);
      setSymptoms((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to delete symptom. Please try again." }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSymptom = async () => {
    setSavingId("new");
    setError(null);

    try {
      const created = await symptomApi.create(newSymptom);
      setSymptoms((prev) => [created, ...prev]);
      setNewSymptom({
        code: "",
        name: "",
        description: "",
        category: "",
        severity: "moderate",
        is_active: true,
        display_order: 0,
      });
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to create symptom. Please check the form and try again." }
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <AdminTabs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Symptom Management
            </h1>
            <p className="text-slate-600 mt-1">
              Create, update, and delete symptoms used by the diagnosis engine. Admin only.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterActive}
              onChange={(e) =>
                setFilterActive(e.target.value as "all" | "active" | "inactive")
              }
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <button
              type="button"
              onClick={() => loadSymptoms(1)}
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

        {/* Create new symptom */}
        <div className="mb-8 border border-emerald-100 bg-emerald-50/60 rounded-xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-emerald-900 mb-3">
            Create New Symptom
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Code"
              className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={newSymptom.code}
              onChange={(e) =>
                setNewSymptom((prev) => ({ ...prev, code: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Name"
              className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={newSymptom.name}
              onChange={(e) =>
                setNewSymptom((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Category"
              className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={newSymptom.category}
              onChange={(e) =>
                setNewSymptom((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={newSymptom.severity}
                onChange={(e) =>
                  setNewSymptom((prev) => ({
                    ...prev,
                    severity: e.target.value as SymptomSeverity,
                  }))
                }
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="w-20 px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Order"
                value={newSymptom.display_order}
                onChange={(e) =>
                  setNewSymptom((prev) => ({
                    ...prev,
                    display_order: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3"
            rows={2}
            value={newSymptom.description}
            onChange={(e) =>
              setNewSymptom((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center text-xs text-emerald-900">
              <input
                type="checkbox"
                className="mr-2 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                checked={newSymptom.is_active}
                onChange={(e) =>
                  setNewSymptom((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
              Active
            </label>
            <button
              type="button"
              onClick={handleCreateSymptom}
              disabled={savingId === "new"}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingId === "new" ? "Creating..." : "Create Symptom"}
            </button>
          </div>
        </div>

        {/* Existing symptoms table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {symptoms.map((symptom) => {
                const isSaving = savingId === symptom.id;
                const isDeleting = deletingId === symptom.id;

                return (
                  <tr key={symptom.id} className="hover:bg-slate-50/70 align-top">
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap text-xs">
                      {symptom.id}
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        value={symptom.code}
                        onChange={(e) =>
                          handleFieldChange(symptom.id, "code", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        value={symptom.name}
                        onChange={(e) =>
                          handleFieldChange(symptom.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        value={symptom.category}
                        onChange={(e) =>
                          handleFieldChange(symptom.id, "category", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <select
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        value={symptom.severity}
                        onChange={(e) =>
                          handleFieldChange(
                            symptom.id,
                            "severity",
                            e.target.value as SymptomSeverity
                          )
                        }
                      >
                        {severityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(
                            symptom.id,
                            "is_active",
                            !symptom.is_active
                          )
                        }
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          symptom.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            symptom.is_active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {symptom.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
                      <input
                        type="number"
                        className="w-16 px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        value={symptom.display_order}
                        onChange={(e) =>
                          handleFieldChange(
                            symptom.id,
                            "display_order",
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <textarea
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        rows={2}
                        value={symptom.description}
                        onChange={(e) =>
                          handleFieldChange(
                            symptom.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveSymptom(symptom)}
                          disabled={isSaving || isDeleting}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSymptom(symptom.id)}
                          disabled={isDeleting || isSaving}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {symptoms.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-slate-500 text-sm"
                  >
                    No symptoms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <p className="text-xs text-slate-500">
            Showing {symptoms.length} symptom
            {symptoms.length === 1 ? "" : "s"} on page{" "}
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

