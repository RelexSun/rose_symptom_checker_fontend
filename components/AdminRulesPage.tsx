"use client";

import { useEffect, useState } from "react";
import type { ApiError, Rule, RulePayload, RuleCondition, RuleLogic, Outcome, Symptom } from "@/types";
import { ruleApi, outcomeApi, symptomApi } from "@/lib/api";
import { ErrorMessage } from "./ErrorMessage";
import { AdminTabs } from "./AdminTabs";

interface EditableRule extends Rule {}

const DEFAULT_LIMIT = 10;

const logicOptions: RuleLogic[] = ["AND", "OR"];
const operatorOptions: Array<RuleCondition["operator"]> = ["present", "absent", "equals", "greater_than", "less_than"];

export function AdminRulesPage() {
  const [rules, setRules] = useState<EditableRule[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [limit] = useState(DEFAULT_LIMIT);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [newRule, setNewRule] = useState<RulePayload>({
    rule_name: "",
    description: "",
    outcome_id: 0,
    conditions: {
      logic: "AND",
      conditions: [{ symptom_id: 0, operator: "present" }],
    },
    confidence_score: 0.8,
    priority: 0,
    is_active: true,
  });

  // Load outcomes and symptoms for dropdowns
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [outcomesData, symptomsData] = await Promise.all([
          outcomeApi.list({ skip: 0, limit: 1000, is_active: true }),
          symptomApi.list({ skip: 0, limit: 1000, is_active: true }),
        ]);
        setOutcomes(outcomesData);
        setSymptoms(symptomsData);
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      }
    };
    loadDropdowns();
  }, []);

  const loadRules = async (page: number) => {
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

      const result = await ruleApi.list({
        skip,
        limit,
        is_active: is_activeParam,
      });

      // Ensure results are ordered by id ascending on the client
      setRules([...result].sort((a, b) => a.id - b.id));
      setCurrentPage(page);
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to load rules. Please try again." }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRules(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterActive]);

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      loadRules(currentPage - 1);
    } else if (direction === "next") {
      loadRules(currentPage + 1);
    }
  };

  const handleFieldChange = (
    id: number,
    field: keyof EditableRule,
    value: string | boolean | number | RuleConditions
  ) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              [field]: value,
            }
          : rule
      )
    );
  };

  const handleConditionChange = (
    id: number,
    conditionIndex: number,
    field: keyof RuleCondition,
    value: number | string
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === id) {
          const updatedConditions = [...rule.conditions.conditions];
          updatedConditions[conditionIndex] = {
            ...updatedConditions[conditionIndex],
            [field]: value,
          };
          return {
            ...rule,
            conditions: {
              ...rule.conditions,
              conditions: updatedConditions,
            },
          };
        }
        return rule;
      })
    );
  };

  const handleAddCondition = (id: number) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === id) {
          return {
            ...rule,
            conditions: {
              ...rule.conditions,
              conditions: [
                ...rule.conditions.conditions,
                { symptom_id: 0, operator: "present" },
              ],
            },
          };
        }
        return rule;
      })
    );
  };

  const handleRemoveCondition = (id: number, conditionIndex: number) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === id) {
          const updatedConditions = rule.conditions.conditions.filter(
            (_, idx) => idx !== conditionIndex
          );
          return {
            ...rule,
            conditions: {
              ...rule.conditions,
              conditions: updatedConditions.length > 0 ? updatedConditions : [{ symptom_id: 0, operator: "present" }],
            },
          };
        }
        return rule;
      })
    );
  };

  const handleSaveRule = async (rule: EditableRule) => {
    setSavingId(rule.id);
    setError(null);

    const payload: RulePayload = {
      rule_name: rule.rule_name,
      description: rule.description,
      outcome_id: rule.outcome_id,
      conditions: rule.conditions,
      confidence_score: rule.confidence_score,
      priority: rule.priority,
      is_active: rule.is_active,
    };

    try {
      const updated = await ruleApi.update(rule.id, payload);
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, ...updated } : r))
      );
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to update rule. Please try again." }
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await ruleApi.delete(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to delete rule. Please try again." }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateRule = async () => {
    setSavingId("new");
    setError(null);

    try {
      const created = await ruleApi.create(newRule);
      setRules((prev) => [created, ...prev]);
      setNewRule({
        rule_name: "",
        description: "",
        outcome_id: 0,
        conditions: {
          logic: "AND",
          conditions: [{ symptom_id: 0, operator: "present" }],
        },
        confidence_score: 0.8,
        priority: 0,
        is_active: true,
      });
    } catch (err: any) {
      setError(
        err && err.message
          ? err
          : { message: "Failed to create rule. Please check the form and try again." }
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
              Rule Management
            </h1>
            <p className="text-slate-600 mt-1">
              Create, update, and delete diagnosis rules. Admin only.
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
              onClick={() => loadRules(1)}
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

        {/* Create new rule */}
        <div className="mb-8 border border-emerald-100 bg-emerald-50/60 rounded-xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-emerald-900 mb-3">
            Create New Rule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Rule Name"
              className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={newRule.rule_name}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, rule_name: e.target.value }))
              }
            />
            <select
              className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={newRule.outcome_id}
              onChange={(e) =>
                setNewRule((prev) => ({
                  ...prev,
                  outcome_id: Number(e.target.value),
                }))
              }
            >
              <option value={0}>Select Outcome</option>
              {outcomes.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>
                  {outcome.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="flex-1 px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Confidence (0-1)"
                value={newRule.confidence_score}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    confidence_score: Number(e.target.value) || 0,
                  }))
                }
              />
              <input
                type="number"
                className="w-20 px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Priority"
                value={newRule.priority}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    priority: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3"
            rows={2}
            value={newRule.description}
            onChange={(e) =>
              setNewRule((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="mb-3">
            <label className="block text-xs font-medium text-emerald-900 mb-1">
              Conditions Logic
            </label>
            <select
              className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={newRule.conditions.logic}
              onChange={(e) =>
                setNewRule((prev) => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    logic: e.target.value as RuleLogic,
                  },
                }))
              }
            >
              {logicOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-emerald-900 mb-2">
              Conditions
            </label>
            {newRule.conditions.conditions.map((condition, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  className="flex-1 px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={condition.symptom_id}
                  onChange={(e) => {
                    const updatedConditions = [...newRule.conditions.conditions];
                    updatedConditions[idx] = {
                      ...updatedConditions[idx],
                      symptom_id: Number(e.target.value),
                    };
                    setNewRule((prev) => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        conditions: updatedConditions,
                      },
                    }));
                  }}
                >
                  <option value={0}>Select Symptom</option>
                  {symptoms.map((symptom) => (
                    <option key={symptom.id} value={symptom.id}>
                      {symptom.name} ({symptom.code})
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 border border-emerald-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={condition.operator}
                  onChange={(e) => {
                    const updatedConditions = [...newRule.conditions.conditions];
                    updatedConditions[idx] = {
                      ...updatedConditions[idx],
                      operator: e.target.value as RuleCondition["operator"],
                    };
                    setNewRule((prev) => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        conditions: updatedConditions,
                      },
                    }));
                  }}
                >
                  {operatorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {newRule.conditions.conditions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updatedConditions = newRule.conditions.conditions.filter(
                        (_, i) => i !== idx
                      );
                      setNewRule((prev) => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          conditions: updatedConditions.length > 0 ? updatedConditions : [{ symptom_id: 0, operator: "present" }],
                        },
                      }));
                    }}
                    className="px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setNewRule((prev) => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    conditions: [
                      ...prev.conditions.conditions,
                      { symptom_id: 0, operator: "present" },
                    ],
                  },
                }));
              }}
              className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
            >
              + Add Condition
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center text-xs text-emerald-900">
              <input
                type="checkbox"
                className="mr-2 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                checked={newRule.is_active}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
              Active
            </label>
            <button
              type="button"
              onClick={handleCreateRule}
              disabled={savingId === "new"}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingId === "new" ? "Creating..." : "Create Rule"}
            </button>
          </div>
        </div>

        {/* Existing rules table */}
        {loading && rules.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-slate-600">Loading rules...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600">No rules found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Conditions
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {rules.map((rule) => {
                  const isSaving = savingId === rule.id;
                  const isDeleting = deletingId === rule.id;

                  return (
                    <tr key={rule.id} className="hover:bg-slate-50/70 align-top">
                      <td className="px-3 py-3 text-slate-800 whitespace-nowrap text-xs">
                        {rule.id}
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          value={rule.rule_name}
                          onChange={(e) =>
                            handleFieldChange(rule.id, "rule_name", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        <select
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          value={rule.outcome_id}
                          onChange={(e) =>
                            handleFieldChange(
                              rule.id,
                              "outcome_id",
                              Number(e.target.value)
                            )
                          }
                        >
                          {outcomes.map((outcome) => (
                            <option key={outcome.id} value={outcome.id}>
                              {outcome.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        <div className="space-y-1">
                          <select
                            className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 mb-1"
                            value={rule.conditions.logic}
                            onChange={(e) =>
                              handleFieldChange(rule.id, "conditions", {
                                ...rule.conditions,
                                logic: e.target.value as RuleLogic,
                              })
                            }
                          >
                            {logicOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {rule.conditions.conditions.map((condition, idx) => (
                            <div key={idx} className="flex gap-1">
                              <select
                                className="flex-1 px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                value={condition.symptom_id}
                                onChange={(e) =>
                                  handleConditionChange(
                                    rule.id,
                                    idx,
                                    "symptom_id",
                                    Number(e.target.value)
                                  )
                                }
                              >
                                {symptoms.map((symptom) => (
                                  <option key={symptom.id} value={symptom.id}>
                                    {symptom.code}
                                  </option>
                                ))}
                              </select>
                              <select
                                className="px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                value={condition.operator}
                                onChange={(e) =>
                                  handleConditionChange(
                                    rule.id,
                                    idx,
                                    "operator",
                                    e.target.value
                                  )
                                }
                              >
                                {operatorOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              {rule.conditions.conditions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCondition(rule.id, idx)}
                                  className="px-2 py-1 text-red-600 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddCondition(rule.id)}
                            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                          >
                            + Add
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          className="w-20 px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          value={rule.confidence_score}
                          onChange={(e) =>
                            handleFieldChange(
                              rule.id,
                              "confidence_score",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-16 px-2 py-1 border border-slate-200 rounded-md text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          value={rule.priority}
                          onChange={(e) =>
                            handleFieldChange(
                              rule.id,
                              "priority",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleFieldChange(rule.id, "is_active", !rule.is_active)
                          }
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            rule.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              rule.is_active ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {rule.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-slate-800 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveRule(rule)}
                            disabled={isSaving || isDeleting}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            disabled={isSaving || isDeleting}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {rules.length > 0 ? (
              <>
                Page {currentPage} • {rules.length} rule{rules.length !== 1 ? "s" : ""} shown
              </>
            ) : currentPage > 1 ? (
              <>Page {currentPage} • No rules on this page</>
            ) : (
              <>Page {currentPage}</>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange("next")}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
