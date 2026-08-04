import { DAILY_AVERAGES } from './carbon-calculator';

// ─── Score Calculation Engine ───────────────────────────────
// Scores range from 0-100, where 100 is best (lowest impact)

/**
 * Calculate carbon score based on daily footprint vs average
 * Lower footprint = higher score
 */
export function calculateCarbonScore(dailyCarbonKg: number): number {
  const ratio = dailyCarbonKg / DAILY_AVERAGES.carbonFootprint;
  // Score decreases as carbon increases. 0 carbon = 100 score
  const score = Math.max(0, Math.min(100, (1 - ratio) * 100 + 50));
  return Math.round(score);
}

/**
 * Calculate water score based on daily usage vs average
 */
export function calculateWaterScore(dailyLiters: number): number {
  const ratio = dailyLiters / DAILY_AVERAGES.waterUsage;
  const score = Math.max(0, Math.min(100, (1 - ratio) * 100 + 50));
  return Math.round(score);
}

/**
 * Calculate energy score based on daily usage vs average
 */
export function calculateEnergyScore(dailyKwh: number): number {
  const ratio = dailyKwh / DAILY_AVERAGES.electricityUsage;
  const score = Math.max(0, Math.min(100, (1 - ratio) * 100 + 50));
  return Math.round(score);
}

/**
 * Calculate transport score based on green transport ratio
 */
export function calculateTransportScore(log: {
  carKm?: number;
  busKm?: number;
  trainKm?: number;
  bikeKm?: number;
  walkKm?: number;
  flightKm?: number;
}): number {
  const total = (log.carKm || 0) + (log.busKm || 0) + (log.trainKm || 0) 
    + (log.bikeKm || 0) + (log.walkKm || 0) + (log.flightKm || 0);
  
  if (total === 0) return 75; // No transport = neutral-good
  
  const greenKm = (log.bikeKm || 0) + (log.walkKm || 0) + (log.trainKm || 0) + (log.busKm || 0);
  const greenRatio = greenKm / total;
  
  return Math.round(greenRatio * 100);
}

/**
 * Calculate recycling score
 */
export function calculateRecyclingScore(recycledItems: number, plasticItems: number): number {
  const totalWaste = recycledItems + plasticItems;
  if (totalWaste === 0) return 60;
  
  const recyclingRate = recycledItems / totalWaste;
  return Math.round(recyclingRate * 100);
}

/**
 * Calculate waste score (lower waste = higher score)
 */
export function calculateWasteScore(plasticItems: number, compostedKg: number): number {
  const wasteRatio = plasticItems / DAILY_AVERAGES.plasticItems;
  const compostBonus = Math.min(20, compostedKg * 10);
  const score = Math.max(0, Math.min(100, (1 - wasteRatio) * 80 + compostBonus + 20));
  return Math.round(score);
}

/**
 * Calculate overall sustainability score (weighted average)
 */
export function calculateOverallScore(scores: {
  carbonScore: number;
  waterScore: number;
  energyScore: number;
  transportScore: number;
  recyclingScore: number;
  wasteScore: number;
}): number {
  const weights = {
    carbonScore: 0.30,      // Carbon is the biggest factor
    waterScore: 0.15,
    energyScore: 0.20,
    transportScore: 0.15,
    recyclingScore: 0.10,
    wasteScore: 0.10,
  };

  const weighted = 
    scores.carbonScore * weights.carbonScore +
    scores.waterScore * weights.waterScore +
    scores.energyScore * weights.energyScore +
    scores.transportScore * weights.transportScore +
    scores.recyclingScore * weights.recyclingScore +
    scores.wasteScore * weights.wasteScore;

  return Math.round(weighted);
}

/**
 * Get score label and color
 */
export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: '#10b981' };
  if (score >= 75) return { label: 'Great', color: '#34d399' };
  if (score >= 60) return { label: 'Good', color: '#fbbf24' };
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
  if (score >= 20) return { label: 'Needs Work', color: '#ef4444' };
  return { label: 'Critical', color: '#dc2626' };
}
