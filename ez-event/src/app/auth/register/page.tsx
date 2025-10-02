"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  // trimmed optional fields removed
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string; name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: { email?: string; password?: string; phone?: string; name?: string } = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+\-()\s]{6,20}$/;

    if (!regEmail.trim() || !emailPattern.test(regEmail)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!regPassword || regPassword.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    if (phone && !phonePattern.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (regName && regName.length > 100) {
      newErrors.name = "Tên quá dài (tối đa 100 ký tự)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;
    setSubmitting(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: regEmail,
        name: regName,
        password: regPassword,
        phone,
        organization,
        jobTitle,
      }),
    });
    type RegisterResponse = {
      message?: string;
      error?: string;
      fieldErrors?: { email?: string; password?: string; phone?: string; name?: string };
    };
    let data: RegisterResponse = {} as RegisterResponse;
    try {
      data = await res.json();
      if (!res.ok && data?.fieldErrors) {
        setErrors(data.fieldErrors);
      }
      setMessage(data.message || data.error || "");
    } catch {
      setMessage("Lỗi server hoặc không nhận được phản hồi hợp lệ.");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 py-10 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Đăng ký</h1>
          <p className="text-gray-600 mt-2">
            Đã có tài khoản? {" "}
            <Link href="/auth/login" className="text-blue-700 hover:underline">Đăng nhập</Link>
          </p>
        </div>

        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8">
          <form onSubmit={handleRegister} className="space-y-4" aria-label="Form đăng ký">
            <div>
              <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="regEmail"
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "regEmail-error" : undefined}
              />
              {errors.email && (
                <p id="regEmail-error" role="alert" className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                  placeholder="090xxxxxxx"
                  autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                />
              {errors.phone && (
                <p id="phone-error" role="alert" className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">Tổ chức</label>
                <input
                  id="organization"
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                  placeholder="Công ty/Trường"
                  autoComplete="organization"
                />
              </div>
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="Developer, Marketer..."
                autoComplete="organization-title"
              />
            </div>
            <div>
              <label htmlFor="regName" className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <input
                id="regName"
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "regName-error" : undefined}
              />
              {errors.name && (
                <p id="regName-error" role="alert" className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                id="regPassword"
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "regPassword-error" : undefined}
              />
              {errors.password && (
                <p id="regPassword-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center items-center bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors shadow-sm"
            >
              {submitting ? "Đang gửi..." : "Đăng ký"}
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



