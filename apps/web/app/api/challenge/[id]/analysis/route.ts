import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await prisma.challengeAnalysis.findUnique({
      where: { challengeId: parseInt(params.id) },
      include: { activityResults: true },
    });

    if (!analysis) {
      return NextResponse.json(null);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching challenge analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge analysis' },
      { status: 500 }
    );
  }
}
