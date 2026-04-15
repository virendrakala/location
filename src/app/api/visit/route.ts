import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { visitId, latitude, longitude, accuracy } = body;

    if (!visitId) {
      return NextResponse.json({ error: 'Missing visitId' }, { status: 400 });
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        latitude: typeof latitude === 'number' ? latitude : null,
        longitude: typeof longitude === 'number' ? longitude : null,
        accuracy: typeof accuracy === 'number' ? accuracy : null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Visit PATCH Error:", error);
    return NextResponse.json({ error: 'Failed to update visit' }, { status: 500 });
  }
}
