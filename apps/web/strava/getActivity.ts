import { DetailedActivity, StravaConfig } from "./types";

export async function getActivity(config: StravaConfig, activityId: string): Promise<DetailedActivity> {

  const response = await fetch(`https://www.strava.com/api/v1/activities/${activityId}`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`
    }
  });
  return await response.json();
}
