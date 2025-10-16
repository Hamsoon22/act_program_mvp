import React, { useEffect, useState } from "react";
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
import FloatingButton from "./FloatingButton";
import { useUser } from "../context/UserContext";
import { api } from "../lib/api";
import profileIcon from '../profile.svg';

function MenuItem({ to, icon, children, onClose, onNavigate }) {
  const navigate = useNavigate();
  const go = () => {
    if (onNavigate) {
      onNavigate(to);  // 특별한 처리가 필요한 경우
    } else {
      onClose?.();     // 먼저 닫기
      navigate(to);    // 그 다음 이동
    }
  };
  return (
    <button
      onClick={go}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-slate-800 border border-transparent hover:border-slate-100 text-left"
    >
      <span>{icon}</span>
      <span className="text-base font-medium">{children}</span>
    </button>
  );
}

export default function HamburgerMenu({ open, onClose, onOpenProfile, onOpenHome, onLogout }) {
  const { user } = useUser();
  const [currentUserInfo, setCurrentUserInfo] = useState(user);
  const navigate = useNavigate();
  const route = useLocation();

  // 메뉴가 열릴 때마다 최신 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUserInfo = async () => {
      if (open) {
        try {
          const userProfile = await api.getUserProfile();
          setCurrentUserInfo({
            ...user,
            userName: userProfile.userName || user?.userName,
            loginId: userProfile.loginId || user?.loginId,
            avatarUrl: userProfile.avatarUrl || user?.avatarUrl
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setCurrentUserInfo(user);
        }
      }
    };

    fetchCurrentUserInfo();
  }, [open, user]);

  const handleSpecialNavigation = (to) => {
    if (to === '/profile' && onOpenProfile) {
      onOpenProfile();  // 특별한 프로필 처리
    } else if (to === '/' && onOpenHome) {
      onOpenHome();     // 특별한 홈 처리
    } else {
      onClose?.();
      navigate(to);
    }
  };

  // ESC로 닫기 (바디 스크롤 잠금 제거)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // ✅ 훅 호출 후에 조건부 렌더
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-white" onClick={onClose}>
      <div
        className="absolute inset-0 bg-white p-5 pt-0 flex flex-col pb-[100px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '100vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center px-2 py-4 pt-7 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
              {currentUserInfo?.avatarUrl ? (
                <img src={currentUserInfo.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <img src={profileIcon} alt="default profile" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-slate-800 font-semibold leading-tight">{currentUserInfo?.userName || "Guest"}</p>
              <p className="text-xs text-slate-500">{currentUserInfo?.loginId || "로그인되지 않음"}</p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <nav className="mt-6 grid gap-2">
          <MenuItem to="/" icon={<Home className="w-5 h-5" />} onClose={onClose} onNavigate={handleSpecialNavigation}>홈</MenuItem>
          <MenuItem to="/profile" icon={<UserIcon className="w-5 h-5" />} onClose={onClose} onNavigate={handleSpecialNavigation}>프로필</MenuItem>
          <MenuItem to="/survey" icon={<FileText className="w-5 h-5" />} onClose={onClose}>Rumination Scale</MenuItem>
          <MenuItem to="/vlq-survey" icon={<FileText className="w-5 h-5" />} onClose={onClose}>Valued Living Questionnaire</MenuItem>
          <MenuItem to="/mbi-survey" icon={<FileText className="w-5 h-5" />} onClose={onClose}>MBI-v.students</MenuItem>
          <MenuItem to="/voice-rec" icon={<Mic className="w-5 h-5" />} onClose={onClose}>목소리 녹음</MenuItem>
          <MenuItem to="/diary-list" icon={<Pencil className="w-5 h-5" />} onClose={onClose}>일기 목록</MenuItem>
          <MenuItem to="/leaf-ship" icon={<Leaf className="w-5 h-5" />} onClose={onClose}>나뭇잎 배 띄우기</MenuItem>
        </nav>

        {/* 하단 */}
        <div className="mt-auto pb-6 pt-4 border-t border-slate-100">
          <button
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700"
            onClick={() => { onClose?.(); onLogout?.(); }}
          >
            <LogOut className="w-5 h-5" /> 로그아웃
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">v1.0.0</p>
        </div>
      <FloatingButton />
      </div>
    </div>
  );
}