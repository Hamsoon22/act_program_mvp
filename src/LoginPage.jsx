import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "./lib/api";
import loginImage from "./login.png";

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

  // 로그인 없이 입장 버튼 (NEW)
  const handleSkipLogin = () => {
    localStorage.setItem("accessToken", "");
    localStorage.setItem("role", as === "admin" ? "counselor" : "client");
    navigate("/", { replace: true }); // 홈으로 이동
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const resp = await loginFn(loginId, password);
      const data = resp?.data || resp;
      const access = data?.accessToken;
      const refresh = data?.refreshToken;
      if (!access) throw new Error("로그인에 실패했습니다.");

      localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("role", as === "admin" ? "counselor" : "client");

      // 로그인 성공 후 이동 경로
      const fallback = "/"; // AppHome이 걸려있는 Route 경로!
      const back = location.state?.from || fallback;
      navigate(back, { replace: true });
    } catch (e) {
      let errorMessage = "로그인에 실패했습니다.";
      if (e.message?.includes("Failed to fetch") || e.message?.includes("fetch")) {
        errorMessage = "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
      } else if (e.message?.includes("401") || e.message?.includes("Unauthorized")) {
        errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
      } else if (e.message?.includes("403") || e.message?.includes("Forbidden")) {
        errorMessage = "접근 권한이 없습니다.";
      } else if (e.message?.includes("500")) {
        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* 애니메이션 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D96DA1] to-[#1EB4E6] animate-gradient-xy"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-[#1EB4E6] to-[#D96DA1] animate-gradient-xy animation-delay-1000 opacity-75"></div>
      
      {/* 콘텐츠 영역 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 상단 환영 영역 */}
        <div className="flex-1 flex flex-col justify-center items-center text-white px-6 py-4">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 flex items-center justify-center">
              <img src={loginImage} alt="로그인 이미지" className="w-full h-full object-contain"/>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">반갑습니다 :)</h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90">워크샵 기간 : 25.10.21~25.11.11</p>
          </div>
        </div>

        {/* 하단 로그인 폼 영역 */}
        <div className="bg-white rounded-t-3xl px-6 py-8 flex-shrink-0">
          <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">워크샵 로그인</h2>
            
            {/* 역할 선택 버튼 (기존 그대로) */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`rounded-full px-4 py-3 text-sm font-medium transition-all ${
                  as === "user" 
                    ? "bg-black bg-opacity-60 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setAs("user")}
              >
                사용자
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-3 text-sm font-medium transition-all ${
                  as === "admin" 
                    ? "bg-black bg-opacity-60 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setAs("admin")}
              >
                관리자
              </button>
            </div>
            {/* 기존 로그인 폼 (유지) */}
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <input
                  placeholder="아이디"
                  className="w-full rounded-full border-2 border-gray-200 px-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-0 transition-colors"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="w-full rounded-full border-2 border-gray-200 px-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-0 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#000000] hover:bg-gray-900 text-white font-semibold py-4 rounded-full transition-colors mt-6 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
              {err && (
                <div className="text-sm text-red-500 text-center mt-4 p-3 bg-red-50 rounded-xl">
                  {err}
                </div>
              )}
               <button
              type="button"
              className="w-full mb-4 bg-gray-700 hover:bg-black text-white font-semibold py-4 rounded-full"
              onClick={handleSkipLogin}
            >
              로그인 없이 입장
            </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}