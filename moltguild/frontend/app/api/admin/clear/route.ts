import { NextResponse } from 'next/server';
import { clearAll } from '@/lib/storage';

// POST /api/admin/clear - DANGEROUS: clears all agents/squads (admin only)
export async function POST(request: Request) {
  try {
    const adminKey = request.headers.get('x-admin-key') || '';
    const expected = process.env.ADMIN_CLEAR_KEY || '';
    if (!expected || adminKey !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clearAll();
    return NextResponse.json({ success: true, message: 'All MoltSquad data cleared' });
  } catch (error: any) {
    console.error('Admin clear error:', error);
    return NextResponse.json({ error: error.message || 'Failed to clear' }, { status: 500 });
  }
}
