"use client";

import { useEffect, useState } from "react";
import type { ApiError, Outcome, OutcomePayload } from "@/types";
import { outcomeApi } from "@/lib/api";
import { ErrorMessage } from "./ErrorMessage";
import { AdminTabs } from "./AdminTabs";

interface EditableOutcome extends Outcome {}

const DEFAULT_LIMIT = 10;

export function AdminOutcomesPage() {
  const [outcomes, setOutcomes] = useState<EditableOutcome[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [limit] = useState(DEFAULT_LIMIT);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">(
    "all"
  );

  const [newOutcome, setNewOutcome] = useState<OutcomePayload>({
    code: "",
    name: "",
    scientific_name: "",
    description: "",
    severity: "medium",
    treatment: "",
    prevention: "",
    is_active: true,
  });

  const loadOutcomes = async (page: number) => {
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

      const result = await outcomeApi.list({
        skip,
        limit,
        is_active: is_activeParam,
      });

      // Ensure ordered by id ascending
      setOutcomes([...result].sort((a, b) => a.id - b.id));
      setCurrentPage(page);
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to load outcomes. Please try again." }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadOutcomes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reload when filter changes
    loadOutcomes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterActive]);

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      loadOutcomes(currentPage - 1);
    } else if (direction === "next") {
      loadOutcomes(currentPage + 1);
    }
  };

  const handleFieldChange = (
    id: number,
    field: keyof EditableOutcome,
    value: string | boolean
  ) => {
    setOutcomes((prev) =>
      prev.map((outcome) =>
        outcome.id === id
          ? {
              ...outcome,
              [field]: value,
            }
          : outcome
      )
    );
  };

  const handleSaveOutcome = async (outcome: EditableOutcome) => {
    setSavingId(outcome.id);
    setError(null);

    const payload: OutcomePayload = {
      code: outcome.code,
      name: outcome.name,
      scientific_name: outcome.scientific_name,
      description: outcome.description,
      severity: outcome.severity,
      treatment: outcome.treatment,
      prevention: outcome.prevention,
      is_active: outcome.is_active,
    };

    try {
      const updated = await outcomeApi.update(outcome.id, payload);
      setOutcomes((prev) =>
        prev.map((o) => (o.id === outcome.id ? { ...o, ...updated } : o))
      );
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to update outcome. Please try again." }
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteOutcome = async (id: number) => {
    if (!confirm("Are you sure you want to delete this outcome?")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await outcomeApi.delete(id);
      setOutcomes((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to delete outcome. Please try again." }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateOutcome = async () => {
    setSavingId("new");
    setError(null);

    try {
      const created = await outcomeApi.create(newOutcome);
      setOutcomes((prev) => [created, ...prev].sort((a, b) => a.id - b.id));
      setNewOutcome({
        code: "",
        name: "",
        scientific_name: "",
        description: "",
        severity: "medium",
        treatment: "",
        prevention: "",
        is_active: true,
      });
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to create outcome. Please check the form and try again." }
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <AdminTabs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Outcome Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage diseases/outcomes used by the diagnosis engine. Admin only.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterActive}
              onChange={(e) =>
                setFilterActive(e.target.value as "all" | "active" | "inactive")
              }
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <button
              type="button"
              onClick={() => loadOutcomes(1)}
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

        {/* Create new outcome */}
        <div className="mb-8 border border-amber-100 bg-amber-50/60 rounded-xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-amber-900 mb-3">
            Create New Outcome
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Code"
              className="px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              value={newOutcome.code}
              onChange={(e) =>
                setNewOutcome((prev) => ({ ...prev, code: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Name"
              className="px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              value={newOutcome.name}
              onChange={(e) =>
                setNewOutcome((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Scientific name"
              className="px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              value={newOutcome.scientific_name}
              onChange={(e) =>
                setNewOutcome((prev) => ({
                  ...prev,
                  scientific_name: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Severity (e.g. low, medium, high)"
              className="px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              value={newOutcome.severity}
              onChange={(e) =>
                setNewOutcome((prev) => ({ ...prev, severity: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <textarea
              placeholder="Description"
              className="w-full px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={2}
              value={newOutcome.description}
              onChange={(e) =>
                setNewOutcome((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <textarea
              placeholder="Treatment"
              className="w-full px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={2}
              value={newOutcome.treatment}
              onChange={(e) =>
                setNewOutcome((prev) => ({
                  ...prev,
                  treatment: e.target.value,
                }))
              }
            />
            <textarea
              placeholder="Prevention"
              className="w-full px-3 py-2 border border-amber-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={2}
              value={newOutcome.prevention}
              onChange={(e) =>
                setNewOutcome((prev) => ({
                  ...prev,
                  prevention: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center text-xs text-amber-900">
              <input
                type="checkbox"
                className="mr-2 rounded border-amber-200 text-amber-600 focus:ring-amber-500"
                checked={newOutcome.is_active}
                onChange={(e) =>
                  setNewOutcome((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
              Active
            </label>
            <button
              type="button"
              onClick={handleCreateOutcome}
              disabled={savingId === "new"}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingId === "new" ? "Creating..." : "Create Outcome"}
            </button>
          </div>
        </div>

        {/* Existing outcomes table */}
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
                  Scientific Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Prevention
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {outcomes.map((outcome) => {
                const isSaving = savingId === outcome.id;
                const isDeleting = deletingId === outcome.id;

                return (
                  <tr key={outcome.id} className="hover:bg-slate-50/70 align-top">
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap text-xs">
                      {outcome.id}
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        value={outcome.code}
                        onChange={(e) =>
                          handleFieldChange(outcome.id, "code", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        value={outcome.name}
                        onChange={(e) =>
                          handleFieldChange(outcome.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        value={outcome.scientific_name}
                        onChange={(e) =>
                          handleFieldChange(
                            outcome.id,
                            "scientific_name",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        value={outcome.severity}
                        onChange={(e) =>
                          handleFieldChange(outcome.id, "severity", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(
                            outcome.id,
                            "is_active",
                            !outcome.is_active
                          )
                        }
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          outcome.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            outcome.is_active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {outcome.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <textarea
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        rows={2}
                        value={outcome.description}
                        onChange={(e) =>
                          handleFieldChange(
                            outcome.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <textarea
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        rows={2}
                        value={outcome.treatment}
                        onChange={(e) =>
                          handleFieldChange(
                            outcome.id,
                            "treatment",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <textarea
                        className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        rows={2}
                        value={outcome.prevention}
                        onChange={(e) =>
                          handleFieldChange(
                            outcome.id,
                            "prevention",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveOutcome(outcome)}
                          disabled={isSaving || isDeleting}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOutcome(outcome.id)}
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

              {outcomes.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-slate-500 text-sm"
                  >
                    No outcomes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <p className="text-xs text-slate-500">
            Showing {outcomes.length} outcome
            {outcomes.length === 1 ? "" : "s"} on page{" "}
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

