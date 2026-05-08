const placeholderVideo =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function buildSvgAvatar(initials: string, start: string, end: string) {
  const safeText = initials.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill="url(#g)"/>
      <text x="50%" y="54%" fill="white" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="700" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function buildAvatarFromUsername(username?: string) {
  const letters = (username || "user").slice(0, 2).toUpperCase();
  return buildSvgAvatar(letters, "#0f172a", "#1f2937");
}

export function buildPosterFromTitle(title?: string) {
  const text = (title || "Clip").slice(0, 16);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07111f"/>
          <stop offset="100%" stop-color="#123d63"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#g)"/>
      <circle cx="860" cy="300" r="260" fill="#22d3ee" fill-opacity="0.25"/>
      <text x="80" y="1500" fill="white" font-family="Inter, Arial, sans-serif" font-size="88" font-weight="700">${text}</text>
      <text x="80" y="1580" fill="white" fill-opacity="0.7" font-family="Inter, Arial, sans-serif" font-size="32">ClipS</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getFallbackVideoSrc() {
  return placeholderVideo;
}
