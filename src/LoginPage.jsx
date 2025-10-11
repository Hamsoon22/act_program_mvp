import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "./lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 종류: 사용자/관리자
  const [as, setAs] = useState("user"); // "user" or "admin"
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // api.login 또는 api.adminLogin 선택
  const loginFn = useMemo(() => (as === "admin" ? api.adminLogin : api.login), [as]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const resp = await loginFn(loginId, password);
      const data = resp?.data || resp;
      const access = data?.accessToken;
      const refresh = data?.refreshToken;
      if (!access) throw new Error("accessToken이 없습니다.");

      localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("role", as === "admin" ? "counselor" : "client");

      // 로그인 성공 후 이동 경로
      const fallback = "/"; // AppHome이 걸려있는 Route 경로!
      const back = location.state?.from || fallback;
      navigate(back, { replace: true });
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">로그인</h1>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`rounded-lg border px-3 py-2 text-sm ${as === "user" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setAs("user")}
        >
          사용자 로그인
        </button>
        <button
          type="button"
          className={`rounded-lg border px-3 py-2 text-sm ${as === "admin" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setAs("admin")}
        >
          상담사(관리자) 로그인
        </button>
      </div>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <input
          placeholder="Login ID"
          className="rounded-lg border px-3 py-2"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-lg border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </form>
    </div>
  );
}