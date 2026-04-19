import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateUploadSignature } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const topicId = req.nextUrl.searchParams.get('topicId') ?? 'general';
  const params = generateUploadSignature(`topicshare/${topicId}`);
  return NextResponse.json(params);
}
