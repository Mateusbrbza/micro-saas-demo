import Stripe from "stripe"
import { headers } from "next/headers"
import { handleProcessWebhookUpdatedSubscription, stripe } from "@/services/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (error: any) {
    console.error("Webhook error: ", error.message)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleProcessWebhookUpdatedSubscription(event.data)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return new Response(`{ "received": true }`, { status: 200 })
}
