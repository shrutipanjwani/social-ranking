"use client";
import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { FirebaseError } from "firebase/app";

const LoginPage = () => {
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
    <form onSubmit={handleLogin}>
      <input
        className="text-black"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="text-black"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="text-black"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p>Error: {error}</p>}
    </form>
  );
};

export default LoginPage;
