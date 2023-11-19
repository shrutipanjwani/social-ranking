import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { extractKeywords } from "../../utils/extractKeywords";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { content } = req.query as { content: string };
  const searchQuery = extractKeywords(content);

  console.log(searchQuery);

  const redditSearchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(
    searchQuery
  )}&limit=50&sort=relevance&t=all`;

  try {
    const response = await axios.get(redditSearchUrl);
    console.log(response);
    const threads = response.data.data.children.map((child: any) => ({
      title: child.data.title,
      link: `https://www.reddit.com${child.data.permalink}`,
      subreddit: child.data.subreddit,
    }));
    res.status(200).json(threads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data from Reddit" });
  }
}
