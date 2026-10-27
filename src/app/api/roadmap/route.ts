import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || 'demo';
  const roadmap = await db.getRoadmap(projectId);
  return NextResponse.json({ roadmap });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId = 'demo', title, description, status } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const item = await db.addRoadmapItem({
      projectId,
      title,
      description,
      status: status || 'planned',
    });

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: 'Failed to create roadmap item' }, { status: 500 });
  }
}
