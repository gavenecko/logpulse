import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const project = await db.getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain = '', accentColor = '#6366f1' } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Create the project
    const project = await db.createProject({
      name: name.trim(),
      domain: domain.trim(),
      ownerEmail: '',
      plan: 'free',
      accentColor,
      showBranding: true,
    });

    // Seed with 1 welcome release note and 1 starter roadmap item
    await db.addChangelog({
      projectId: project.id,
      title: `Welcome to ${project.name} Updates! 🎉`,
      content: 'This is your first release note. You can edit this, delete it, or post new updates from your dashboard.',
      tag: 'feature',
    });

    await db.addRoadmapItem({
      projectId: project.id,
      title: 'Dark Mode Support',
      description: 'Vote on whether we should add automatic OS dark mode.',
      status: 'planned',
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}
