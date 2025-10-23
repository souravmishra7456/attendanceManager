"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn Button

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/intro"); // your backend root
      if (!res.ok) throw new Error("Failed to fetch API");
      const data = await res.text(); // backend returns plain text
      setMessage(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-3xl font-bold">Backend API Caller</h1>

      <Button onClick={handleClick} variant="default">
        {loading ? "Loading..." : "Call API"}
      </Button>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      {message && <p className="text-lg mt-2">{message}</p>}
    </div>
  );
}
