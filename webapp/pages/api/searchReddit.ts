import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { extractKeywords } from "../../utils/extractKeywords";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { content } = req.query as { content: string };
  const searchQuery = extractKeywords(content);

  const redditSearchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(
    searchQuery
  )}&limit=50&sort=relevance&t=all`;

  try {
    const response = await axios.get(redditSearchUrl);

    const threads = response.data.data.children
      .map((child: any) => {
        // Convert the created_utc field to a JavaScript Date object
        const date = new Date(child.data.created_utc * 1000);

        // Format the date as a string (you can adjust the format as needed)
        const dateString = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return {
          title: child.data.title,
          link: `https://www.reddit.com${child.data.permalink}`,
          subreddit: child.data.subreddit,
          score: child.data.score,
          numComments: child.data.num_comments,
          createdAt: dateString,
          author: child.data.author_fullname,
        };
      })
      .sort(
        (a: { createdAt: number }, b: { createdAt: number }) =>
          b.createdAt - a.createdAt
      );

    res.status(200).json(threads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data from Reddit" });
  }
}
