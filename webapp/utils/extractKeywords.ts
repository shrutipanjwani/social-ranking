import nlp from "compromise";

export function extractKeywords(text: string): string {
  // Define custom mappings for common phrases to more search-friendly terms
  const customMappings: { [key: string]: string } = {
    "new video": "creating video quickly",
    Typeframes: "Typeframes video template",
    // Add more custom mappings as needed
  };

  // Remove URLs
  text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");

  // Remove special characters
  text = text.replace(/[^\w\s]|_/g, "");

  // Use the compromise library to tokenize the text
  const doc = nlp(text);
  let searchQuery = "";

  // Apply custom mappings to the text
  Object.entries(customMappings).forEach(([key, value]) => {
    if (text.includes(key)) {
      searchQuery = value; // Use custom search term
    }
  });

  // If no custom mapping applies, fall back to extracting nouns and verbs
  if (!searchQuery) {
    const nouns = doc.nouns().out("array") as string[];
    const verbs = doc.verbs().out("array") as string[];
    const combinedKeywords = [...new Set([...nouns, ...verbs])]
      .filter((word) => word.length > 3)
      .slice(0, 3); // Limit to the first 3 keywords
    searchQuery = combinedKeywords.join(" AND ");
  }

  return searchQuery;
}
