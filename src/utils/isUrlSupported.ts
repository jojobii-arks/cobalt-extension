import UrlPattern from "url-pattern";

/**
 * Object containing URL patterns to match for.
 * @see https://github.com/wukko/cobalt/blob/cf6dcfe7a6528acbd1dc45af6a60fd112d2769a6/src/modules/processing/servicesConfig.json
 */
const patterns: Record<
  string,
  {
    alias?: string;
    patterns: string[];
    bestAudio?: string;
    audioFormats?: string[];
    tld?: string;
    enabled: boolean;
  }
> = {
  bilibili: {
    alias: "bilibili (.com only)",
    patterns: ["video/:id"],
    enabled: true,
  },
  reddit: {
    alias: "reddit videos & gifs",
    patterns: ["r/:sub/comments/:id/:title"],
    enabled: true,
  },
  twitter: {
    alias: "twitter posts & spaces & voice",
    patterns: [
      ":user/status/:id",
      ":user/status/:id/video/:v",
      "i/spaces/:spaceId",
    ],
    enabled: true,
  },
  vk: {
    alias: "vk video & clips",
    patterns: [
      "video:userId_:videoId",
      "clip:userId_:videoId",
      "clips:duplicate?z=clip:userId_:videoId",
    ],
    enabled: true,
  },
  youtube: {
    alias: "youtube videos & shorts & music",
    patterns: ["watch?v=:id"],
    bestAudio: "opus",
    enabled: true,
  },
  tumblr: {
    patterns: [
      "post/:id",
      "blog/view/:user/:id",
      ":user/:id",
      ":user/:id/:trackingId",
    ],
    enabled: true,
  },
  tiktok: {
    alias: "tiktok videos & photos & audio",
    patterns: [":user/video/:postId", ":id", "t/:id"],
    audioFormats: ["best", "m4a", "mp3"],
    enabled: true,
  },
  douyin: {
    alias: "douyin videos & audio",
    patterns: ["video/:postId", ":id"],
    enabled: false,
  },
  vimeo: {
    patterns: [":id"],
    enabled: true,
    bestAudio: "mp3",
  },
  soundcloud: {
    patterns: [":author/:song/s-:accessKey", ":author/:song", ":shortLink"],
    bestAudio: "none",
    enabled: true,
  },
};

/**
 * @see https://github.com/wukko/cobalt/blob/cf6dcfe7a6528acbd1dc45af6a60fd112d2769a6/src/modules/processing/servicesPatternTesters.js
 */
const testers: Record<string, (x: Record<any, any>) => boolean> = {
  twitter: (patternMatch) =>
    (patternMatch["id"] && patternMatch["id"].length < 20) ||
    (patternMatch["spaceId"] && patternMatch["spaceId"].length === 13),

  vk: (patternMatch) =>
    patternMatch["userId"] &&
    patternMatch["videoId"] &&
    patternMatch["userId"].length <= 10 &&
    patternMatch["videoId"].length === 9,

  bilibili: (patternMatch) =>
    patternMatch["id"] && patternMatch["id"].length >= 12,

  youtube: (patternMatch) =>
    patternMatch["id"] && patternMatch["id"].length >= 11,

  reddit: (patternMatch) =>
    patternMatch["sub"] &&
    patternMatch["id"] &&
    patternMatch["title"] &&
    patternMatch["sub"].length <= 22 &&
    patternMatch["id"].length <= 10 &&
    patternMatch["title"].length <= 96,

  tiktok: (patternMatch) =>
    (patternMatch["user"] &&
      patternMatch["postId"] &&
      patternMatch["postId"].length <= 21) ||
    (patternMatch["id"] && patternMatch["id"].length <= 13),

  douyin: (patternMatch) =>
    (patternMatch["postId"] && patternMatch["postId"].length <= 21) ||
    (patternMatch["id"] && patternMatch["id"].length <= 13),

  tumblr: (patternMatch) =>
    (patternMatch["id"] && patternMatch["id"].length < 21) ||
    (patternMatch["id"] &&
      patternMatch["id"].length < 21 &&
      patternMatch["user"] &&
      patternMatch["user"].length <= 32),

  vimeo: (patternMatch) =>
    patternMatch["id"] && patternMatch["id"].length <= 11,

  soundcloud: (patternMatch) =>
    (patternMatch["author"] &&
      patternMatch["song"] &&
      patternMatch["author"].length + patternMatch["song"].length <= 96) ||
    (patternMatch["shortLink"] && patternMatch["shortLink"].length <= 32),
};

/**
 * @see https://github.com/wukko/cobalt/blob/cf6dcfe7a6528acbd1dc45af6a60fd112d2769a6/src/modules/sub/utils.js#L64-L86
 */
function cleanURL(url: string, host: string) {
  // prettier-ignore
  let forbiddenChars = [
    "}", "{", "(", ")", "\\", "%", ">", "<", "^", "*", "!", "~", ";", ":", ",", "`", "[", "]", "#", "$", '"', "'", "@",
  ];
  switch (host) {
    case "vk":
    case "youtube":
      url = url.split("&")[0];
      break;
    case "tiktok":
      url = url.replace(/@([a-zA-Z]+(\.[a-zA-Z]+)+)/, "@a");
    default:
      url = url.split("?")[0];
      if (url.substring(url.length - 1) === "/")
        url = url.substring(0, url.length - 1);
      break;
  }
  for (let i in forbiddenChars) {
    url = url.replaceAll(forbiddenChars[i], "");
  }
  url = url.replace("https//", "https://");
  if (url.includes("youtube.com/shorts/")) {
    url = url.split("?")[0].replace("shorts/", "watch?v=");
  }
  return url.slice(0, 128);
}

/** Pre-emptively check if a URL is *possibly* supported by Cobalt.
 * @see https://github.com/wukko/cobalt/blob/cf6dcfe7a6528acbd1dc45af6a60fd112d2769a6/src/modules/api.js
 */
export default function isUrlSupported(originalURL: string): boolean {
  try {
    let patternMatch,
      url = decodeURIComponent(originalURL),
      hostname = new URL(url).hostname.split("."),
      host = hostname[hostname.length - 2];
    if (!url.startsWith("https://")) return false;

    switch (host) {
      case "youtu":
        host = "youtube";
        url = `https://youtube.com/watch?v=${url
          .replace("youtu.be/", "")
          .replace("https://", "")}`;
        break;
      case "goo":
        if (url.substring(0, 30) === "https://soundcloud.app.goo.gl/") {
          host = "soundcloud";
          url = `https://soundcloud.com/${
            url.replace("https://soundcloud.app.goo.gl/", "").split("/")[0]
          }`;
        }
        break;
      case "tumblr":
        if (!url.includes("blog/view")) {
          if (url.slice(-1) === "/") url = url.slice(0, -1);
          url = url.replace(url.split("/")[5], "");
        }
        break;
    }
    if (
      !(
        host &&
        host.length < 20 &&
        host in patterns &&
        patterns[host]["enabled"]
      )
    )
      return false;

    for (let i in patterns[host]["patterns"]) {
      patternMatch = new UrlPattern(patterns[host]["patterns"][i]).match(
        cleanURL(url, host)
          .split(
            `.${patterns[host]["tld"] ? patterns[host]["tld"] : "com"}/`
          )[1]
          .replace(".", "")
      );
      if (patternMatch) break;
    }
    if (!patternMatch) return false;

    if (!testers[host]) return false;
    if (!testers[host](patternMatch)) return false;

    return true;
  } catch (e) {
    console.error("Something went wrong...");
    console.error(e);
    return false;
  }
}
