// src/components/UserMenuButton.jsx
import React from "react";
import { Menu } from "lucide-react";

export default function UserMenuButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick} // 👉 여기서 부모(AppHome)로부터 받은 onClick 실행
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 shadow hover:shadow-md transition border border-slate-200 bg-white"
    >
      <Menu className="w-5 h-5" />
      <span className="text-sm">메뉴</span>
    </button>
  );
}
