"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authApi";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // guard against duplicate submissions

    setError("");
    setIsLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.accessToken);
      router.push("/products");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded shadow"
      >
        <h1 className="text-xl font-bold mb-4 text-gray-800">Login</h1>

        <label className="block text-sm text-gray-600 mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        />

        <label className="block text-sm text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}