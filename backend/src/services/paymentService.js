const Stripe = require('stripe');

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

  return session;
};

module.exports = {
  createTipCheckoutSession,
};
