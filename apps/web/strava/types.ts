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

export type ActivitySummary = {
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

export interface DetailedActivity {
  id: number;
  resource_state: number;
  external_id: string;
  upload_id: number;
  athlete: Athlete;
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
  map: ActivityMap;
  average_speed: number;
  max_speed: number;
  average_watts: number;
  device_watts: boolean;
  max_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  gear: Gear;
  segment_efforts: SegmentEffort[];
  splits_metric: Split[];
  laps: Lap[];
  photos: Photos;
}

interface Athlete {
  id: number;
  resource_state: number;
}

interface ActivityMap {
  id: string;
  polyline: string;
  resource_state: number;
  summary_polyline: string;
}

interface Gear {
  id: string;
  primary: boolean;
  name: string;
  resource_state: number;
  distance: number;
}

interface SegmentEffort {
  id: number;
  resource_state: number;
  name: string;
  activity: { id: number; resource_state: number };
  athlete: { id: number; resource_state: number };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  segment: Segment;
}

interface Segment {
  id: number;
  resource_state: number;
  name: string;
  activity_type: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean;
}

interface Split {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  pace_zone: number;
}

interface Lap {
  id: number;
  resource_state: number;
  name: string;
  activity: { id: number; resource_state: number };
  athlete: { id: number; resource_state: number };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  lap_index: number;
}

interface Photos {
  primary: PrimaryPhoto;
  use_primary_photo: boolean;
  count: number;
}

interface PrimaryPhoto {
  id: string | null;
  unique_id: string;
  urls: {
    [key: string]: string;
  };
  source: number;
}
