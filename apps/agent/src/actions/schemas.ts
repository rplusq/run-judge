import { z } from 'zod';

export const DeclareWinnerSchema = z
  .object({
    challengeId: z.number().describe('The ID of the challenge'),
    stravaActivityId: z
      .number()
      .describe('The ID of the Strava activity of the winner'),
  })
  .strip()
  .describe('Input to declare an on-chain winner');
