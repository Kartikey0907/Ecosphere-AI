"use client";

import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  BarChart, 
  Bar, 
  Legend,
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Leaf, 
  Droplet, 
  Zap, 
  Compass, 
  ShoppingBag,
  TrendingDown,
  Info
} from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { EMISSION_FACTORS } from "@/lib/carbon-calculator";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  logs: any[];
}

export default function AnalyticsDashboard({ logs }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30">("30");

  const filteredLogs = logs.slice(timeRange === "7" ? -7 : -30);

  // 1. Carbon Trend Data
  const carbonData = filteredLogs.map((log) => ({
    date: log.date,
    displayDate: formatDate(log.date),
    carbon: log.carbonFootprint,
    target: 16.0, // baseline
  }));

  // 2. Utilities Usage Data
  const utilityData = filteredLogs.map((log) => ({
    date: log.date,
    displayDate: formatDate(log.date),
    water: log.waterUsage,
    electricity: log.electricityUsage,
  }));

  // 3. Transit Pie Data
  let carTotal = 0;
  let busTotal = 0;
  let trainTotal = 0;
  let bikeTotal = 0;
  let walkTotal = 0;

  filteredLogs.forEach((log) => {
    carTotal += log.carKm;
    busTotal += log.busKm;
    trainTotal += log.trainKm;
    bikeTotal += log.bikeKm;
    walkTotal += log.walkKm;
  });

  const transitDistances = [
    { name: "Car", value: carTotal, color: "#ef4444", icon: CarIcon },
    { name: "Bus", value: busTotal, color: "#f59e0b", icon: BusIcon },
    { name: "Train", value: trainTotal, color: "#06b6d4", icon: TrainIcon },
    { name: "Bike", value: bikeTotal, color: "#10b981", icon: BikeIcon },
    { name: "Walk", value: walkTotal, color: "#8b5cf6", icon: WalkIcon },
  ].filter(item => item.value > 0);

  const transitEmissions = [
    { name: "Car", value: carTotal * EMISSION_FACTORS.transport.car, color: "#ef4444" },
    { name: "Bus", value: busTotal * EMISSION_FACTORS.transport.bus, color: "#f59e0b" },
    { name: "Train", value: trainTotal * EMISSION_FACTORS.transport.train, color: "#06b6d4" },
    { name: "Bike", value: 0, color: "#10b981" },
    { name: "Walk", value: 0, color: "#8b5cf6" },
  ].filter(item => item.value > 0);

  // Total sums
  const totalCarbon = filteredLogs.reduce((sum, log) => sum + log.carbonFootprint, 0);
  const avgCarbon = filteredLogs.length > 0 ? totalCarbon / filteredLogs.length : 0;
  const totalWater = filteredLogs.reduce((sum, log) => sum + log.waterUsage, 0);
  const avgWater = filteredLogs.length > 0 ? totalWater / filteredLogs.length : 0;
  const totalElectricity = filteredLogs.reduce((sum, log) => sum + log.electricityUsage, 0);
  const avgElectricity = filteredLogs.length > 0 ? totalElectricity / filteredLogs.length : 0;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl shadow-2xl text-xs">
          <p className="font-bold text-slate-300 mb-1.5">{payload[0].payload.displayDate}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              <span className="text-slate-400 font-medium capitalize">{p.name}:</span>
              <span className="font-bold text-white">{formatNumber(p.value, 1)} {p.unit || ""}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historical Trends</span>
        <div className="flex bg-slate-900/50 p-1 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setTimeRange("7")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300",
              timeRange === "7" 
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange("30")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300",
              timeRange === "30" 
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Carbon */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-5 flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Carbon Daily Avg</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-white">{avgCarbon.toFixed(1)}</span>
              <span className="text-xs text-slate-400">kg CO₂</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md font-semibold mt-2 inline-flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> Optimal
            </span>
          </div>
        </div>

        {/* Water */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-5 flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Water Daily Avg</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-white">{Math.round(avgWater)}</span>
              <span className="text-xs text-slate-400">Liters</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">Total: {formatNumber(totalWater)}L</span>
          </div>
        </div>

        {/* Electricity */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-5 flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Electricity Daily Avg</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-white">{avgElectricity.toFixed(1)}</span>
              <span className="text-xs text-slate-400">kWh</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">Total: {formatNumber(totalElectricity, 1)} kWh</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Carbon Trend Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Carbon Footprint Trend</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Daily emissions compared against average baseline (16 kg)</p>
          </div>

          <div className="h-72 w-full mt-6">
            <ResponsiveContainer width="100%" h-full="true">
              <AreaChart data={carbonData}>
                <defs>
                  <linearGradient id="carbonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.3)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(30, 41, 59, 0.4)" />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(30, 41, 59, 0.4)" unit="kg" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={16.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Average Target', fill: '#ef4444', fontSize: 9, position: 'top' }} />
                <Area 
                  type="monotone" 
                  dataKey="carbon" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#carbonGlow)" 
                  unit="kg" 
                  name="Carbon Output"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transit Breakdown Pie Charts */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Transportation Breakdown</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Distribution of total distance logged ({carTotal + busTotal + trainTotal + bikeTotal + walkTotal} km)</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center mt-6">
            {transitDistances.length === 0 ? (
              <div className="text-slate-500 text-xs text-center">No transport logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transitDistances}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {transitDistances.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} km`, "Distance"]} contentStyle={{ backgroundColor: "#020617", borderRadius: "12px", border: "1px solid #1e293b", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center Summary Text */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white">{carTotal + busTotal + trainTotal + bikeTotal + walkTotal}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Total Km</span>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
            {transitDistances.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400 font-semibold">{entry.name}</span>
                <span className="text-slate-500">{entry.value} km</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utilities Bar Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Utilities Consumption */}
        <div className="lg:col-span-2 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Utilities Comparison</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Daily tracking of water usage (liters) and electricity (kWh)</p>
          </div>

          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.3)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(30, 41, 59, 0.4)" />
                <YAxis yAxisId="left" orientation="left" stroke="#06b6d4" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: 10 }} />
                <Bar yAxisId="left" dataKey="water" fill="#06b6d4" name="Water (Liters)" unit=" L" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="electricity" fill="#f59e0b" name="Electricity (kWh)" unit=" kWh" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info/Insights Summary Card */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4 mb-4">
            <Info className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-xs text-white">Platform Performance Statistics</h4>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2.5">
              <span className="text-slate-400 font-medium">Carbon saved:</span>
              <span className="text-emerald-400 font-bold">
                {formatNumber(Math.max(0, (logs.length * 16.0) - totalCarbon), 1)} kg
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2.5">
              <span className="text-slate-400 font-medium">Recycling counts:</span>
              <span className="text-white font-bold">
                {logs.reduce((sum, l) => sum + l.recycledItems, 0)} items
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2.5">
              <span className="text-slate-400 font-medium">Vegan meals eaten:</span>
              <span className="text-white font-bold">
                {logs.reduce((sum, l) => sum + l.veganMeals, 0)} meals
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Total green transit:</span>
              <span className="text-white font-bold">
                {bikeTotal + walkTotal} km
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed mt-4">
            Did you know? Every 1 kWh of electricity you save reduces emissions by 0.42 kg CO₂. Unplugging appliances on standby can reduce electricity bills by up to 10%!
          </div>
        </div>

      </div>

    </div>
  );
}

// Simple placeholders to prevent Lucide import warnings since we didn't specify different names
function CarIcon() { return null; }
function BusIcon() { return null; }
function TrainIcon() { return null; }
function BikeIcon() { return null; }
function WalkIcon() { return null; }
