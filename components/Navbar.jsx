"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow">
      <span className="font-semibold text-gray-800">
        Product Admin Dashboard
      </span>
      <button
        onClick={handleLogout}
        className="text-sm bg-red-600 text-white px-3 py-1.5 rounded"
      >
        Logout
      </button>
    </nav>
  );
}