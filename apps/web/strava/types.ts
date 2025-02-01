export const STRAVA_BASE_URL = "https://www.strava.com/api/v3";

export type StravaConfig = {
  refreshToken?: string;
  accessToken: string;
};

export type TokenResponse = {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
};

export type Activity = {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  start_latlng: [number, number];
  end_latlng: [number, number];
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  average_speed: number;
  max_speed: number;
  average_watts: number;
  max_watts: number;
  weighted_average_watts: number;
};
