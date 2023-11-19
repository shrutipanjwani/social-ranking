import React from "react";

type TweetContentProps = {
  content: string;
};

const TweetContent: React.FC<TweetContentProps> = ({ content }) => {
  // Use a regular expression to split the content by newlines
  const paragraphs = content.split(/\n+/);

  return (
    <>
      {paragraphs.map(
        (paragraph, index) =>
          // Only render non-empty paragraphs
          paragraph.trim() !== "" && (
            <p key={index} className="mb-6 text-gray-800 dark:text-white">
              {paragraph}
            </p>
          )
      )}
    </>
  );
};

export default TweetContent;
