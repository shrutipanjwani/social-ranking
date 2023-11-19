"use client";

import React, { Fragment, ReactNode, useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/router";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { generateReply } from "@/utils/generateReply";
import Image from "next/image";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  HomeIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Dialog, Tab, Transition } from "@headlessui/react";
import {
  ClipboardDocumentCheckIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Button/Button";
import TweetContent from "@/components/TweetContent";
import Notification from "@/components/Notification";

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
  score: number;
  numComments: number;
  createdAt: number;
  author: string;
  originTweetId: string;
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [threads, setThreads] = useState<RedditThread[]>([]);
  const [selectedThreadIndex, setSelectedThreadIndex] = useState<number | null>(
    null
  );
  const [draftReply, setDraftReply] = useState<string>("");

  const router = useRouter();

  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Call this function to show the notification
  const triggerSaveNotification = () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const [showCopyNotification, setShowCopyNotification] = useState(false);

  // Call this function to show the notification
  const triggerCopyNotification = () => {
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 3000);
  };

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
      const threadsWithOrigin = response.data.map((thread) => ({
        ...thread,
        originTweetId: tweet.id, // Set the ID of the tweet that was used to find these threads
      }));
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
      const generatedReply = generateReply(
        thread.title,
        originalTweet?.originalTweetLink
      );
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
      triggerSaveNotification();
      setSelectedThreadIndex(null);
    }
  };

  // Function to copy the reply draft to the clipboard
  const copyReplyToClipboard = async () => {
    if (draftReply) {
      await navigator.clipboard.writeText(draftReply);
      triggerCopyNotification();
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secondary px-6 pb-2">
                    <div className="flex h-16 shrink-0 items-center">
                      <RectangleStackIcon className="h-8 w-auto" />
                      <span className="font-poppins">&nbsp; Social Ranker</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className={classNames(
                                    item.current
                                      ? "bg-gray-800 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-poppins"
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? "text-white"
                                        : "text-gray-400 group-hover:text-white",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <RectangleStackIcon className="h-8 w-auto" />
              <span className="font-poppins">&nbsp; Social Ranker</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-800",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-poppins"
                          )}
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <a
                    href="#"
                    onClick={handleLogout}
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-poppins leading-6 text-white hover:bg-gray-800"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="h-8 w-8 rounded-full bg-gray-800"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Logout</span>
                    <span aria-hidden="true">Logout</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-poppins leading-6 text-white hover:bg-gray-800"
                  >
                    <UserCircleIcon
                      className="h-8 w-8 rounded-full bg-gray-800"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">{user.displayName || "User"}</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6 font-poppins" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-poppins leading-6 text-gray-900">
            Dashboard
          </div>
          <a href="#" onClick={handleLogout}>
            <span className="sr-only">Logout</span>
            <ArrowLeftOnRectangleIcon
              className="h-8 w-8 rounded-full text-gray-800"
              aria-hidden="true"
            />
          </a>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <UserCircleIcon
              className="h-8 w-8 rounded-full bg-gray-800"
              aria-hidden="true"
            />
          </a>
        </div>

        <main className="lg:pl-60">
          <div className="xl:pr-[500px]">
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
              <div className="my-6">
                <h1 className="text-2xl font-poppins-medium leading-7 text-gray-50 sm:truncate sm:leading-9">
                  Find Relevant Discussions for your Tweets
                </h1>
                <p className="text-gray-400 mt-1 font-poppins">
                  Monitor, engage, and grow your digital presence with real-time
                  insights into your social activity and tailored opportunities
                  for expanded influence.
                </p>
              </div>

              {tweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className="p-4 rounded-lg bg-white dark:bg-secondary border border-primary dark:border-gray-700 my-6"
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
                    <div className="text-gray-500 text-sm">
                      {tweet.createdAt}
                    </div>
                  </div>
                  <TweetContent content={tweet.content} />
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
                    <Button onClick={() => searchForThreads(tweet)}>
                      Find Discussions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="fixed hidden w-[500px] xl:block xl:col-span-4 px-4 py-6 sm:px-6 lg:px-4 border-l border-primary inset-y-0 right-0">
          {selectedThreadIndex == null && (
            <section className="overflow-y-auto h-full">
              <div>
                <br />
                <h1 className="text-2xl font-poppins-medium leading-7 text-gray-50 sm:truncate sm:leading-9">
                  Relevant Threads
                </h1>
                {threads.map((thread, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 mt-2 text-white space-y-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-zinc-200">
                            Posted by r/{thread.subreddit}
                          </div>
                          <div className="text-sm text-zinc-200">
                            {thread.createdAt}
                          </div>
                        </div>
                        <h2 className="font-poppins-medium text-lg">
                          {thread.title}
                        </h2>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-zinc-200 space-x-2">
                            <svg
                              className=" h-4 w-4 text-white"
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
                              <path d="M12 13V2l8 4-8 4" />
                              <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
                              <path d="M8 10a5 5 0 1 0 8.9 2.02" />
                            </svg>
                            <div>{thread.score} Score</div>
                          </div>
                          <div className="flex items-center text-sm text-zinc-200 space-x-2">
                            <svg
                              className=" h-4 w-4 text-white"
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
                              <polyline points="9 17 4 12 9 7" />
                              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                            </svg>
                            <div>{thread.numComments} Comments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <br />
                    <div className="flex justify-end space-x-4 items-end">
                      <Button onClick={() => handleSelectThread(index)}>
                        Reply to Thread
                      </Button>
                      <Button
                        onClick={() => window.open(thread.link, "_blank")}
                      >
                        View Thread
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {selectedThreadIndex !== null && (
            <section className="overflow-y-auto h-[60%]">
              <div>
                <br />
                <h1 className="text-2xl font-poppins-medium leading-7 text-gray-50 sm:truncate sm:leading-9">
                  Relevant Threads
                </h1>
                {threads.map((thread, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 mt-2 text-white space-y-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-zinc-200">
                            Posted by r/{thread.subreddit}
                          </div>
                          <div className="text-sm text-zinc-200">
                            {thread.createdAt}
                          </div>
                        </div>
                        <h2 className="font-poppins-medium text-lg">
                          {thread.title}
                        </h2>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-zinc-200 space-x-2">
                            <svg
                              className=" h-4 w-4 text-white"
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
                              <path d="M12 13V2l8 4-8 4" />
                              <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
                              <path d="M8 10a5 5 0 1 0 8.9 2.02" />
                            </svg>
                            <div>{thread.score} Score</div>
                          </div>
                          <div className="flex items-center text-sm text-zinc-200 space-x-2">
                            <svg
                              className=" h-4 w-4 text-white"
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
                              <polyline points="9 17 4 12 9 7" />
                              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                            </svg>
                            <div>{thread.numComments} Comments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <br />
                    <div className="flex justify-end space-x-4 items-end">
                      <Button onClick={() => handleSelectThread(index)}>
                        Reply to Thread
                      </Button>
                      <Button
                        onClick={() => window.open(thread.link, "_blank")}
                      >
                        View Thread
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {selectedThreadIndex !== null && (
            <section className="border-t border-primary">
              <div>
                <br />
                <h1 className="text-xl font-poppins-medium leading-7 text-gray-50 sm:truncate sm:leading-9">
                  Write your reply to the thread
                </h1>
                <form action="#" className="mt-2">
                  <label htmlFor="comment" className="sr-only">
                    Comment
                  </label>
                  <div>
                    <textarea
                      rows={5}
                      value={draftReply}
                      name="comment"
                      id="comment"
                      className="block w-full font-poppins rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-primary placeholder:text-gray-400 focus:ring focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Draft a reply to the thread"
                      onChange={(e) => setDraftReply(e.target.value)}
                    />
                  </div>
                  <div className="ml-auto flex items-center justify-end space-x-5">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={copyReplyToClipboard}
                        className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Copy to Clipboard</span>
                        <ClipboardDocumentCheckIcon
                          className="h-8 w-8 mt-1"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button type="submit" onClick={saveDraftReply}>
                        Save as Draft
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </section>
          )}
        </aside>
      </div>
      <Notification
        show={showSaveNotification}
        message="Successfully saved!"
        description="Your reply has been saved to drafts."
        onClose={() => setShowSaveNotification(false)}
        type="success"
      />

      <Notification
        show={showCopyNotification}
        message="Successfully copied!"
        description="Your reply has been copied to clipboard."
        onClose={() => setShowCopyNotification(false)}
        type="success"
      />
    </>
  );
};

export default DashboardPage;
