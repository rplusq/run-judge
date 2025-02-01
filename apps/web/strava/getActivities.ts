import { Activity, STRAVA_BASE_URL, StravaConfig } from "./types";

export async function getActivities(
  config: StravaConfig,
  params?: {
    before?: number;
    after?: number;
    page?: number;
  },
): Promise<Activity[]> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = `${STRAVA_BASE_URL}/athlete/activities${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get activities: ${response.statusText}`);
  }

  return response.json();
}
