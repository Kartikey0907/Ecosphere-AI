"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Car, 
  Bike, 
  Footprints, 
  Utensils, 
  Droplet, 
  Zap, 
  Trash2, 
  ShoppingBag,
  Sparkles,
  Loader2,
  Check,
  Plus,
  Minus
} from "lucide-react";
import { calculateCarbonFootprint } from "@/lib/carbon-calculator";
import { cn } from "@/lib/utils";

interface TrackerFormProps {
  initialLog: any | null;
}

type TabType = "transport" | "food" | "utilities" | "waste" | "shopping";

export default function TrackerForm({ initialLog }: TrackerFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("transport");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rewards, setRewards] = useState<{ totalXp: number; levelUp: boolean } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    carKm: initialLog?.carKm ?? 0,
    busKm: initialLog?.busKm ?? 0,
    trainKm: initialLog?.trainKm ?? 0,
    bikeKm: initialLog?.bikeKm ?? 0,
    walkKm: initialLog?.walkKm ?? 0,
    waterUsage: initialLog?.waterUsage ?? 0,
    electricityUsage: initialLog?.electricityUsage ?? 0,
    meatMeals: initialLog?.meatMeals ?? 0,
    vegMeals: initialLog?.vegMeals ?? 0,
    veganMeals: initialLog?.veganMeals ?? 0,
    plasticItems: initialLog?.plasticItems ?? 0,
    recycledItems: initialLog?.recycledItems ?? 0,
    compostedKg: initialLog?.compostedKg ?? 0,
    newClothingItems: initialLog?.newClothingItems ?? 0,
    secondHandItems: initialLog?.secondHandItems ?? 0,
  });

  // Calculate carbon footprint in real-time
  const [liveFootprint, setLiveFootprint] = useState(0);

  useEffect(() => {
    setLiveFootprint(calculateCarbonFootprint(formData));
  }, [formData]);

  const updateField = (field: keyof typeof formData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  const increment = (field: keyof typeof formData, step = 1) => {
    updateField(field, formData[field] + step);
  };

  const decrement = (field: keyof typeof formData, step = 1) => {
    updateField(field, formData[field] - step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setRewards(null);

    try {
      const response = await fetch("/api/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (data.xpEarned) {
          setRewards({
            totalXp: data.xpEarned,
            levelUp: data.levelUp || false,
          });
        }
        router.refresh();
      } else {
        alert(data.error || "Failed to save activity log");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong saving your log.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "transport", label: "Transport", icon: Car, color: "text-red-400" },
    { id: "food", label: "Diet", icon: Utensils, color: "text-amber-400" },
    { id: "utilities", label: "Utilities", icon: Zap, color: "text-cyan-400" },
    { id: "waste", label: "Waste & Recycling", icon: Trash2, color: "text-emerald-400" },
    { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "text-purple-400" },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Form Area */}
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300",
                  isActive
                    ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-slate-950"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-4 h-4", tab.color)} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 min-h-[300px] flex flex-col justify-between">
          
          {/* Transport Category */}
          {activeTab === "transport" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200">Daily Transportation (km)</h3>
              
              {/* Car */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Personal Car</h4>
                    <p className="text-[10px] text-slate-500">Regular gas/diesel passenger car</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("carKm", 5)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="number" 
                    value={formData.carKm}
                    onChange={(e) => updateField("carKm", parseInt(e.target.value) || 0)}
                    className="w-12 bg-transparent text-center text-xs font-bold focus:outline-none"
                  />
                  <button type="button" onClick={() => increment("carKm", 5)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bus & Train */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bus */}
                <div className="flex items-center justify-between gap-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Public Bus</h4>
                      <p className="text-[9px] text-slate-500">Shared commute</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
                    <button type="button" onClick={() => decrement("busKm", 2)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number" 
                      value={formData.busKm}
                      onChange={(e) => updateField("busKm", parseInt(e.target.value) || 0)}
                      className="w-8 bg-transparent text-center text-[11px] font-bold focus:outline-none"
                    />
                    <button type="button" onClick={() => increment("busKm", 2)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Train */}
                <div className="flex items-center justify-between gap-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Train / Metro</h4>
                      <p className="text-[9px] text-slate-500">Electric transit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
                    <button type="button" onClick={() => decrement("trainKm", 5)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number" 
                      value={formData.trainKm}
                      onChange={(e) => updateField("trainKm", parseInt(e.target.value) || 0)}
                      className="w-8 bg-transparent text-center text-[11px] font-bold focus:outline-none"
                    />
                    <button type="button" onClick={() => increment("trainKm", 5)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Green Commute */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bike */}
                <div className="flex items-center justify-between gap-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Cycling</h4>
                      <p className="text-[9px] text-slate-500">Zero footprint</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
                    <button type="button" onClick={() => decrement("bikeKm", 2)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number" 
                      value={formData.bikeKm}
                      onChange={(e) => updateField("bikeKm", parseInt(e.target.value) || 0)}
                      className="w-8 bg-transparent text-center text-[11px] font-bold focus:outline-none"
                    />
                    <button type="button" onClick={() => increment("bikeKm", 2)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Walk */}
                <div className="flex items-center justify-between gap-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Walking</h4>
                      <p className="text-[9px] text-slate-500">Active transport</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
                    <button type="button" onClick={() => decrement("walkKm", 1)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number" 
                      value={formData.walkKm}
                      onChange={(e) => updateField("walkKm", parseInt(e.target.value) || 0)}
                      className="w-8 bg-transparent text-center text-[11px] font-bold focus:outline-none"
                    />
                    <button type="button" onClick={() => increment("walkKm", 1)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Diet Category */}
          {activeTab === "food" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200">Daily Meals consumed</h3>
              
              {/* Meat Meal */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Meat meals</h4>
                    <p className="text-[10px] text-slate-500">Beef, poultry, fish-based meals (~3.3 kg CO₂ each)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("meatMeals", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.meatMeals}</span>
                  <button type="button" onClick={() => increment("meatMeals", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Vegetarian Meal */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Vegetarian meals</h4>
                    <p className="text-[10px] text-slate-500">Eggs, dairy, no meat (~1.7 kg CO₂ each)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("vegMeals", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.vegMeals}</span>
                  <button type="button" onClick={() => increment("vegMeals", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Vegan Meal */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Vegan meals</h4>
                    <p className="text-[10px] text-slate-500">100% plant-based meal (~0.9 kg CO₂ each)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("veganMeals", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.veganMeals}</span>
                  <button type="button" onClick={() => increment("veganMeals", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Utilities Category */}
          {activeTab === "utilities" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200">Utilities & Resource consumption</h3>

              {/* Water */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Water Usage</h4>
                    <p className="text-[10px] text-slate-500">Liters consumed today (avg shower is ~60L)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("waterUsage", 20)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="number" 
                    value={formData.waterUsage}
                    onChange={(e) => updateField("waterUsage", parseInt(e.target.value) || 0)}
                    className="w-14 bg-transparent text-center text-xs font-bold focus:outline-none"
                  />
                  <button type="button" onClick={() => increment("waterUsage", 20)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Electricity */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Electricity Usage</h4>
                    <p className="text-[10px] text-slate-500">Total kWh consumed today (home utility share)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("electricityUsage", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="number" 
                    value={formData.electricityUsage}
                    onChange={(e) => updateField("electricityUsage", parseInt(e.target.value) || 0)}
                    className="w-14 bg-transparent text-center text-xs font-bold focus:outline-none"
                  />
                  <button type="button" onClick={() => increment("electricityUsage", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Waste Category */}
          {activeTab === "waste" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200">Waste, Recycling & Composting</h3>

              {/* Single Use Plastic */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Single-use Plastic Items</h4>
                    <p className="text-[10px] text-slate-500">Disposable cups, plastic wraps, bags used</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("plasticItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.plasticItems}</span>
                  <button type="button" onClick={() => increment("plasticItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recycled Items */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Recycled Items</h4>
                    <p className="text-[10px] text-slate-500">Cans, plastic bottles, papers, cardboards recycled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("recycledItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.recycledItems}</span>
                  <button type="button" onClick={() => increment("recycledItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Composting */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Food Waste Composted</h4>
                    <p className="text-[10px] text-slate-500">Organic wastes composted (kg)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("compostedKg", 0.5)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.compostedKg}
                    onChange={(e) => updateField("compostedKg", parseFloat(e.target.value) || 0)}
                    className="w-14 bg-transparent text-center text-xs font-bold focus:outline-none"
                  />
                  <button type="button" onClick={() => increment("compostedKg", 0.5)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shopping Category */}
          {activeTab === "shopping" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200">Shopping habits</h3>

              {/* New clothes */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">New Clothing Items</h4>
                    <p className="text-[10px] text-slate-500">Fast fashion or new apparel (~10 kg CO₂ each)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("newClothingItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.newClothingItems}</span>
                  <button type="button" onClick={() => increment("newClothingItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Second Hand */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Second-Hand / Thrifted</h4>
                    <p className="text-[10px] text-slate-500">Recycled / reusable purchases (~0.5 kg CO₂ each)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl border border-slate-800 p-1">
                  <button type="button" onClick={() => decrement("secondHandItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{formData.secondHandItems}</span>
                  <button type="button" onClick={() => increment("secondHandItems", 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button inside Panel */}
          <div className="mt-8 border-t border-slate-900 pt-6 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[3px]" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3px]" /> Save Activity Log
                </>
              )}
            </button>
          </div>

        </div>

      </form>

      {/* Carbon footprint preview card (sidebar) */}
      <div className="space-y-6">
        
        {/* Footprint Preview */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md p-6 flex flex-col justify-between h-[250px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Carbon Footprint Preview</h3>
            <span className="text-[10px] text-slate-500 font-semibold block">Calculated in real-time</span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold text-white tracking-tight animate-pulse">
                {liveFootprint}
              </span>
              <span className="text-xs font-semibold text-slate-400">kg CO₂e</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Based on emission factors for your logged activities.
            </p>
          </div>

          <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Daily average target:</span>
            <span className="font-bold text-white">16.0 kg</span>
          </div>
        </div>

        {/* Success / Rewards celebration overlay */}
        {success && rewards && (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl animate-in zoom-in duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-300">Activity Logged!</h4>
                <p className="text-[10px] text-slate-400">Habit updated successfully</p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">XP Earned Today</span>
              <span className="text-3xl font-extrabold text-emerald-400">+{rewards.totalXp} XP</span>
              {rewards.levelUp && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-1 animate-pulse">
                  🎉 Level Up!
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
