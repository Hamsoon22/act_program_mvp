import React, { useRef, useState } from "react";
import { Camera, Save } from "lucide-react";

// 무조건 게스트 프로필만!
export default function ProfilePage() {
  const defaultProfile = {
    avatarUrl: "",
    name: "게스트",
    email: "",
    bio: "",
    language: "ko",
    timezone: "Asia/Seoul"
  };
  // 단순, 상태변경도 없음
  const form = defaultProfile;
  const fileRef = useRef(null);

  // 게스트는 비활성으로
  const onPickFile = () => {};
  const onFile = () => {};
  const onChange = () => {};
  const onSubmit = (e) => {
    e.preventDefault();
    // 저장 없음!
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">프로필</h1>
      <p className="text-sm text-slate-500 mt-1">앱을 사용하는 이용자 정보입니다.</p>
      <p className="my-2 p-3 text-sm bg-yellow-50 text-yellow-800 rounded-xl">
        (게스트 모드) 로그인 없이 임시 정보만 보여집니다.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
            <div className="w-full h-full grid place-items-center text-slate-500">No Image</div>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button type="button" disabled className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-gray-100 text-gray-400">
              <Camera className="w-4 h-4" /> 아바타 변경
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-slate-600">이름</label>
          <input name="name" value={form.name} className="rounded-xl border px-3 py-2 bg-gray-50 text-gray-500" placeholder="이름" disabled />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">이메일</label>
          <input name="email" type="email" value={form.email} className="rounded-xl border px-3 py-2 bg-gray-50 text-gray-500" placeholder="example@email.com" disabled />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">소개</label>
          <textarea name="bio" value={form.bio} className="rounded-xl border px-3 py-2 min-h-[100px] bg-gray-50 text-gray-500" placeholder="간단한 소개를 적어주세요" disabled />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-600">언어</label>
            <select name="language" value={form.language} className="rounded-xl border px-3 py-2 bg-gray-50 text-gray-500" disabled>
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-600">시간대</label>
            <input name="timezone" value={form.timezone} className="rounded-xl border px-3 py-2 bg-gray-50 text-gray-500" placeholder="Asia/Seoul" disabled />
          </div>
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-gray-300 text-white" disabled>
          <Save className="w-4 h-4" /> 저장
        </button>
      </form>
    </div>
  );
}