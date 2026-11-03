import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonContent } = body;

    if (!jsonContent) {
      return NextResponse.json({ success: false, error: 'JSON content is required.' }, { status: 400 });
    }

    let parsed;
    try {
      parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON format.' }, { status: 400 });
    }

    if (!parsed.private_key || !parsed.client_email) {
      return NextResponse.json({ success: false, error: 'Invalid service account JSON (missing private_key or client_email).' }, { status: 400 });
    }

    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }

    const filePath = path.join(process.cwd(), 'service-account.json');
    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Service account connected successfully!', projectId: parsed.project_id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to save service account' }, { status: 500 });
  }
}
