const appName = 'ClipS';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildLayout = ({ title, preheader, bodyHtml }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f4f6f8;color:#1f2937;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:10px;padding:24px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${appName}</h1>
                ${bodyHtml}
                <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">You are receiving this email because engagement email notifications are enabled in your account settings.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const newFollowerTemplate = ({ recipientUsername, followerUsername }) => {
  const subject = `${followerUsername} started following you on ${appName}`;

  return {
    subject,
    text: `Hi ${recipientUsername},\n\n${followerUsername} started following you on ${appName}.`,
    html: buildLayout({
      title: 'New follower',
      preheader: `${followerUsername} started following you`,
      bodyHtml: `
        <h2 style="margin:0 0 12px;font-size:20px;">New follower</h2>
        <p style="margin:0;font-size:15px;line-height:1.6;">Hi <strong>${escapeHtml(recipientUsername)}</strong>,</p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.6;"><strong>${escapeHtml(followerUsername)}</strong> started following you.</p>
      `,
    }),
  };
};

const newCommentTemplate = ({ recipientUsername, commenterUsername, videoTitle, comment }) => {
  const subject = `${commenterUsername} commented on your video`;

  return {
    subject,
    text: `Hi ${recipientUsername},\n\n${commenterUsername} commented on your video "${videoTitle}":\n\n"${comment}"`,
    html: buildLayout({
      title: 'New comment',
      preheader: `${commenterUsername} commented on your video`,
      bodyHtml: `
        <h2 style="margin:0 0 12px;font-size:20px;">New comment</h2>
        <p style="margin:0;font-size:15px;line-height:1.6;">Hi <strong>${escapeHtml(recipientUsername)}</strong>,</p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.6;"><strong>${escapeHtml(commenterUsername)}</strong> commented on your video <strong>${escapeHtml(videoTitle)}</strong>.</p>
        <blockquote style="margin:14px 0 0;padding:12px 14px;border-left:4px solid #d1d5db;background:#f9fafb;color:#374151;font-size:14px;line-height:1.6;">${escapeHtml(comment)}</blockquote>
      `,
    }),
  };
};

const newLikeTemplate = ({ recipientUsername, likerUsername, videoTitle }) => {
  const subject = `${likerUsername} liked your video`;

  return {
    subject,
    text: `Hi ${recipientUsername},\n\n${likerUsername} liked your video "${videoTitle}" on ${appName}.`,
    html: buildLayout({
      title: 'New like',
      preheader: `${likerUsername} liked your video`,
      bodyHtml: `
        <h2 style="margin:0 0 12px;font-size:20px;">New like</h2>
        <p style="margin:0;font-size:15px;line-height:1.6;">Hi <strong>${escapeHtml(recipientUsername)}</strong>,</p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.6;"><strong>${escapeHtml(likerUsername)}</strong> liked your video <strong>${escapeHtml(videoTitle)}</strong>.</p>
      `,
    }),
  };
};

module.exports = {
  newFollowerTemplate,
  newCommentTemplate,
  newLikeTemplate,
};
