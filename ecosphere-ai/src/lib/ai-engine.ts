// ─── AI Sustainability Coach Engine ─────────────────────────
// Rule-based recommendation engine with smart pattern analysis
// Architecture ready for LLM API integration

import type { DailyLogData, AiInsightData, InsightType, InsightImpact } from '@/types';
import { DAILY_AVERAGES, EMISSION_FACTORS } from './carbon-calculator';

interface InsightTemplate {
  type: InsightType;
  title: string;
  content: string;
  impact: InsightImpact;
  category: string;
  condition: (data: AnalysisContext) => boolean;
}

interface AnalysisContext {
  recentLogs: DailyLogData[];
  avgCarbon: number;
  avgWater: number;
  avgElectricity: number;
  totalCarKm: number;
  totalBikeKm: number;
  totalWalkKm: number;
  meatMealCount: number;
  veganMealCount: number;
  totalRecycled: number;
  totalPlastic: number;
  streak: number;
}

// ─── Insight Templates ──────────────────────────────────────

const INSIGHT_TEMPLATES: InsightTemplate[] = [
  // Transport insights
  {
    type: 'RECOMMENDATION',
    title: '🚗 Switch to Public Transit',
    content: 'You\'ve driven {carKm} km this week. Switching to public transit for just 3 days could reduce your annual emissions by approximately {savings} kg of CO₂. That\'s equivalent to planting {trees} trees!',
    impact: 'HIGH',
    category: 'TRANSPORT',
    condition: (ctx) => ctx.totalCarKm > 50,
  },
  {
    type: 'TIP',
    title: '🚲 You\'re a Cycling Star!',
    content: 'Amazing! You cycled {bikeKm} km this week, saving {savings} kg of CO₂ compared to driving. Keep pedaling — you\'re making a real difference!',
    impact: 'MEDIUM',
    category: 'TRANSPORT',
    condition: (ctx) => ctx.totalBikeKm > 10,
  },
  {
    type: 'RECOMMENDATION',
    title: '🚶 Walk More, Drive Less',
    content: 'Consider walking for trips under 2 km. You could save up to {savings} kg CO₂ per week and improve your cardiovascular health by 30%.',
    impact: 'MEDIUM',
    category: 'TRANSPORT',
    condition: (ctx) => ctx.totalCarKm > 20 && ctx.totalWalkKm < 5,
  },

  // Food insights
  {
    type: 'RECOMMENDATION',
    title: '🥩 Meatless Mondays',
    content: 'You had {meatMeals} meat meals this week. Replacing just 2 with plant-based options could save {savings} kg of CO₂ per week — that\'s {annualSavings} kg per year!',
    impact: 'HIGH',
    category: 'CARBON',
    condition: (ctx) => ctx.meatMealCount > 5,
  },
  {
    type: 'TIP',
    title: '🌿 Plant-Based Champion!',
    content: 'You had {veganMeals} vegan meals this week! Each one saved about 2.4 kg of CO₂ compared to meat. You\'re a plant-powered hero!',
    impact: 'MEDIUM',
    category: 'CARBON',
    condition: (ctx) => ctx.veganMealCount > 5,
  },

  // Water insights
  {
    type: 'RECOMMENDATION',
    title: '💧 Water Conservation Alert',
    content: 'Your water usage of {waterUsage}L/day is {percent}% above the recommended amount. Try shorter showers (save ~40L each) and fix any leaky faucets.',
    impact: 'MEDIUM',
    category: 'WATER',
    condition: (ctx) => ctx.avgWater > DAILY_AVERAGES.waterUsage * 1.2,
  },
  {
    type: 'TIP',
    title: '💧 Water Warrior!',
    content: 'Your daily water usage of {waterUsage}L is {percent}% below average. You\'re conserving a precious resource — keep it up!',
    impact: 'LOW',
    category: 'WATER',
    condition: (ctx) => ctx.avgWater < DAILY_AVERAGES.waterUsage * 0.8,
  },

  // Energy insights
  {
    type: 'RECOMMENDATION',
    title: '⚡ Reduce Energy Consumption',
    content: 'Your electricity usage of {electricityUsage} kWh/day is above average. Try turning off lights when leaving rooms, using LED bulbs, and unplugging idle devices. This could save you {savings} kg CO₂ and money on your bill!',
    impact: 'HIGH',
    category: 'ENERGY',
    condition: (ctx) => ctx.avgElectricity > DAILY_AVERAGES.electricityUsage * 1.2,
  },
  {
    type: 'TIP',
    title: '⚡ Energy Efficient!',
    content: 'Great job! Your electricity usage is {percent}% below average. You\'re saving both emissions and money!',
    impact: 'LOW',
    category: 'ENERGY',
    condition: (ctx) => ctx.avgElectricity < DAILY_AVERAGES.electricityUsage * 0.8,
  },

  // Recycling insights
  {
    type: 'RECOMMENDATION',
    title: '♻️ Boost Your Recycling',
    content: 'You used {plastic} single-use plastic items this week but only recycled {recycled}. Try to recycle at least 80% of your waste — every item counts!',
    impact: 'MEDIUM',
    category: 'RECYCLING',
    condition: (ctx) => ctx.totalPlastic > ctx.totalRecycled * 2,
  },
  {
    type: 'TIP',
    title: '♻️ Recycling Champion!',
    content: 'You recycled {recycled} items this week — that\'s an excellent recycling rate! You\'re keeping waste out of landfills and oceans.',
    impact: 'LOW',
    category: 'RECYCLING',
    condition: (ctx) => ctx.totalRecycled > 10,
  },

  // Streak & engagement insights
  {
    type: 'TIP',
    title: '🔥 Streak on Fire!',
    content: 'You\'ve logged your activities for {streak} consecutive days! Consistency is key to building sustainable habits. Keep the streak alive!',
    impact: 'LOW',
    category: 'GENERAL',
    condition: (ctx) => ctx.streak >= 7,
  },

  // Carbon trend insights
  {
    type: 'FORECAST',
    title: '📊 Monthly Carbon Forecast',
    content: 'Based on your current trend, your monthly carbon footprint will be approximately {monthlyCarbon} kg CO₂. That\'s {comparison} the national average. {suggestion}',
    impact: 'HIGH',
    category: 'CARBON',
    condition: (ctx) => ctx.recentLogs.length >= 7,
  },

  // General sustainability tips
  {
    type: 'TIP',
    title: '🌍 Did You Know?',
    content: 'If everyone reduced their carbon footprint by just 10%, global emissions would drop by approximately 3.6 billion tonnes per year. Your daily choices matter!',
    impact: 'LOW',
    category: 'GENERAL',
    condition: () => Math.random() > 0.5,
  },
];

// ─── Analysis Functions ─────────────────────────────────────

function buildContext(logs: DailyLogData[], streak: number): AnalysisContext {
  const recentLogs = logs.slice(0, 7); // Last 7 days
  
  const sum = (fn: (log: DailyLogData) => number) => 
    recentLogs.reduce((acc, log) => acc + fn(log), 0);
  
  const avg = (fn: (log: DailyLogData) => number) => 
    recentLogs.length > 0 ? sum(fn) / recentLogs.length : 0;

  return {
    recentLogs,
    avgCarbon: avg(l => l.carbonFootprint || 0),
    avgWater: avg(l => l.waterUsage || 0),
    avgElectricity: avg(l => l.electricityUsage || 0),
    totalCarKm: sum(l => l.carKm || 0),
    totalBikeKm: sum(l => l.bikeKm || 0),
    totalWalkKm: sum(l => l.walkKm || 0),
    meatMealCount: sum(l => l.meatMeals || 0),
    veganMealCount: sum(l => l.veganMeals || 0),
    totalRecycled: sum(l => l.recycledItems || 0),
    totalPlastic: sum(l => l.plasticItems || 0),
    streak,
  };
}

function fillTemplate(template: string, ctx: AnalysisContext): string {
  return template
    .replace('{carKm}', Math.round(ctx.totalCarKm).toString())
    .replace('{bikeKm}', Math.round(ctx.totalBikeKm).toString())
    .replace('{meatMeals}', ctx.meatMealCount.toString())
    .replace('{veganMeals}', ctx.veganMealCount.toString())
    .replace('{waterUsage}', Math.round(ctx.avgWater).toString())
    .replace('{electricityUsage}', Math.round(ctx.avgElectricity * 10) / 10 + '')
    .replace('{plastic}', ctx.totalPlastic.toString())
    .replace('{recycled}', ctx.totalRecycled.toString())
    .replace('{streak}', ctx.streak.toString())
    .replace('{savings}', Math.round(ctx.totalCarKm * EMISSION_FACTORS.transport.car * 0.6).toString())
    .replace('{annualSavings}', Math.round(ctx.meatMealCount * 2 * EMISSION_FACTORS.food.meat * 52).toString())
    .replace('{trees}', Math.round(ctx.totalCarKm * EMISSION_FACTORS.transport.car * 0.6 / 22).toString())
    .replace('{percent}', Math.round(Math.abs(1 - ctx.avgWater / DAILY_AVERAGES.waterUsage) * 100).toString())
    .replace('{monthlyCarbon}', Math.round(ctx.avgCarbon * 30).toString())
    .replace('{comparison}', ctx.avgCarbon * 30 > 480 ? 'above' : 'below')
    .replace('{suggestion}', ctx.avgCarbon * 30 > 480 
      ? 'Consider making small changes to bring this down.' 
      : 'You\'re doing great — keep up the sustainable choices!');
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Generate AI insights based on user's recent activity data
 */
export function generateInsights(
  logs: DailyLogData[], 
  streak: number,
  maxInsights: number = 5
): Omit<AiInsightData, 'id' | 'createdAt' | 'dismissed'>[] {
  const ctx = buildContext(logs, streak);
  
  const matchingTemplates = INSIGHT_TEMPLATES.filter(t => {
    try {
      return t.condition(ctx);
    } catch {
      return false;
    }
  });

  // Shuffle and take top N
  const shuffled = matchingTemplates.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, maxInsights);

  return selected.map(template => ({
    type: template.type,
    title: template.title,
    content: fillTemplate(template.content, ctx),
    impact: template.impact,
    category: template.category,
  }));
}

/**
 * Generate a weekly sustainability report
 */
export function generateWeeklyReport(logs: DailyLogData[], streak: number): string {
  const ctx = buildContext(logs, streak);
  
  const totalCarbon = ctx.recentLogs.reduce((sum, l) => sum + (l.carbonFootprint || 0), 0);
  const avgDaily = ctx.recentLogs.length > 0 ? totalCarbon / ctx.recentLogs.length : 0;
  
  return `## 📊 Your Weekly Sustainability Report

### Carbon Footprint
- **Total this week:** ${Math.round(totalCarbon)} kg CO₂
- **Daily average:** ${Math.round(avgDaily * 10) / 10} kg CO₂
- **vs. global average:** ${avgDaily < 16 ? '✅ Below average' : '⚠️ Above average'}

### Transport
- 🚗 Drove: ${Math.round(ctx.totalCarKm)} km
- 🚲 Cycled: ${Math.round(ctx.totalBikeKm)} km  
- 🚶 Walked: ${Math.round(ctx.totalWalkKm)} km

### Diet
- 🥩 Meat meals: ${ctx.meatMealCount}
- 🥬 Vegan meals: ${ctx.veganMealCount}

### Waste
- ♻️ Recycled: ${ctx.totalRecycled} items
- 🗑️ Plastic used: ${ctx.totalPlastic} items

### Streak
- 🔥 Current streak: ${ctx.streak} days

${ctx.avgCarbon < 10 ? '🌟 **Outstanding week!** Your carbon footprint is well below average.' : 
  ctx.avgCarbon < 16 ? '👍 **Good week!** You\'re making a positive impact.' :
  '💪 **Keep going!** Small changes add up to big results.'}
`;
}

/**
 * Answer a sustainability question with pre-built responses
 */
export function answerQuestion(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('carbon') && q.includes('reduce')) {
    return 'The most impactful ways to reduce your carbon footprint are: 1) Switch to renewable energy, 2) Use public transport or cycle, 3) Eat more plant-based meals, 4) Reduce air travel, 5) Improve home insulation. Even small daily changes compound over time!';
  }
  
  if (q.includes('water') && q.includes('save')) {
    return 'Great water-saving tips: 1) Take shorter showers (every minute saves ~9L), 2) Fix leaky faucets, 3) Use a dishwasher instead of hand-washing (saves ~18L per load), 4) Collect rainwater for gardens, 5) Turn off taps while brushing teeth.';
  }
  
  if (q.includes('recycl')) {
    return 'Recycling tips: 1) Learn your local recycling rules, 2) Rinse containers before recycling, 3) Don\'t "wishcycle" — when in doubt, throw it out, 4) Flatten cardboard boxes, 5) Keep recycling bins accessible. Remember: Reduce > Reuse > Recycle!';
  }
  
  if (q.includes('energy') || q.includes('electricity')) {
    return 'Energy-saving strategies: 1) Switch to LED bulbs (use 75% less energy), 2) Unplug devices when not in use, 3) Use a smart thermostat, 4) Wash clothes in cold water, 5) Air dry when possible. These changes can reduce your energy bill by 20-30%!';
  }
  
  return 'That\'s a great question! As a general tip, focus on the areas where you have the biggest impact: transportation, diet, and energy use. Track your daily activities here to see personalized recommendations based on your specific patterns.';
}
