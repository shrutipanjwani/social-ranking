"use client";

import React, { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../utils/firebase";
import { useRouter } from "next/router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { RectangleStackIcon } from "@heroicons/react/24/outline";
import Notification from "@/components/Notification";
import Link from "next/link";

const RegisterPage = () => {
  const [showRegisterNotification, setShowRegisterNotification] =
    useState(false);

  // Call this function to show the notification
  const triggerRegisterNotification = () => {
    setShowRegisterNotification(true);
    setTimeout(() => setShowRegisterNotification(false), 3000);
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If there's a user logged in, redirect to dashboard
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    triggerRegisterNotification();

    const registerUser = httpsCallable(functions, "registerUser");
    try {
      const result = await registerUser({ displayName: name, email, password });
      const data = result.data;
      console.log("Result:", data);
      if (data) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        setError("Failed to create user. No user ID returned.");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof FirebaseError) {
        setError(`Error (${error.code}): ${error.message}`);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <RectangleStackIcon className="h-8 w-auto mx-auto" />
          <h2 className="mt-8 text-center text-2xl font-poppins-medium leading-9 tracking-tight text-white">
            Sign up for your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" onSubmit={handleRegister}>
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
              Register
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-400 font-poppins">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-poppins leading-6 underline text-gray-200 hover:text-gray-200"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>

      {error && (
        <Notification
          show={showRegisterNotification}
          message={error}
          onClose={() => setShowRegisterNotification(false)}
          type="error"
        />
      )}
    </>
  );
};

export default RegisterPage;
