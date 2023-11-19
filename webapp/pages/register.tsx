"use client";

import React, { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../utils/firebase";
import { useRouter } from "next/router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

const RegisterPage = () => {
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
    <form onSubmit={handleRegister}>
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
      <button type="submit">Register</button>
      {error && <p>Error: {error}</p>}
    </form>
  );
};

export default RegisterPage;
