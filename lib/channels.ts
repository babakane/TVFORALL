export interface Channel {
  id: string;
  name: string;
  logo?: string;
  url: string;
  category: string;
  country?: string;
  language?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// IPTV-org category URLs
export const IPTV_CATEGORIES = {
  all: "https://iptv-org.github.io/iptv/index.m3u",
  news: "https://iptv-org.github.io/iptv/categories/news.m3u",
  entertainment: "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
  sports: "https://iptv-org.github.io/iptv/categories/sports.m3u",
  movies: "https://iptv-org.github.io/iptv/categories/movies.m3u",
  music: "https://iptv-org.github.io/iptv/categories/music.m3u",
  kids: "https://iptv-org.github.io/iptv/categories/kids.m3u",
  documentary: "https://iptv-org.github.io/iptv/categories/documentary.m3u",
  education: "https://iptv-org.github.io/iptv/categories/education.m3u",
  lifestyle: "https://iptv-org.github.io/iptv/categories/lifestyle.m3u",
  cooking: "https://iptv-org.github.io/iptv/categories/cooking.m3u",
  travel: "https://iptv-org.github.io/iptv/categories/travel.m3u",
  animation: "https://iptv-org.github.io/iptv/categories/animation.m3u",
  classic: "https://iptv-org.github.io/iptv/categories/classic.m3u",
  comedy: "https://iptv-org.github.io/iptv/categories/comedy.m3u",
  culture: "https://iptv-org.github.io/iptv/categories/culture.m3u",
  general: "https://iptv-org.github.io/iptv/categories/general.m3u",
  outdoor: "https://iptv-org.github.io/iptv/categories/outdoor.m3u",
  relax: "https://iptv-org.github.io/iptv/categories/relax.m3u",
  religious: "https://iptv-org.github.io/iptv/categories/religious.m3u",
  science: "https://iptv-org.github.io/iptv/categories/science.m3u",
  series: "https://iptv-org.github.io/iptv/categories/series.m3u",
  shop: "https://iptv-org.github.io/iptv/categories/shop.m3u",
  weather: "https://iptv-org.github.io/iptv/categories/weather.m3u",
  xxx: "https://iptv-org.github.io/iptv/categories/xxx.m3u",
};

export type CategoryKey = keyof typeof IPTV_CATEGORIES;

export function parseM3U(content: string): Channel[] {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF:")) {
      // Parse channel info
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const countryMatch = line.match(/tvg-country="([^"]*)"/);
      const langMatch = line.match(/tvg-language="([^"]*)"/);
      const idMatch = line.match(/tvg-id="([^"]*)"/);

      currentChannel = {
        id: idMatch?.[1] || `ch-${channels.length}`,
        name: nameMatch?.[1] || "Unknown Channel",
        logo: logoMatch?.[1] || undefined,
        category: groupMatch?.[1] || "General",
        country: countryMatch?.[1] || undefined,
        language: langMatch?.[1] || undefined,
      };
    } else if (
      line.startsWith("http") &&
      !line.startsWith("#") &&
      currentChannel
    ) {
      channels.push({
        ...currentChannel,
        url: line,
      } as Channel);
      currentChannel = null;
    }
  }

  return channels;
}
