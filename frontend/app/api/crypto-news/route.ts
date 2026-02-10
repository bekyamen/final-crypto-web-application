import { NextResponse } from "next/server";
import Parser from "rss-parser";
import Sentiment from "sentiment";

export const runtime = "nodejs";

const parser = new Parser();
const sentiment = new Sentiment();

const FEEDS = [
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://bitcoinmagazine.com/.rss/full/",
  "https://www.newsbtc.com/feed/",
  "https://ambcrypto.com/feed/",
  "https://beincrypto.com/feed/",
  "https://cryptoslate.com/feed/",
  "https://cryptopotato.com/feed/",
  "https://dailyhodl.com/feed/",
  "https://zycrypto.com/feed/",
];

type NewsItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  url: string;
  source: string;
  image: string;
  sentiment: "bullish" | "bearish" | "neutral";
  score: number;
};

function normalize(item: any, source: string): NewsItem {
  const title = item.title ?? "";
  const description = item.contentSnippet ?? item.content ?? "";
  const url = item.link ?? "";
  const timestamp = item.isoDate ?? item.pubDate ?? new Date().toISOString();

  const score = sentiment.analyze(`${title}. ${description}`).score;

  let sentimentLabel: "bullish" | "bearish" | "neutral" = "neutral";
  if (score >= 2) sentimentLabel = "bullish";
  if (score <= -2) sentimentLabel = "bearish";

  // Unique ID: url + timestamp (avoids duplicate key errors)
  return {
    id: Buffer.from(url + timestamp).toString("base64"),
    title,
    description,
    timestamp,
    url,
    source,
    image: item.enclosure?.url ?? "",
    sentiment: sentimentLabel,
    score,
  };
}

export async function GET() {
  try {
    const feeds = await Promise.allSettled(FEEDS.map((url) => parser.parseURL(url)));
    let items: NewsItem[] = [];

    for (const result of feeds) {
      if (result.status !== "fulfilled") continue;

      const feed = result.value;
      const source = feed.title ?? "Unknown";

      const feedItems = feed.items?.slice(0, 20).map((item) => normalize(item, source)) ?? [];
      items.push(...feedItems);
    }

    // Deduplicate by URL + timestamp
    const seen = new Set<string>();
    items = items.filter((i) => {
      if (!i.url || seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    // Sort newest first
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const res = NextResponse.json({ success: true, news: items });
    res.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (e) {
    console.error("Failed to fetch crypto news:", e);
    return NextResponse.json({ success: false, news: [] }, { status: 500 });
  }
}
