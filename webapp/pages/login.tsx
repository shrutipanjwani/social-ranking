"use client";
import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { FirebaseError } from "firebase/app";
import { RectangleStackIcon } from "@heroicons/react/24/outline";
import Notification from "@/components/Notification";

const LoginPage = () => {
  const [showLoginNotification, setShowLoginNotification] = useState(false);

  // Call this function to show the notification
  const triggerLoginNotification = () => {
    setShowLoginNotification(true);
    setTimeout(() => setShowLoginNotification(false), 3000);
  };

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If there's a user logged in, redirect to dashboard
        router.push("/dashboard");
      }
    });
  }, [router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    triggerLoginNotification();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Logged in user display name:", user.displayName);
      Router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(`Error (${error.code}): ${error.message}`);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <RectangleStackIcon className="h-8 w-auto mx-auto" />
          <h2 className="mt-8 text-center text-2xl font-poppins-medium leading-9 tracking-tight text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="name"
                className="font-poppins block text-sm font-medium leading-6 text-white"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="text"
                  required
                  className="font-poppins pl-2 block w-full rounded-md outline-none bg-white/5 py-1.5 text-white shadow-sm sm:text-sm sm:leading-6 border border-gray-800"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="font-poppins block text-sm font-medium leading-6 text-white"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="font-poppins pl-2 block w-full rounded-md outline-none bg-white/5 py-1.5 text-white shadow-sm sm:text-sm sm:leading-6 border border-gray-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="font-poppins block text-sm font-medium leading-6 text-white"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="font-poppins pl-2 block w-full rounded-md bg-white/5 py-1.5 text-white shadow-sm sm:text-sm sm:leading-6 outline-none border border-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center relative inline-flex items-center text-white font-poppins bg-gradient-to-r from-primary to-secondary rounded py-2 px-6 shadow-sm border border-primary hover:bg-white/20"
            >
              Sign in
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-400 font-poppins">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-poppins leading-6 underline text-gray-200 hover:text-gray-200"
            >
              Register here
            </a>
          </p>
        </div>
      </div>

      {error && (
        <Notification
          show={showLoginNotification}
          message={error}
          onClose={() => setShowLoginNotification(false)}
          type="error"
        />
      )}
    </>
  );
};

export default LoginPage;
