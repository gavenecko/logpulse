import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || 'demo';
  const changelogs = await db.getChangelogs(projectId);
  return NextResponse.json({ changelogs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId = 'demo', title, content, tag } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const item = await db.addChangelog({
      projectId,
      title,
      content,
      tag: tag || 'feature',
    });

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: 'Failed to create changelog' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    // Protect official demo seed items from public deletion
    if (id === 'ch-1' || id === 'ch-2' || id === 'ch-3') {
      return NextResponse.json(
        { error: 'Official demo items are protected from deletion.' },
        { status: 403 }
      );
    }

    await db.deleteChangelog(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete changelog' }, { status: 500 });
  }
}
