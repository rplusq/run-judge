"use client";

import { Button } from "@/components/ui/button";
import { MonitorIcon as Running } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export function StravaButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button variant="outline" size="sm" onClick={() => signOut()}>
        <Running className="mr-2 h-4 w-4" />
        Disconnect Strava
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => signIn("strava")}>
      <Running className="mr-2 h-4 w-4" />
      Connect Strava
    </Button>
  );
}
