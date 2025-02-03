import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { getActivities } from "@/strava";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  // We have a unique constraint in these two columns anyway
  const userAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider: "strava",
    },
  });

  if (!userAccount) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (!userAccount.access_token) {
    return Response.json({ error: "No access token" }, { status: 401 });
  }

  const activities = await getActivities({
    accessToken: userAccount.access_token,
  });

  console.log(activities);

  return Response.json({ status: "OK" });
}
