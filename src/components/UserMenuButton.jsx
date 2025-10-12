// src/components/UserMenuButton.jsx
import React from "react";
import { Menu } from "lucide-react";

export default function UserMenuButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick} // 👉 여기서 부모(AppHome)로부터 받은 onClick 실행
      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm shadow-sm transition active:scale-[.99] border border-gray-300 bg-white hover:bg-gray-50"
    >
      <Menu className="w-5 h-5" />
      <span className="text-sm">메뉴</span>
    </button>
  );
}
