import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  User as UserIcon,
  Home,
  LogOut,
  Info,
  FileText,
  Mic,
  Pencil,
  Leaf
} from "lucide-react";
import { useUser } from "../context/UserContext";

function MenuItem({ to, icon, children, onClose }) {
  const navigate = useNavigate();
  const go = () => {
    onClose?.();         // 먼저 닫기
    navigate(to);        // 그 다음 이동
  };
  return (
    <button
      onClick={go}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-slate-800 border border-transparent hover:border-slate-100 text-left"
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
}

export default function HamburgerMenu({ open, onClose, onLogout }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const route = useLocation();

  // ✅ 훅은 항상 호출! 내부에서 open을 체크
  // ESC로 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // 라우트가 바뀌면 자동 닫기 (열려있을 때만)
  // useEffect(() => {
  //   if (!open) return;
  //   onClose?.();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [route.pathname, open]);

  // ✅ 훅 호출 후에 조건부 렌더
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl p-5 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 p-2 text-slate-600" />
              )}
            </div>
            <div>
              <p className="text-slate-800 font-semibold leading-tight">{user?.name || "Guest"}</p>
              <p className="text-xs text-slate-500">{user?.email || "로그인되지 않음"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100 active:scale-95 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="mt-6 grid gap-2">
          <MenuItem to="/" icon={<Home className="w-5 h-5" />} onClose={onClose}>홈</MenuItem>

          {/* 프로필 페이지로 이동 */}
          <MenuItem to="/profile" icon={<UserIcon className="w-5 h-5" />} onClose={onClose}>프로필</MenuItem>

          {/* <MenuItem to="/hub" icon={<Info className="w-5 h-5" />} onClose={onClose}>허브</MenuItem> */}
          <MenuItem to="/survey" icon={<FileText className="w-5 h-5" />} onClose={onClose}>Rumination Scale</MenuItem>
          <MenuItem to="/mbi-survey" icon={<FileText className="w-5 h-5" />} onClose={onClose}>MBI</MenuItem>
          <MenuItem to="/voice-rec" icon={<Mic className="w-5 h-5" />} onClose={onClose}>목소리 녹음</MenuItem>
          {/* <MenuItem to="/diary" icon={<Pencil className="w-5 h-5" />} onClose={onClose}>일기 쓰기 (작성)</MenuItem> */}
          <MenuItem to="/diary-list" icon={<Pencil className="w-5 h-5" />} onClose={onClose}>일기 작성</MenuItem>
          <MenuItem to="/leaf-ship" icon={<Leaf className="w-5 h-5" />} onClose={onClose}>나뭇잎 배 띄우기</MenuItem>
        </nav>

        {/* 하단 */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700"
            onClick={() => { onClose?.(); onLogout?.(); }}
          >
            <LogOut className="w-5 h-5" /> 로그아웃
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">v1.0.0</p>
        </div>
      </aside>
    </div>
  );
}
