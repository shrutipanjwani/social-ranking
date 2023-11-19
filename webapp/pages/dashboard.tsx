"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/router";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { generateReply } from "@/utils/generateReply";
import Image from "next/image";

type Tweet = {
  id: string;
  content: string;
  username?: string;
  authorImg: string;
  authorName: string;
  likes: string;
  retweets: string;
  originalTweetLink: string;
  createdAt: ReactNode;
};

type RedditThread = {
  title: string;
  link: string;
  subreddit: string;
  originTweetId: string;
};

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [threads, setThreads] = useState<RedditThread[]>([]);
  const [selectedThreadIndex, setSelectedThreadIndex] = useState<number | null>(
    null
  );
  const [draftReply, setDraftReply] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If there's no user, redirect to login
        router.push("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If not logged in, redirect to login page
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login or home page after logout
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    // Fetch tweets from the static JSON file and Save to Firestore
    const fetchAndSaveTweets = async () => {
      try {
        const response = await axios.get("/mockTweets.json");
        const fetchedTweets: Tweet[] = response.data;
        setTweets(fetchedTweets);

        // Save each tweet to Firestore
        const tweetsCollectionRef = collection(db, "tweets");
        fetchedTweets.forEach(async (tweet) => {
          try {
            const tweetToSave = {
              content: tweet.content,
              createdAt: new Date(),
              username: tweet?.username || "",
              authorImg: tweet.authorImg,
              authorName: tweet.authorName,
              likes: tweet.likes,
              retweets: tweet.retweets,
              originalTweetLink: tweet.originalTweetLink,
            };
            await addDoc(tweetsCollectionRef, tweetToSave);
          } catch (error) {
            console.error("Error saving tweet to Firestore:", error);
          }
        });
      } catch (error) {
        console.error("Error fetching tweets:", error);
      }
    };
    fetchAndSaveTweets();
  }, []);

  // Search for relevant threads
  const searchForThreads = async (tweet: Tweet) => {
    try {
      const response = await axios.get<RedditThread[]>(`/api/searchReddit`, {
        params: { content: tweet.content },
      });
      console.log(response);
      const threadsWithOrigin = response.data.map((thread) => ({
        ...thread,
        originTweetId: tweet.id, // Set the ID of the tweet that was used to find these threads
      }));
      console.log(threadsWithOrigin);
      setThreads(threadsWithOrigin);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  // Function to generate a reply when a thread is selected
  const handleSelectThread = (index: number) => {
    const thread = threads[index];
    setSelectedThreadIndex(index); // Set the selected thread index

    const originalTweet = tweets.find(
      (tweet) => tweet.id === thread.originTweetId
    );

    if (originalTweet) {
      // Generate a reply based on the thread title, original tweet content, and tweet URL
      const generatedReply = generateReply(originalTweet?.originalTweetLink);
      setDraftReply(generatedReply);
    } else {
      console.error("Original tweet not found for the thread");
    }
  };

  // Function to save the reply draft to Firestore
  const saveDraftReply = async () => {
    if (selectedThreadIndex !== null) {
      const thread = threads[selectedThreadIndex];
      // Save the reply draft to Firestore here
      // You might need to adjust the data structure and collection/document details based on your Firestore setup
      await addDoc(collection(db, "replies"), {
        content: draftReply,
        threadId: thread.title,
        tweetId: tweets[0].id,
      });
      alert("Reply saved to drafts");
    }
  };

  // Function to copy the reply draft to the clipboard
  const copyReplyToClipboard = async () => {
    if (draftReply) {
      await navigator.clipboard.writeText(draftReply);
      alert("Reply copied to clipboard!");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to your dashboard, {user.displayName || "User"}!</h1>
      <button onClick={handleLogout}>Logout</button>
      <br />
      <br />
      <h1>Tweets</h1>
      {tweets.map((tweet) => (
        <div
          key={tweet.id}
          className="p-4 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 m-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Image
                alt="Author's Avatar"
                className="rounded-full"
                height="40"
                src={tweet.authorImg}
                style={{
                  aspectRatio: "40/40",
                  objectFit: "cover",
                }}
                width="40"
              />
              <div className="ml-2">
                <div className="font-bold">{tweet.authorName}</div>
              </div>
            </div>
            <div className="text-gray-500 text-sm">{tweet.createdAt}</div>
          </div>
          <p className="mb-4 text-gray-800 dark:text-white">{tweet.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
              <div className="flex items-center space-x-2">
                <svg
                  className=" text-red-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="text-gray-500">{tweet.likes}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className=" text-green-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                <span className="text-gray-500">{tweet.retweets}</span>
              </div>
            </div>
            <button className="text-sm" onClick={() => searchForThreads(tweet)}>
              Find Discussions
            </button>
          </div>
        </div>
      ))}
      <br />
      <h1>Related Reddit Threads</h1>

      {threads.map((thread, index) => (
        <div key={index}>
          <a href={thread.link} target="_blank" rel="noopener noreferrer">
            {thread.title}
          </a>
          <button onClick={() => handleSelectThread(index)}>Select</button>
        </div>
      ))}
      {selectedThreadIndex !== null && (
        <div>
          <textarea
            className="text-black"
            value={draftReply}
            onChange={(e) => setDraftReply(e.target.value)}
            placeholder="Edit your reply here"
          />
          <button onClick={saveDraftReply}>Save Draft</button>
          <button onClick={copyReplyToClipboard}>Copy to Clipboard</button>
        </div>
      )}
      <br />
      <br />
    </div>
  );
};

export default DashboardPage;
