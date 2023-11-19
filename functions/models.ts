import * as admin from "firebase-admin";

export interface User {
  uid: string;
  displayName: string;
  email: string;
  password: string;
}

export interface SocialPost {
  postId: string;
  content: string;
  authorId: string;
  createdAt: admin.firestore.Timestamp;
}

export interface Thread {
  threadId: string;
  platform: "Reddit" | "Quora" | "ProductHunt";
  title: string;
  link: string;
  keywords: string[];
}

export interface Reply {
  replyId: string;
  threadId: string;
  content: string;
  isPosted: boolean;
  createdAt: admin.firestore.Timestamp;
}
