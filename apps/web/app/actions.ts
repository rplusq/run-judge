'use server';

interface Participant {
  address: string;
  activityId: string | null;
}

export async function triggerRunJudgeAgent(
  challengeId: string,
  participants: Participant[]
) {
  const runJudgeAgentUrl =
    process.env.NEXT_PUBLIC_RUN_JUDGE_AGENT_URL || 'http://localhost:3001';

  // Filter out participants without activity IDs
  const validParticipants = participants.filter((p) => p.activityId !== null);

  if (validParticipants.length !== 2) {
    throw new Error('Expected exactly 2 participants with activity IDs');
  }

  try {
    const response = await fetch(`${runJudgeAgentUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeId: parseInt(challengeId),
        activityIds: validParticipants.map((p) => p.activityId),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to trigger run judge agent: ${await response.text()}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error triggering run judge agent:', error);
    throw error;
  }
}
