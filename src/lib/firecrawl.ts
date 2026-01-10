import Firecrawl from "@mendable/firecrawl-js";

export const crawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});
