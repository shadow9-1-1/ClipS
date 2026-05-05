const {
  createTipCheckoutSession,
  constructStripeEvent,
  handleCheckoutSessionCompleted,
} = require('../services/paymentService');

const createSession = async (req, res) => {
  const session = await createTipCheckoutSession({
    amount: req.body.amount,
    currency: req.body.currency,
    successUrl: req.body.successUrl,
    cancelUrl: req.body.cancelUrl,
    videoId: req.body.videoId,
    tipper: req.user,
  });

  res.status(201).json({
    status: 'success',
    message: 'Checkout session created successfully',
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
};

const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing Stripe signature',
    });
  }

  let event;
  try {
    event = constructStripeEvent(req.body, signature);
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      message: `Webhook signature verification failed: ${err.message}`,
    });
  }

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutSessionCompleted(event.data.object, event.id);
  }

  return res.status(200).json({ received: true });
};

module.exports = {
  createSession,
  handleWebhook,
};
