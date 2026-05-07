export type Orientation = "portrait" | "landscape";

export type User = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
};

export type Video = {
  id: string;
  userId: string;
  caption: string;
  music: string;
  tags: string[];
  orientation: Orientation;
  src: string;
  poster: string;
  likes: number;
  commentCount: number;
  shares: number;
  saves: number;
  rating: number;
  ratingCount: number;
  duration: number;
  createdAt: string;
};

export type Comment = {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  likes: number;
  createdAt: string;
};

export const currentUserId = "u_me";

const sampleVideos = {
  sunset: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  city: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  canyon: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  rails: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  surf: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  road: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  skyline: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  storm: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  forest: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  ripple: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
};

function svgDataUri(title: string, start: string, end: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="r" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#g)"/>
      <circle cx="260" cy="260" r="280" fill="url(#r)"/>
      <circle cx="840" cy="1460" r="340" fill="${accent}" fill-opacity="0.14"/>
      <text x="80" y="1600" fill="white" font-family="Inter, Arial, sans-serif" font-size="92" font-weight="700">${title}</text>
      <text x="80" y="1688" fill="white" fill-opacity="0.72" font-family="Inter, Arial, sans-serif" font-size="34">ClipS mock feed</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const users: User[] = [
  {
    id: currentUserId,
    username: "caseyv",
    displayName: "Casey Vega",
    avatar: svgDataUri("CV", "#0f172a", "#123c63", "#38bdf8"),
    bio: "Building scenes, cutting loops, and shipping tiny worlds in motion.",
    verified: true,
    followers: 182000,
    following: 146,
  },
  {
    id: "u_nova",
    username: "novaframe",
    displayName: "Nova Frame",
    avatar: svgDataUri("NF", "#1f1147", "#4f46e5", "#a78bfa"),
    bio: "Microcinematic edits and neon weather.",
    verified: true,
    followers: 92000,
    following: 88,
  },
  {
    id: "u_flux",
    username: "fluxgarden",
    displayName: "Flux Garden",
    avatar: svgDataUri("FG", "#062b2f", "#0ea5e9", "#22c55e"),
    bio: "Ambient loops, analog light, and city rhythm.",
    verified: false,
    followers: 44200,
    following: 111,
  },
  {
    id: "u_river",
    username: "rivertide",
    displayName: "River Tide",
    avatar: svgDataUri("RT", "#31111d", "#b91c1c", "#fb7185"),
    bio: "Documentary fragments, skate cuts, and travel frames.",
    verified: false,
    followers: 67100,
    following: 206,
  },
  {
    id: "u_glow",
    username: "glowloop",
    displayName: "Glow Loop",
    avatar: svgDataUri("GL", "#25143d", "#7c3aed", "#22d3ee"),
    bio: "Color studies for motion-first storytelling.",
    verified: true,
    followers: 128000,
    following: 93,
  },
  {
    id: "u_milo",
    username: "milo_north",
    displayName: "Milo North",
    avatar: svgDataUri("MN", "#1f2937", "#0f766e", "#67e8f9"),
    bio: "Short-form comedy, tiny set design, and one-take edits.",
    verified: false,
    followers: 38600,
    following: 74,
  },
];

export const videos: Video[] = [
  {
    id: "v1",
    userId: "u_nova",
    caption: "Night drive gradients with a cyan pulse and a lens flare edge.",
    music: "Midnight Pulse - Nova Frame",
    tags: ["#city", "#cinematic", "#neon"],
    orientation: "portrait",
    src: sampleVideos.sunset,
    poster: svgDataUri("Night Drive", "#020617", "#1e3a8a", "#22d3ee"),
    likes: 124300,
    commentCount: 2140,
    shares: 1820,
    saves: 3600,
    rating: 4.8,
    ratingCount: 584,
    duration: 48,
    createdAt: "2026-05-01T18:00:00Z",
  },
  {
    id: "v2",
    userId: "u_flux",
    caption: "Slow market walk, hand-held texture, and soft morning bloom.",
    music: "Gentle Static - Flux Garden",
    tags: ["#ambient", "#street", "#texture"],
    orientation: "landscape",
    src: sampleVideos.city,
    poster: svgDataUri("Morning Market", "#0f172a", "#115e59", "#14b8a6"),
    likes: 89100,
    commentCount: 1064,
    shares: 802,
    saves: 2910,
    rating: 4.5,
    ratingCount: 421,
    duration: 52,
    createdAt: "2026-05-02T09:45:00Z",
  },
  {
    id: "v3",
    userId: "u_river",
    caption: "One breath, one board slide, one cut on the landing beat.",
    music: "Kickflip Echo - River Tide",
    tags: ["#skate", "#motion", "#beatcut"],
    orientation: "portrait",
    src: sampleVideos.canyon,
    poster: svgDataUri("Board Slide", "#1e1b4b", "#4c1d95", "#a855f7"),
    likes: 105900,
    commentCount: 1710,
    shares: 1120,
    saves: 4440,
    rating: 4.7,
    ratingCount: 511,
    duration: 60,
    createdAt: "2026-05-03T14:20:00Z",
  },
  {
    id: "v4",
    userId: "u_glow",
    caption: "Abstract light tunnel built from mirrors, vapor, and a single lamp.",
    music: "Mirror State - Glow Loop",
    tags: ["#abstract", "#light", "#art"],
    orientation: "landscape",
    src: sampleVideos.rails,
    poster: svgDataUri("Light Tunnel", "#111827", "#0f766e", "#38bdf8"),
    likes: 67200,
    commentCount: 912,
    shares: 620,
    saves: 2310,
    rating: 4.6,
    ratingCount: 336,
    duration: 42,
    createdAt: "2026-05-03T22:15:00Z",
  },
  {
    id: "v5",
    userId: "u_milo",
    caption: "Tiny apartment comedy: the kettle, the timer, and the jump scare.",
    music: "Kitchen Chaos - Milo North",
    tags: ["#comedy", "#sketch", "#relatable"],
    orientation: "portrait",
    src: sampleVideos.surf,
    poster: svgDataUri("Kitchen Chaos", "#1f2937", "#7c2d12", "#fb923c"),
    likes: 55200,
    commentCount: 742,
    shares: 490,
    saves: 1980,
    rating: 4.4,
    ratingCount: 264,
    duration: 37,
    createdAt: "2026-05-04T08:12:00Z",
  },
  {
    id: "v6",
    userId: "u_nova",
    caption: "Cloud layers and a skyline stitched together with a soft shutter.",
    music: "Velvet Air - Nova Frame",
    tags: ["#skyline", "#travel", "#wide"],
    orientation: "landscape",
    src: sampleVideos.road,
    poster: svgDataUri("Skyline Stitch", "#0f172a", "#3730a3", "#c084fc"),
    likes: 77200,
    commentCount: 1021,
    shares: 910,
    saves: 2590,
    rating: 4.9,
    ratingCount: 618,
    duration: 55,
    createdAt: "2026-05-04T11:30:00Z",
  },
  {
    id: "v7",
    userId: "u_flux",
    caption: "Rain-on-glass texture study with a pulse that never quite settles.",
    music: "Static Rain - Flux Garden",
    tags: ["#rain", "#texture", "#loop"],
    orientation: "portrait",
    src: sampleVideos.skyline,
    poster: svgDataUri("Rain Glass", "#082f49", "#1d4ed8", "#38bdf8"),
    likes: 63100,
    commentCount: 880,
    shares: 610,
    saves: 2400,
    rating: 4.3,
    ratingCount: 278,
    duration: 46,
    createdAt: "2026-05-04T15:50:00Z",
  },
  {
    id: "v8",
    userId: "u_river",
    caption: "A mountain ride with aggressive cuts and a sunset bounce in the lens.",
    music: "Redline Loop - River Tide",
    tags: ["#roadtrip", "#action", "#sunset"],
    orientation: "landscape",
    src: sampleVideos.storm,
    poster: svgDataUri("Mountain Ride", "#3b0764", "#7e22ce", "#f472b6"),
    likes: 81200,
    commentCount: 1140,
    shares: 798,
    saves: 3120,
    rating: 4.6,
    ratingCount: 392,
    duration: 58,
    createdAt: "2026-05-04T17:05:00Z",
  },
  {
    id: "v9",
    userId: "u_glow",
    caption: "Forest shadows, slow motion drift, and a single electric accent.",
    music: "Afterglow - Glow Loop",
    tags: ["#forest", "#slowmo", "#tone"],
    orientation: "portrait",
    src: sampleVideos.forest,
    poster: svgDataUri("Forest Drift", "#052e16", "#14532d", "#4ade80"),
    likes: 94300,
    commentCount: 1280,
    shares: 1002,
    saves: 3440,
    rating: 4.8,
    ratingCount: 472,
    duration: 49,
    createdAt: "2026-05-04T20:40:00Z",
  },
  {
    id: "v10",
    userId: "u_milo",
    caption: "City sprint montage cut for speed, punch, and a little bit of panic.",
    music: "Sprint Mode - Milo North",
    tags: ["#urban", "#montage", "#speed"],
    orientation: "landscape",
    src: sampleVideos.ripple,
    poster: svgDataUri("City Sprint", "#111827", "#7f1d1d", "#fb7185"),
    likes: 58800,
    commentCount: 700,
    shares: 540,
    saves: 2120,
    rating: 4.2,
    ratingCount: 202,
    duration: 44,
    createdAt: "2026-05-04T21:25:00Z",
  },
  {
    id: "v11",
    userId: "u_nova",
    caption: "Mini set piece: one lamp, one doorway, three color temps.",
    music: "Doorway Fade - Nova Frame",
    tags: ["#lighting", "#filmmaking", "#setup"],
    orientation: "portrait",
    src: sampleVideos.sunset,
    poster: svgDataUri("Doorway Fade", "#1e293b", "#7c3aed", "#22d3ee"),
    likes: 101200,
    commentCount: 1490,
    shares: 922,
    saves: 4010,
    rating: 4.9,
    ratingCount: 710,
    duration: 53,
    createdAt: "2026-05-05T07:10:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    videoId: "v1",
    userId: "u_flux",
    text: "The color grade is doing a lot of heavy lifting here.",
    likes: 104,
    createdAt: "2026-05-05T07:15:00Z",
  },
  {
    id: "c2",
    videoId: "v1",
    userId: "u_milo",
    text: "That lens flare at the bridge cut is clean.",
    likes: 86,
    createdAt: "2026-05-05T07:19:00Z",
  },
  {
    id: "c3",
    videoId: "v2",
    userId: "u_glow",
    text: "The movement feels like a memory instead of a clip.",
    likes: 71,
    createdAt: "2026-05-05T07:21:00Z",
  },
  {
    id: "c4",
    videoId: "v3",
    userId: "u_nova",
    text: "That landing beat matched the slide way too well.",
    likes: 132,
    createdAt: "2026-05-05T07:25:00Z",
  },
  {
    id: "c5",
    videoId: "v4",
    userId: "u_me",
    text: "This lighting idea is going straight into my references.",
    likes: 58,
    createdAt: "2026-05-05T07:30:00Z",
  },
  {
    id: "c6",
    videoId: "v5",
    userId: "u_river",
    text: "The kettle cut is the exact kind of chaos I respect.",
    likes: 96,
    createdAt: "2026-05-05T07:31:00Z",
  },
  {
    id: "c7",
    videoId: "v6",
    userId: "u_flux",
    text: "Wide shots like this make the whole feed breathe.",
    likes: 42,
    createdAt: "2026-05-05T07:33:00Z",
  },
  {
    id: "c8",
    videoId: "v7",
    userId: "u_glow",
    text: "The rain texture is almost tactile.",
    likes: 65,
    createdAt: "2026-05-05T07:35:00Z",
  },
  {
    id: "c9",
    videoId: "v8",
    userId: "u_me",
    text: "This feels like a trailer beat, not just a post.",
    likes: 120,
    createdAt: "2026-05-05T07:37:00Z",
  },
  {
    id: "c10",
    videoId: "v9",
    userId: "u_milo",
    text: "The contrast in this one is surgical.",
    likes: 63,
    createdAt: "2026-05-05T07:40:00Z",
  },
  {
    id: "c11",
    videoId: "v10",
    userId: "u_river",
    text: "Fast cuts, but it still reads clean. Nice.",
    likes: 49,
    createdAt: "2026-05-05T07:42:00Z",
  },
  {
    id: "c12",
    videoId: "v11",
    userId: "u_flux",
    text: "The doorway composition is a good frame for the whole app.",
    likes: 88,
    createdAt: "2026-05-05T07:45:00Z",
  },
];

export function getUser(id: string) {
  return users.find((user) => user.id === id) ?? users[0];
}

export function getUserByUsername(username: string) {
  const normalized = decodeURIComponent(username).trim().replace(/^@/, "").toLowerCase();
  return users.find((user) => user.username.toLowerCase() === normalized);
}

export function getVideosByUser(id: string) {
  return videos.filter((video) => video.userId === id);
}

export function getCommentsForVideo(videoId: string) {
  return comments.filter((comment) => comment.videoId === videoId);
}
