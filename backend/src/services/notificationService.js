const User = require('../models/User');
const Follow = require('../models/Follow');
const { sendEmail } = require('./emailService');
const {
  newFollowerTemplate,
  newCommentTemplate,
  newLikeTemplate,
  newVideoFromFollowedUserTemplate,
} = require('../utils/emailTemplates');

const getUserNotificationData = async (userId) => {
  if (!userId) {
    return null;
  }

  return User.findById(userId)
    .select('username email active accountStatus notificationPreferences')
    .lean();
};

const canReceiveEmail = (recipient, preferenceKey) => {
  if (!recipient || !recipient.email || !recipient.active || recipient.accountStatus !== 'active') {
    return false;
  }

  return recipient.notificationPreferences?.email?.[preferenceKey] !== false;
};

const trySend = async (mailData) => {
  try {
    await sendEmail(mailData);
  } catch (err) {
    console.error('Failed to send engagement email:', err.message);
  }
};

const sendNewFollowerNotification = async ({ recipientId, followerId }) => {
  const [recipient, follower] = await Promise.all([
    getUserNotificationData(recipientId),
    getUserNotificationData(followerId),
  ]);

  if (!recipient || !follower || recipient._id.toString() === follower._id.toString()) {
    return;
  }

  if (!canReceiveEmail(recipient, 'followers')) {
    return;
  }

  const template = newFollowerTemplate({
    recipientUsername: recipient.username,
    followerUsername: follower.username,
  });

  await trySend({
    to: recipient.email,
    ...template,
  });
};

const sendNewCommentNotification = async ({ recipientId, commenterId, videoTitle, comment }) => {
  const [recipient, commenter] = await Promise.all([
    getUserNotificationData(recipientId),
    getUserNotificationData(commenterId),
  ]);

  if (!recipient || !commenter || recipient._id.toString() === commenter._id.toString()) {
    return;
  }

  if (!canReceiveEmail(recipient, 'comments')) {
    return;
  }

  const template = newCommentTemplate({
    recipientUsername: recipient.username,
    commenterUsername: commenter.username,
    videoTitle,
    comment,
  });

  await trySend({
    to: recipient.email,
    ...template,
  });
};

const sendNewLikeNotification = async ({ recipientId, likerId, videoTitle }) => {
  const [recipient, liker] = await Promise.all([
    getUserNotificationData(recipientId),
    getUserNotificationData(likerId),
  ]);

  if (!recipient || !liker || recipient._id.toString() === liker._id.toString()) {
    return;
  }

  if (!canReceiveEmail(recipient, 'likes')) {
    return;
  }

  const template = newLikeTemplate({
    recipientUsername: recipient.username,
    likerUsername: liker.username,
    videoTitle,
  });

  await trySend({
    to: recipient.email,
    ...template,
  });
};

const sendNewVideoFromFollowedUserNotification = async ({ creatorId, videoTitle }) => {
  const creator = await getUserNotificationData(creatorId);

  if (!creator) {
    return;
  }

  const followRows = await Follow.find({ followingId: creatorId }).select('followerId').lean();
  const followerIds = [...new Set(followRows.map((f) => f.followerId.toString()))];

  if (followerIds.length === 0) {
    return;
  }

  const followers = await User.find({
    _id: { $in: followerIds },
    active: true,
    accountStatus: 'active',
  })
    .select('username email notificationPreferences')
    .lean();

  const outboundEmails = followers.filter(
    (follower) =>
      follower.email &&
      follower._id.toString() !== creator._id.toString() &&
      follower.notificationPreferences?.email?.newVideos !== false
  );

  await Promise.all(
    outboundEmails.map(async (recipient) => {
      const template = newVideoFromFollowedUserTemplate({
        recipientUsername: recipient.username,
        creatorUsername: creator.username,
        videoTitle,
      });

      await trySend({
        to: recipient.email,
        ...template,
      });
    })
  );
};

module.exports = {
  sendNewFollowerNotification,
  sendNewCommentNotification,
  sendNewLikeNotification,
  sendNewVideoFromFollowedUserNotification,
};
