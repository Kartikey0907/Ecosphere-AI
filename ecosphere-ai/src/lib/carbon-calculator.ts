// Carbon footprint calculation engine
// All values in kg CO2e (CO2 equivalent)

// ─── Emission Factors (kg CO2e per unit) ────────────────────

export const EMISSION_FACTORS = {
  // Transportation (per km)
  transport: {
    car: 0.21,        // Average passenger car
    bus: 0.089,       // Public bus
    train: 0.041,     // Electric train
    bike: 0,          // Zero emissions
    walk: 0,          // Zero emissions
    flight: 0.255,    // Average flight per km
  },
  
  // Food (per meal)
  food: {
    meat: 3.3,        // Average meat-based meal
    vegetarian: 1.7,  // Vegetarian meal
    vegan: 0.9,       // Vegan meal
  },
  
  // Utilities
  electricity: 0.42,  // kg CO2e per kWh (global average)
  water: 0.0003,      // kg CO2e per liter (treatment + pumping)
  
  // Waste
  plastic: 0.04,      // kg CO2e per plastic item
  recycling: -0.02,   // Negative = emissions saved per recycled item
  composting: -0.1,   // kg CO2e saved per kg composted
  
  // Shopping
  newClothing: 10,    // kg CO2e per new clothing item
  secondHand: 0.5,    // kg CO2e per second-hand item
} as const;

// ─── Average Baselines ─────────────────────────────────────

export const DAILY_AVERAGES = {
  carbonFootprint: 16.0, // kg CO2e (global average per person per day is ~16 for high-income)
  waterUsage: 150,       // liters per day
  electricityUsage: 10,  // kWh per day
  plasticItems: 3,       // items per day
};

// ─── Carbon Calculator ─────────────────────────────────────

export function calculateCarbonFootprint(log: {
  carKm?: number;
  busKm?: number;
  trainKm?: number;
  bikeKm?: number;
  walkKm?: number;
  flightKm?: number;
  waterUsage?: number;
  electricityUsage?: number;
  meatMeals?: number;
  vegMeals?: number;
  veganMeals?: number;
  plasticItems?: number;
  recycledItems?: number;
  compostedKg?: number;
  newClothingItems?: number;
  secondHandItems?: number;
}): number {
  let total = 0;

  // Transport emissions
  total += (log.carKm || 0) * EMISSION_FACTORS.transport.car;
  total += (log.busKm || 0) * EMISSION_FACTORS.transport.bus;
  total += (log.trainKm || 0) * EMISSION_FACTORS.transport.train;
  total += (log.bikeKm || 0) * EMISSION_FACTORS.transport.bike;
  total += (log.walkKm || 0) * EMISSION_FACTORS.transport.walk;
  total += (log.flightKm || 0) * EMISSION_FACTORS.transport.flight;

  // Food emissions
  total += (log.meatMeals || 0) * EMISSION_FACTORS.food.meat;
  total += (log.vegMeals || 0) * EMISSION_FACTORS.food.vegetarian;
  total += (log.veganMeals || 0) * EMISSION_FACTORS.food.vegan;

  // Utility emissions
  total += (log.electricityUsage || 0) * EMISSION_FACTORS.electricity;
  total += (log.waterUsage || 0) * EMISSION_FACTORS.water;

  // Waste emissions
  total += (log.plasticItems || 0) * EMISSION_FACTORS.plastic;
  total += (log.recycledItems || 0) * EMISSION_FACTORS.recycling;
  total += (log.compostedKg || 0) * EMISSION_FACTORS.composting;

  // Shopping emissions
  total += (log.newClothingItems || 0) * EMISSION_FACTORS.newClothing;
  total += (log.secondHandItems || 0) * EMISSION_FACTORS.secondHand;

  return Math.max(0, Math.round(total * 100) / 100);
}

// ─── Transport Breakdown ────────────────────────────────────

export function getTransportBreakdown(log: {
  carKm?: number;
  busKm?: number;
  trainKm?: number;
  bikeKm?: number;
  walkKm?: number;
  flightKm?: number;
}) {
  return [
    { name: 'Car', value: (log.carKm || 0) * EMISSION_FACTORS.transport.car, color: '#ef4444' },
    { name: 'Bus', value: (log.busKm || 0) * EMISSION_FACTORS.transport.bus, color: '#f59e0b' },
    { name: 'Train', value: (log.trainKm || 0) * EMISSION_FACTORS.transport.train, color: '#10b981' },
    { name: 'Bike', value: (log.bikeKm || 0) * EMISSION_FACTORS.transport.bike, color: '#06b6d4' },
    { name: 'Walk', value: (log.walkKm || 0) * EMISSION_FACTORS.transport.walk, color: '#8b5cf6' },
    { name: 'Flight', value: (log.flightKm || 0) * EMISSION_FACTORS.transport.flight, color: '#ec4899' },
  ].filter(item => item.value > 0);
}
