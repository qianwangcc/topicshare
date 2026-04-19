import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, avatar: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, avatar } = await req.json();
  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
    },
    select: { id: true, name: true, email: true, avatar: true },
  });

  return NextResponse.json(user);
}
