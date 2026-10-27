import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId = 'demo', plan = 'pro_lifetime' } = body;

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey) {
      // Production Stripe Checkout session creation
      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          mode: plan === 'pro_lifetime' ? 'payment' : 'subscription',
          success_url: `${request.nextUrl.origin}/dashboard?p=${encodeURIComponent(projectId)}&upgraded=true`,
          cancel_url: `${request.nextUrl.origin}/dashboard?p=${encodeURIComponent(projectId)}&canceled=true`,
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][unit_amount]': plan === 'pro_lifetime' ? '2900' : '900',
          'line_items[0][price_data][product_data][name]':
            plan === 'pro_lifetime'
              ? 'LogPulse Early Bird Lifetime Pass'
              : 'LogPulse Pro Monthly Subscription',
          'line_items[0][quantity]': '1',
          client_reference_id: projectId,
        }),
      });

      const session = await stripeRes.json();
      if (session.url) {
        return NextResponse.json({ url: session.url });
      }
      if (session.error) {
        console.error('Stripe error:', session.error);
        return NextResponse.json({ error: session.error.message }, { status: 400 });
      }
    }

    // Direct / Local Demo activation mode:
    await db.updateProjectPlan(projectId, plan);
    return NextResponse.json({
      url: `/dashboard?p=${encodeURIComponent(projectId)}&upgraded=true&plan=${plan}`,
      demoActivated: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
