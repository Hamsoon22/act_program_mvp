import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User as UserIcon,
  Home,
  Calendar,
  Settings,
  LogOut,
  Info,
  FileText,
  Mic,
  Pencil,
  Leaf
} from "lucide-react";
import { useUser } from "../context/UserContext";

function MenuItem({ to, icon, children }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to, { replace: true })}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-slate-800 border border-transparent hover:border-slate-100 text-left"
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
}

export default function HamburgerMenu() {
  const navigate = useNavigate();
  const { user } = useUser();

  const close = () => navigate(-1);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={close}>
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
            onClick={close}
            className="rounded-xl p-2 hover:bg-slate-100 active:scale-95 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 기본 메뉴 */}
        <nav className="mt-6 grid gap-2">
          <MenuItem to="/" icon={<Home className="w-5 h-5" />}>홈</MenuItem>
          <MenuItem to="/profile" icon={<UserIcon className="w-5 h-5" />}>프로필</MenuItem>
          <MenuItem to="/schedule" icon={<Calendar className="w-5 h-5" />}>내 일정</MenuItem>

          <MenuItem to="/survey" icon={<FileText className="w-5 h-5" />}>
            Rumination Scale
          </MenuItem>
          <MenuItem to="/mbi-survey" icon={<FileText className="w-5 h-5" />}>
            MBI
          </MenuItem>
          <MenuItem to="/voice-rec" icon={<Mic className="w-5 h-5" />}>
            목소리 녹음
          </MenuItem>
          <MenuItem to="/diary-list" icon={<Pencil className="w-5 h-5" />}>
            일기쓰기
          </MenuItem>
          <MenuItem to="/leaf-ship" icon={<Leaf className="w-5 h-5" />}>
            나뭇잎 배 띄우기
          </MenuItem>

          <MenuItem to="/settings" icon={<Settings className="w-5 h-5" />}>설정</MenuItem>
          <MenuItem to="/about" icon={<Info className="w-5 h-5" />}>앱 소개</MenuItem>
        </nav>

        {/* 하단 */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700">
            <LogOut className="w-5 h-5" /> 로그아웃
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">v1.0.0</p>
        </div>
      </aside>
    </div>
  );
}
