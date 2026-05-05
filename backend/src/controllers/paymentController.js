const { createTipCheckoutSession } = require('../services/paymentService');

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

module.exports = {
  createSession,
};
