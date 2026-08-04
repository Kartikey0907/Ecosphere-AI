import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { handleSignOut, markNotificationRead, markAllNotificationsRead } from "@/app/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      avatar: true,
      role: true,
      level: true,
      xp: true,
      streak: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch latest notifications
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      read: true,
      createdAt: true,
    },
  });

  // Wrap functions to inject userId where needed for security
  const markReadAction = async (id: string) => {
    "use server";
    await markNotificationRead(id);
  };

  const markAllReadAction = async () => {
    "use server";
    await markAllNotificationsRead(userId);
  };

  const formattedNotifications = notifications.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 overflow-x-hidden font-sans">
      <Sidebar 
        user={{
          ...user,
          level: user.level,
        }} 
        signOutAction={handleSignOut} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          notifications={formattedNotifications} 
          onMarkRead={markReadAction} 
          onMarkAllRead={markAllReadAction} 
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
