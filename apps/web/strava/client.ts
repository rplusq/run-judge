// import { Activity, StravaConfig } from "./types";

// export class Client {
//   private accessToken: string;
//   private refreshToken: string;

//   private baseUrl = 'https://www.strava.com/api/v3'

//   constructor(config: StravaConfig) {
//     this.accessToken = config.accessToken
//     this.refreshToken = config.refreshToken
//   }

//   // async refreshToken(refreshToken: string): Promise<TokenResponse> {
//   //   const response = await fetch(this.auth.tokenUrl, {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json'
//   //     },
//   //     body: JSON.stringify({
//   //       client_id: this.clientId,
//   //       client_secret: this.clientSecret,
//   //       refresh_token: refreshToken,
//   //       grant_type: 'refresh_token'
//   //     })
//   //   })

//   //   if (!response.ok) {
//   //     throw new Error(`Failed to refresh token: ${response.statusText}`)
//   //   }

//   //   return response.json()
//   // }

//   async getActivities(params?: {
//     before?: number
//     after?: number
//     page?: number
//     // Snake case on purpose so we don't have to do key transformations
//     per_page?: number
//   }): Promise<Activity[]> {
//     const searchParams = new URLSearchParams()
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined) {
//           searchParams.append(key, value.toString())
//         }
//       })
//     }

//     const url = `${this.baseUrl}/athlete/activities${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
//     const response = await fetch(url, {
//       headers: {
//         'Authorization': `Bearer ${this.accessToken}`
//       }
//     })

//     if (!response.ok) {
//       throw new Error(`Failed to get activities: ${response.statusText}`)
//     }

//     return response.json()
//   }

//   // async getActivity(accessToken: string, activityId: number): Promise<Activity> {
//   //   const response = await fetch(`${this.baseUrl}/activities/${activityId}`, {
//   //     headers: {
//   //       'Authorization': `Bearer ${accessToken}`
//   //     }
//   //   })

//   //   if (!response.ok) {
//   //     throw new Error(`Failed to get activity: ${response.statusText}`)
//   //   }

//   //   return response.json()
//   // }
// }
