import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateCarbonFootprint } from "@/lib/carbon-calculator";
import { 
  calculateCarbonScore, 
  calculateWaterScore, 
  calculateEnergyScore, 
  calculateTransportScore, 
  calculateRecyclingScore, 
  calculateWasteScore, 
  calculateOverallScore 
} from "@/lib/score-calculator";
import { calculateLogXp, getLevelFromXp } from "@/lib/xp-engine";
import { getToday, getDaysAgo } from "@/lib/utils";

const logSchema = z.object({
  carKm: z.number().nonnegative().default(0),
  busKm: z.number().nonnegative().default(0),
  trainKm: z.number().nonnegative().default(0),
  bikeKm: z.number().nonnegative().default(0),
  walkKm: z.number().nonnegative().default(0),
  waterUsage: z.number().nonnegative().default(0),
  electricityUsage: z.number().nonnegative().default(0),
  meatMeals: z.number().nonnegative().default(0),
  vegMeals: z.number().nonnegative().default(0),
  veganMeals: z.number().nonnegative().default(0),
  plasticItems: z.number().nonnegative().default(0),
  recycledItems: z.number().nonnegative().default(0),
  compostedKg: z.number().nonnegative().default(0),
  newClothingItems: z.number().nonnegative().default(0),
  secondHandItems: z.number().nonnegative().default(0),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const result = logSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid log details" }, { status: 400 });
    }

    const logData = result.data;
    const todayStr = getToday();
    const yesterdayStr = getDaysAgo(1);

    // Calculate footprint
    const carbonFootprint = calculateCarbonFootprint(logData);

    // Fetch user details for XP and streak processing
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Process Streak
    let newStreak = user.streak;
    if (user.lastLogDate === yesterdayStr) {
      newStreak += 1;
    } else if (user.lastLogDate !== todayStr) {
      newStreak = 1;
    }
    const longestStreak = Math.max(user.longestStreak, newStreak);

    // 2. Save Daily Log
    await prisma.dailyLog.upsert({
      where: {
        userId_date: { userId, date: todayStr },
      },
      update: {
        ...logData,
        carbonFootprint,
      },
      create: {
        userId,
        date: todayStr,
        ...logData,
        carbonFootprint,
      },
    });

    // 3. Process Scores
    const carbonScore = calculateCarbonScore(carbonFootprint);
    const waterScore = calculateWaterScore(logData.waterUsage);
    const energyScore = calculateEnergyScore(logData.electricityUsage);
    const transportScore = calculateTransportScore(logData);
    const recyclingScore = calculateRecyclingScore(logData.recycledItems, logData.plasticItems);
    const wasteScore = calculateWasteScore(logData.plasticItems, logData.compostedKg);
    const overallScore = calculateOverallScore({
      carbonScore,
      waterScore,
      energyScore,
      transportScore,
      recyclingScore,
      wasteScore,
    });

    await prisma.sustainabilityScore.upsert({
      where: {
        userId_date: { userId, date: todayStr },
      },
      update: {
        carbonScore,
        waterScore,
        energyScore,
        transportScore,
        recyclingScore,
        wasteScore,
        overallScore,
      },
      create: {
        userId,
        date: todayStr,
        carbonScore,
        waterScore,
        energyScore,
        transportScore,
        recyclingScore,
        wasteScore,
        overallScore,
      },
    });

    // 4. Calculate XP & Level Progression
    const clientLogInput = {
      ...logData,
      carbonFootprint,
    };
    const { totalXp } = calculateLogXp(clientLogInput, newStreak);
    
    const oldLevelInfo = getLevelFromXp(user.xp);
    const newXp = user.xp + totalXp;
    const newLevelInfo = getLevelFromXp(newXp);
    const levelUp = newLevelInfo.level > oldLevelInfo.level;

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevelInfo.level,
        streak: newStreak,
        longestStreak,
        lastLogDate: todayStr,
      },
    });

    // 5. Progress active challenges
    const activeUserChallenges = await prisma.userChallenge.findMany({
      where: { userId, completed: false },
      include: { challenge: true },
    });

    for (const uc of activeUserChallenges) {
      const challenge = uc.challenge;
      let progressIncrement = 0;

      if (challenge.category === "CARBON" && challenge.type === "DAILY" && carbonFootprint <= challenge.targetValue) {
        progressIncrement = 1;
      } else if (challenge.category === "TRANSPORT" && challenge.type === "DAILY" && (logData.bikeKm + logData.walkKm) > 0) {
        progressIncrement = 1;
      } else if (challenge.category === "WATER" && challenge.type === "DAILY" && logData.waterUsage <= challenge.targetValue) {
        progressIncrement = 1;
      } else if (challenge.category === "RECYCLING" && challenge.type === "DAILY" && logData.plasticItems === 0) {
        progressIncrement = 1;
      }

      if (progressIncrement > 0) {
        const newProgress = uc.progress + progressIncrement;
        const completed = newProgress >= challenge.targetValue;
        
        await prisma.userChallenge.update({
          where: { id: uc.id },
          data: {
            progress: newProgress,
            completed,
            completedAt: completed ? new Date() : null,
          },
        });

        if (completed) {
          // Award challenge reward
          await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: challenge.xpReward } },
          });

          await prisma.notification.create({
            data: {
              userId,
              title: `🎉 Challenge Completed!`,
              message: `You completed "${challenge.title}" and earned ${challenge.xpReward} XP!`,
              type: "CHALLENGE",
            },
          });
        }
      }
    }

    // 6. Award achievement if first step
    if (user.xp === 0) {
      const firstStepAch = await prisma.achievement.findUnique({
        where: { name: "First Step" },
      });
      if (firstStepAch) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: firstStepAch.id,
          },
        });
        await prisma.notification.create({
          data: {
            userId,
            title: `🏆 Badge Unlocked: ${firstStepAch.name}`,
            message: `You unlocked the "${firstStepAch.name}" badge.`,
            type: "ACHIEVEMENT",
          },
        });
      }
    }

    // Send notifications for streak
    if (newStreak % 7 === 0 && user.streak !== newStreak) {
      await prisma.notification.create({
        data: {
          userId,
          title: `🔥 Streak Milestone reached!`,
          message: `Congratulations on keeping your logging streak for ${newStreak} days!`,
          type: "SYSTEM",
        },
      });
    }

    if (levelUp) {
      await prisma.notification.create({
        data: {
          userId,
          title: `⚡ Level Up!`,
          message: `Congratulations! You reached Level ${newLevelInfo.level}: ${newLevelInfo.name}.`,
          type: "SYSTEM",
        },
      });
    }

    return NextResponse.json({
      message: "Log saved successfully",
      carbonFootprint,
      xpEarned: totalXp,
      levelUp,
    });
  } catch (error: any) {
    console.error("Log saving error:", error);
    return NextResponse.json({ error: "Failed to record activity log" }, { status: 500 });
  }
}
