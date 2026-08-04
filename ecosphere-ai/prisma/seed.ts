import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.leaderboardEntry.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userChallenge.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.sustainabilityScore.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Users ───────────────────────────────────────

  // Password: "password123" hashed with bcrypt
  const passwordHash = '$2a$10$K4tEGxWFYDHIqNUgmDcDku2B0rOqJHlxXv2SKi.E1S3wQGUGmCZCy';

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@ecosphere.ai',
      passwordHash,
      name: 'Alex Green',
      role: 'USER',
      level: 7,
      xp: 2150,
      streak: 12,
      longestStreak: 18,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ecosphere.ai',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      level: 15,
      xp: 22000,
      streak: 45,
      longestStreak: 45,
    },
  });

  // Create community users
  const communityUsers = await Promise.all([
    prisma.user.create({
      data: { email: 'emma@example.com', passwordHash, name: 'Emma Rivers', level: 10, xp: 5800, streak: 22, longestStreak: 30 },
    }),
    prisma.user.create({
      data: { email: 'noah@example.com', passwordHash, name: 'Noah Forest', level: 8, xp: 3200, streak: 8, longestStreak: 15 },
    }),
    prisma.user.create({
      data: { email: 'olivia@example.com', passwordHash, name: 'Olivia Sky', level: 12, xp: 10500, streak: 35, longestStreak: 42 },
    }),
    prisma.user.create({
      data: { email: 'liam@example.com', passwordHash, name: 'Liam Earth', level: 5, xp: 1050, streak: 5, longestStreak: 12 },
    }),
    prisma.user.create({
      data: { email: 'sophia@example.com', passwordHash, name: 'Sophia Ocean', level: 9, xp: 4200, streak: 15, longestStreak: 20 },
    }),
  ]);

  console.log('✅ Users created');

  // ─── Create Daily Logs (30 days of data for demo user) ──

  const today = new Date();
  const dailyLogs = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Simulate realistic patterns with some variation
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const randomFactor = 0.7 + Math.random() * 0.6;

    const carKm = isWeekend 
      ? Math.round(Math.random() * 15) 
      : Math.round((10 + Math.random() * 20) * randomFactor);
    const busKm = isWeekend ? 0 : Math.round(Math.random() * 8);
    const trainKm = isWeekend ? 0 : Math.round(Math.random() * 15);
    const bikeKm = Math.round(Math.random() * 10 * randomFactor);
    const walkKm = Math.round((1 + Math.random() * 5) * randomFactor);
    
    const waterUsage = Math.round((100 + Math.random() * 80) * randomFactor);
    const electricityUsage = Math.round((5 + Math.random() * 8) * randomFactor * 10) / 10;
    
    const meatMeals = Math.round(Math.random() * 2);
    const vegMeals = Math.round(Math.random() * 2);
    const veganMeals = Math.round(Math.random() * 2);
    
    const plasticItems = Math.round(Math.random() * 5);
    const recycledItems = Math.round(Math.random() * 6);
    const compostedKg = Math.round(Math.random() * 2 * 10) / 10;

    // Calculate carbon footprint
    const carbonFootprint = Math.round((
      carKm * 0.21 +
      busKm * 0.089 +
      trainKm * 0.041 +
      meatMeals * 3.3 +
      vegMeals * 1.7 +
      veganMeals * 0.9 +
      electricityUsage * 0.42 +
      waterUsage * 0.0003 +
      plasticItems * 0.04 -
      recycledItems * 0.02 -
      compostedKg * 0.1
    ) * 100) / 100;

    dailyLogs.push({
      userId: demoUser.id,
      date: dateStr,
      carKm,
      busKm,
      trainKm,
      bikeKm,
      walkKm,
      flightKm: 0,
      waterUsage,
      electricityUsage,
      meatMeals,
      vegMeals,
      veganMeals,
      plasticItems,
      recycledItems,
      compostedKg,
      newClothingItems: i % 7 === 0 ? 1 : 0,
      secondHandItems: i % 10 === 0 ? 1 : 0,
      carbonFootprint: Math.max(0, carbonFootprint),
    });
  }

  await prisma.dailyLog.createMany({ data: dailyLogs });
  console.log('✅ Daily logs created (30 days)');

  // ─── Create Sustainability Scores ─────────────────────────

  const scores = dailyLogs.map(log => ({
    userId: demoUser.id,
    date: log.date,
    carbonScore: Math.round(Math.max(0, Math.min(100, 75 - log.carbonFootprint * 2 + Math.random() * 20))),
    waterScore: Math.round(Math.max(0, Math.min(100, 80 - (log.waterUsage - 100) * 0.3 + Math.random() * 15))),
    energyScore: Math.round(Math.max(0, Math.min(100, 75 - (log.electricityUsage - 5) * 3 + Math.random() * 15))),
    transportScore: Math.round(Math.max(0, Math.min(100, 
      ((log.bikeKm + log.walkKm + log.trainKm + log.busKm) / 
       Math.max(1, log.carKm + log.bikeKm + log.walkKm + log.trainKm + log.busKm)) * 100
    ))),
    recyclingScore: Math.round(Math.max(0, Math.min(100,
      (log.recycledItems / Math.max(1, log.recycledItems + log.plasticItems)) * 100
    ))),
    wasteScore: Math.round(Math.max(0, Math.min(100, 80 - log.plasticItems * 8 + log.compostedKg * 15))),
    overallScore: 0, // Will be calculated
  }));

  // Calculate overall scores
  for (const score of scores) {
    score.overallScore = Math.round(
      score.carbonScore * 0.30 +
      score.waterScore * 0.15 +
      score.energyScore * 0.20 +
      score.transportScore * 0.15 +
      score.recyclingScore * 0.10 +
      score.wasteScore * 0.10
    );
  }

  await prisma.sustainabilityScore.createMany({ data: scores });
  console.log('✅ Sustainability scores created');

  // ─── Create Goals ─────────────────────────────────────────

  await prisma.goal.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Reduce emissions by 15%',
        description: 'Lower my weekly carbon footprint compared to last month',
        category: 'CARBON',
        targetValue: 15,
        currentValue: 8.5,
        unit: '%',
        startDate: new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 16 * 86400000).toISOString().split('T')[0],
        status: 'ACTIVE',
      },
      {
        userId: demoUser.id,
        title: 'Save 1000L of water',
        description: 'Reduce water consumption this month',
        category: 'WATER',
        targetValue: 1000,
        currentValue: 620,
        unit: 'liters',
        startDate: new Date(today.getTime() - 20 * 86400000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 10 * 86400000).toISOString().split('T')[0],
        status: 'ACTIVE',
      },
      {
        userId: demoUser.id,
        title: 'Walk 50 km this month',
        description: 'Replace short car trips with walking',
        category: 'TRANSPORT',
        targetValue: 50,
        currentValue: 32,
        unit: 'km',
        startDate: new Date(today.getTime() - 18 * 86400000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 12 * 86400000).toISOString().split('T')[0],
        status: 'ACTIVE',
      },
      {
        userId: demoUser.id,
        title: 'Zero single-use plastic week',
        description: 'Avoid all single-use plastics for 7 days straight',
        category: 'WASTE',
        targetValue: 7,
        currentValue: 7,
        unit: 'days',
        startDate: new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() - 23 * 86400000).toISOString().split('T')[0],
        status: 'COMPLETED',
      },
    ],
  });
  console.log('✅ Goals created');

  // ─── Create Challenges ────────────────────────────────────

  const challenges = await prisma.challenge.createMany({
    data: [
      { title: 'Meatless Monday', description: 'Have no meat meals today', category: 'CARBON', xpReward: 50, difficulty: 'EASY', type: 'DAILY', targetValue: 1, unit: 'day', icon: '🥗' },
      { title: 'Green Commute', description: 'Use only bike/walk/public transport today', category: 'TRANSPORT', xpReward: 75, difficulty: 'MEDIUM', type: 'DAILY', targetValue: 1, unit: 'day', icon: '🚲' },
      { title: 'Water Warrior', description: 'Keep water usage under 100L today', category: 'WATER', xpReward: 60, difficulty: 'MEDIUM', type: 'DAILY', targetValue: 100, unit: 'liters', icon: '💧' },
      { title: 'Zero Waste Day', description: 'No single-use plastic today', category: 'RECYCLING', xpReward: 80, difficulty: 'HARD', type: 'DAILY', targetValue: 0, unit: 'items', icon: '♻️' },
      { title: 'Energy Saver', description: 'Keep electricity under 5 kWh today', category: 'ENERGY', xpReward: 70, difficulty: 'MEDIUM', type: 'DAILY', targetValue: 5, unit: 'kWh', icon: '⚡' },
      { title: 'Week of Walks', description: 'Walk at least 3 km every day this week', category: 'TRANSPORT', xpReward: 200, difficulty: 'MEDIUM', type: 'WEEKLY', targetValue: 21, unit: 'km', icon: '🚶' },
      { title: 'Veggie Week', description: 'Eat only vegetarian/vegan meals for 7 days', category: 'CARBON', xpReward: 300, difficulty: 'HARD', type: 'WEEKLY', targetValue: 7, unit: 'days', icon: '🌿' },
      { title: 'Recycle Champion', description: 'Recycle at least 30 items this week', category: 'RECYCLING', xpReward: 250, difficulty: 'MEDIUM', type: 'WEEKLY', targetValue: 30, unit: 'items', icon: '🏆' },
      { title: 'Carbon Halver', description: 'Keep daily carbon under 8 kg for 30 days', category: 'CARBON', xpReward: 1000, difficulty: 'EPIC', type: 'MONTHLY', targetValue: 30, unit: 'days', icon: '🌍' },
      { title: 'Eco Master', description: 'Maintain sustainability score above 80 for a month', category: 'GENERAL', xpReward: 1500, difficulty: 'EPIC', type: 'MONTHLY', targetValue: 30, unit: 'days', icon: '👑' },
    ],
  });
  console.log('✅ Challenges created');

  // ─── Create Achievements ──────────────────────────────────

  await prisma.achievement.createMany({
    data: [
      // Streak achievements
      { name: 'First Step', description: 'Log your first day of activities', icon: '👣', category: 'STREAKS', requirement: '{"type":"streak","value":1}', xpReward: 25 },
      { name: 'Week Warrior', description: 'Maintain a 7-day logging streak', icon: '🔥', category: 'STREAKS', requirement: '{"type":"streak","value":7}', xpReward: 100 },
      { name: 'Fortnight Fighter', description: 'Maintain a 14-day logging streak', icon: '⚡', category: 'STREAKS', requirement: '{"type":"streak","value":14}', xpReward: 200 },
      { name: 'Monthly Master', description: 'Maintain a 30-day logging streak', icon: '🌟', category: 'STREAKS', requirement: '{"type":"streak","value":30}', xpReward: 500 },
      
      // Carbon achievements
      { name: 'Carbon Cutter', description: 'Achieve a daily footprint under 5 kg CO₂', icon: '🌿', category: 'CARBON', requirement: '{"type":"carbon_under","value":5}', xpReward: 75 },
      { name: 'Net Zero Day', description: 'Achieve a near-zero carbon day', icon: '🌱', category: 'CARBON', requirement: '{"type":"carbon_under","value":1}', xpReward: 250 },
      { name: 'Green Commuter', description: 'Use only green transport for 7 days', icon: '🚲', category: 'CARBON', requirement: '{"type":"green_transport_days","value":7}', xpReward: 150 },
      
      // Water achievements
      { name: 'Water Wise', description: 'Keep water usage under 100L for 3 days', icon: '💧', category: 'WATER', requirement: '{"type":"water_under","value":3}', xpReward: 100 },
      { name: 'Desert Rose', description: 'Keep water usage under 80L for 7 days', icon: '🌹', category: 'WATER', requirement: '{"type":"water_under_extreme","value":7}', xpReward: 300 },
      
      // Energy achievements
      { name: 'Power Down', description: 'Keep electricity under 5 kWh for 3 days', icon: '🔋', category: 'ENERGY', requirement: '{"type":"energy_under","value":3}', xpReward: 100 },
      { name: 'Off the Grid', description: 'Keep electricity under 3 kWh for a day', icon: '🏕️', category: 'ENERGY', requirement: '{"type":"energy_under_extreme","value":1}', xpReward: 200 },
      
      // Social achievements
      { name: 'Social Butterfly', description: 'Add your first friend', icon: '🦋', category: 'SOCIAL', requirement: '{"type":"friends","value":1}', xpReward: 50 },
      { name: 'Team Player', description: 'Complete 5 community challenges', icon: '🤝', category: 'SOCIAL', requirement: '{"type":"challenges_completed","value":5}', xpReward: 200 },
      
      // General
      { name: 'Goal Setter', description: 'Create your first sustainability goal', icon: '🎯', category: 'GENERAL', requirement: '{"type":"goals_created","value":1}', xpReward: 50 },
      { name: 'Achiever', description: 'Complete your first goal', icon: '🏅', category: 'GENERAL', requirement: '{"type":"goals_completed","value":1}', xpReward: 150 },
      { name: 'Score Master', description: 'Achieve a sustainability score of 90+', icon: '💎', category: 'GENERAL', requirement: '{"type":"score_above","value":90}', xpReward: 500 },
    ],
  });

  // Unlock some achievements for demo user
  const achievements = await prisma.achievement.findMany();
  const unlockedNames = ['First Step', 'Week Warrior', 'Carbon Cutter', 'Water Wise', 'Goal Setter', 'Achiever'];
  
  for (const name of unlockedNames) {
    const achievement = achievements.find(a => a.name === name);
    if (achievement) {
      await prisma.userAchievement.create({
        data: {
          userId: demoUser.id,
          achievementId: achievement.id,
          unlockedAt: new Date(today.getTime() - Math.random() * 20 * 86400000),
        },
      });
    }
  }
  console.log('✅ Achievements created');

  // ─── Create Notifications ─────────────────────────────────

  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, title: '🔥 12-day streak!', message: 'Keep it up! You\'re building sustainable habits.', type: 'SYSTEM', read: false },
      { userId: demoUser.id, title: '🏆 Achievement Unlocked!', message: 'You earned the "Water Wise" badge!', type: 'ACHIEVEMENT', read: false },
      { userId: demoUser.id, title: '🤖 AI Insight', message: 'Switching to public transit 3 days/week could save 180 kg CO₂/year.', type: 'AI_INSIGHT', read: true },
      { userId: demoUser.id, title: '🎯 Goal Progress', message: 'You\'re 62% towards your water savings goal!', type: 'GOAL', read: true },
      { userId: demoUser.id, title: '⚡ New Challenge', message: 'Weekly challenge "Veggie Week" is now available!', type: 'CHALLENGE', read: false },
    ],
  });
  console.log('✅ Notifications created');

  // ─── Create AI Insights ───────────────────────────────────

  await prisma.aiInsight.createMany({
    data: [
      { userId: demoUser.id, type: 'RECOMMENDATION', title: '🚗 Switch to Public Transit', content: 'Based on your driving patterns, switching to public transport 3 days a week could reduce your annual emissions by approximately 180 kg of CO₂. That\'s equivalent to planting 8 trees!', impact: 'HIGH', category: 'TRANSPORT' },
      { userId: demoUser.id, type: 'TIP', title: '🌿 Plant-Based Champion!', content: 'You had 8 vegan meals this week! Each one saved about 2.4 kg of CO₂ compared to meat. You\'re a plant-powered hero!', impact: 'MEDIUM', category: 'CARBON' },
      { userId: demoUser.id, type: 'FORECAST', title: '📊 Monthly Carbon Forecast', content: 'Based on your current trend, your monthly carbon footprint will be approximately 285 kg CO₂. That\'s below the national average. You\'re doing great — keep up the sustainable choices!', impact: 'HIGH', category: 'CARBON' },
      { userId: demoUser.id, type: 'TIP', title: '💧 Water Warrior!', content: 'Your daily water usage of 115L is 23% below average. You\'re conserving a precious resource — keep it up!', impact: 'LOW', category: 'WATER' },
      { userId: demoUser.id, type: 'ALERT', title: '⚡ Energy Spike Detected', content: 'Your electricity usage spiked to 12 kWh yesterday — 20% above your average. Check for devices left running overnight.', impact: 'MEDIUM', category: 'ENERGY' },
    ],
  });
  console.log('✅ AI insights created');

  // ─── Create Leaderboard Entries ───────────────────────────

  const allUsers = [demoUser, adminUser, ...communityUsers];
  for (const user of allUsers) {
    await prisma.leaderboardEntry.create({
      data: {
        userId: user.id,
        period: 'WEEKLY',
        score: Math.round(Math.random() * 500 + 200),
        rank: 0,
      },
    });
  }

  // Update ranks
  const entries = await prisma.leaderboardEntry.findMany({
    where: { period: 'WEEKLY' },
    orderBy: { score: 'desc' },
  });
  
  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({
      where: { id: entries[i].id },
      data: { rank: i + 1 },
    });
  }
  console.log('✅ Leaderboard entries created');

  // ─── Create Friend Relationships ─────────────────────────

  await prisma.friend.createMany({
    data: [
      { userId: demoUser.id, friendId: communityUsers[0].id, status: 'ACCEPTED' },
      { userId: demoUser.id, friendId: communityUsers[1].id, status: 'ACCEPTED' },
      { userId: demoUser.id, friendId: communityUsers[2].id, status: 'ACCEPTED' },
      { userId: communityUsers[3].id, friendId: demoUser.id, status: 'PENDING' },
    ],
  });
  console.log('✅ Friend relationships created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Demo user: demo@ecosphere.ai / password123');
  console.log('Admin user: admin@ecosphere.ai / password123');
  console.log('─────────────────────────────────');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
