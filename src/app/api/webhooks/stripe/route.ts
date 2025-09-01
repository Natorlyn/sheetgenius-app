import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Webhook called!');
  return NextResponse.json({ received: true, message: 'Webhook endpoint working' });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook endpoint is active' });
}