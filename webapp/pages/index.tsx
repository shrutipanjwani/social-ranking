import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <main>
      <h1>Social Ranker</h1>
      <button type="button" onClick={() => router.push("/register")}>
        Login/Register
      </button>
    </main>
  );
}
