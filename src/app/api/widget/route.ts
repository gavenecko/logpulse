import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || 'demo';

  const project = await db.getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const [changelogs, roadmap] = await Promise.all([
    db.getChangelogs(projectId),
    db.getRoadmap(projectId),
  ]);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  };

  return NextResponse.json(
    {
      project: {
        id: project.id,
        name: project.name,
        accentColor: project.accentColor,
        showBranding: project.showBranding,
        plan: project.plan,
      },
      changelogs,
      roadmap,
    },
    { headers }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
