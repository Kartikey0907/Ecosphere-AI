"use client";

import { useState, useEffect } from "react";
import { createGoal } from "@/app/(dashboard)/goals/actions";
import { Loader2, Plus, Target } from "lucide-react";

export default function NewGoalForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "CARBON",
    targetValue: 100,
    unit: "kg",
    endDate: "",
  });

  // Autofill unit based on category
  useEffect(() => {
    const units: Record<string, string> = {
      CARBON: "kg",
      WATER: "liters",
      ENERGY: "kWh",
      TRANSPORT: "km",
      RECYCLING: "items",
      WASTE: "items",
    };
    setFormData((prev) => ({
      ...prev,
      unit: units[prev.category] || "items",
    }));
  }, [formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.endDate) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);

    try {
      await createGoal(formData);
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "CARBON",
        targetValue: 100,
        unit: "kg",
        endDate: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create goal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 transform active:scale-95"
      >
        <Plus className="w-4 h-4 stroke-[3px]" />
        <span>Create Custom Goal</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-45" onClick={() => setIsOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-2 mb-6 border-b border-slate-900 pb-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Create Custom Sustainability Goal</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Save 500 liters of water"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe how you plan to achieve this..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 min-h-[60px] max-h-[100px] transition-colors"
                />
              </div>

              {/* Grid: Category & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="CARBON">Carbon Footprint</option>
                    <option value="WATER">Water Conservation</option>
                    <option value="ENERGY">Electricity Savings</option>
                    <option value="TRANSPORT">Transit Distance</option>
                    <option value="RECYCLING">Recycling Items</option>
                    <option value="WASTE">Waste Reduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Value</label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-xl pr-3 overflow-hidden">
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.targetValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-transparent px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-bold">{formData.unit}</span>
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-900 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-850 hover:bg-slate-900/40 text-xs text-slate-400 hover:text-slate-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </button>
              </div>

            </form>
          </div>
        </>
      )}
    </div>
  );
}
