"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    let data: { token?: string; user?: User; message?: string; error?: string } = {};
    try {
      data = await res.json();
    } catch (err) {
      setMessage("Lỗi server hoặc không nhận được phản hồi hợp lệ.");
      return;
    }
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    setMessage(data.message || data.error || "");
    if (data.user?.role === "ADMIN") {
      router.push("/admin");
    } else if (data.user?.role === "USER") {
      router.push("/user");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 py-10 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Đăng nhập</h1>
          <p className="text-gray-600 mt-2">
            Chưa có tài khoản? {" "}
            <Link href="/auth/register" className="text-blue-700 hover:underline">Đăng ký</Link>
          </p>
        </div>

        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4" aria-label="Form đăng nhập">
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors shadow-sm"
            >
              Đăng nhập
            </button>
          </form>
          {message && (
            <div
              role="status"
              className={`mt-4 rounded-lg p-3 text-sm border ${message.includes("thành công") ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
            >
              {message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}





