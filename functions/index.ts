import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { User } from "./models";

admin.initializeApp();

export const db = admin.firestore();

// Create a new user
export const registerUser = functions.https.onCall(
  async (data: User, context) => {
    try {
      const { displayName, email, password } = data;
      const userRecord = await admin.auth().createUser({
        displayName,
        email,
        password,
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error) {
      logger.error("Error creating new user", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to create new user."
      );
    }
  }
);
