const Stripe = require('stripe');

const Payment = require('../models/Payment');
const Video = require('../models/Video');

let stripeClient = null;

const getStripeClient = () => {
  if (stripeClient) {
    return stripeClient;
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    const err = new Error('STRIPE_SECRET_KEY is not configured');
    err.statusCode = 500;
    throw err;
  }

  stripeClient = new Stripe(stripeSecret);
  return stripeClient;
};

const constructStripeEvent = (payload, signature) => {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    const err = new Error('STRIPE_WEBHOOK_SECRET is not configured');
    err.statusCode = 500;
    throw err;
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

const buildLineItem = ({ amountCents, currency, video }) => {
  const name = video ? `Tip for ${video.title}` : 'ClipS tip';
  const description = video ? 'Support this creator' : 'Support your favorite creator';

  return {
    price_data: {
      currency,
      unit_amount: amountCents,
      product_data: {
        name,
        description,
      },
    },
    quantity: 1,
  };
};

const createTipCheckoutSession = async ({
  amount,
  currency,
  successUrl,
  cancelUrl,
  videoId,
  tipper,
}) => {
  const stripe = getStripeClient();
  const amountCents = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    const err = new Error('Tip amount must be greater than 0');
    err.statusCode = 400;
    throw err;
  }

  let video = null;
  if (videoId) {
    video = await Video.findById(videoId).select('_id owner title');
    if (!video) {
      const err = new Error('Video not found');
      err.statusCode = 404;
      throw err;
    }
  }

  const metadata = {};
  if (video) {
    metadata.videoId = video._id.toString();
    metadata.ownerId = video.owner.toString();
  }
  if (tipper?._id) {
    metadata.tipperId = tipper._id.toString();
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [buildLineItem({ amountCents, currency, video })],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: tipper?.email,
    metadata,
  });

  await Payment.create({
    stripeSessionId: session.id,
    amount: amountCents / 100,
    amountCents,
    currency,
    status: 'pending',
    video: video?._id,
    owner: video?.owner,
    tipper: tipper?._id,
    tipperEmail: tipper?.email,
  });

  return session;
};

const handleCheckoutSessionCompleted = async (session, eventId) => {
  const amountCents = session.amount_total || 0;
  const currency = (session.currency || 'usd').toLowerCase();
  const metadata = session.metadata || {};

  const update = {
    status: 'succeeded',
    stripePaymentIntentId: session.payment_intent || undefined,
    stripeCustomerId: session.customer || undefined,
    stripeEventId: eventId || undefined,
    amount: amountCents ? amountCents / 100 : undefined,
    amountCents: amountCents || undefined,
    currency,
    tipperEmail:
      session.customer_details?.email || session.customer_email || undefined,
  };

  const insertDefaults = {
    stripeSessionId: session.id,
    amount: amountCents ? amountCents / 100 : 0,
    amountCents: amountCents || 0,
    currency,
    status: 'succeeded',
    video: metadata.videoId || undefined,
    owner: metadata.ownerId || undefined,
    tipper: metadata.tipperId || undefined,
    tipperEmail: update.tipperEmail,
  };

  await Payment.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      $set: update,
      $setOnInsert: insertDefaults,
    },
    { upsert: true, new: true }
  );
};

module.exports = {
  createTipCheckoutSession,
  constructStripeEvent,
  handleCheckoutSessionCompleted,
};
