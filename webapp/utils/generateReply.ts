export const generateReply = (
  discussionTitle: string,
  tweetUrl: string
): string => {
  return `There's so much to unpack about this subject of ${discussionTitle}! I've actually just shared some thoughts on Twitter that might add to our discussion here: ${tweetUrl}. Would love to hear your thoughts and engage further on this!
  `;
};
