import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET || 'pulse2026';
  const authHeader = request.headers.get('x-admin-key');
  const queryKey = request.nextUrl.searchParams.get('key');
  return authHeader === secret || queryKey === secret;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await db.getProjects();
  const format = request.nextUrl.searchParams.get('format');

  // CSV Export Mode
  if (format === 'csv') {
    const csvRows = [
      ['Project ID', 'Project Name', 'Owner Email', 'Plan', 'Created At'],
      ...projects.map((p) => [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.ownerEmail || ''}"`,
        `"${p.plan}"`,
        `"${p.createdAt}"`,
      ]),
    ];

    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="logpulse-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // Dashboard Stats JSON Mode
  const totalProjects = projects.length;
  const totalLeads = projects.filter((p) => Boolean(p.ownerEmail)).length;
  const proProjects = projects.filter((p) => p.plan !== 'free').length;

  return NextResponse.json({
    stats: {
      totalProjects,
      totalLeads,
      proProjects,
    },
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      ownerEmail: p.ownerEmail || null,
      plan: p.plan,
      accentColor: p.accentColor,
      createdAt: p.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;
    const secret = process.env.ADMIN_SECRET || 'pulse2026';

    if (key === secret) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid secret key' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
