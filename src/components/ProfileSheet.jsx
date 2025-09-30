import React, { useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { Camera, Save } from "lucide-react";

export default function ProfilePage() {
    const { user, setUser } = useUser();
    const [form, setForm] = useState(user);
    const [saved, setSaved] = useState(false);
    const fileRef = useRef(null);
    
    
    const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
    };
    const onPickFile = () => fileRef.current?.click();
    const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatarUrl: reader.result }));
    reader.readAsDataURL(file);
    setSaved(false);
    };
    const onSubmit = (e) => {
    e.preventDefault();
    setUser(form);
    setSaved(true);
    };


return (
<div className="mx-auto w-full max-w-2xl p-6">
<h1 className="text-2xl font-semibold tracking-tight">프로필</h1>
<p className="text-sm text-slate-500 mt-1">앱을 사용하는 이용자 정보입니다.</p>


<form onSubmit={onSubmit} className="mt-6 grid gap-5">
<div className="flex items-center gap-4">
<div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
{form?.avatarUrl ? (
<img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
) : (
<div className="w-full h-full grid place-items-center text-slate-500">No Image</div>
)}
</div>
<div>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
<button type="button" onClick={onPickFile} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">
<Camera className="w-4 h-4" /> 아바타 변경
</button>
</div>
</div>


<div className="grid gap-2">
<label className="text-sm text-slate-600">이름</label>
<input name="name" value={form.name} onChange={onChange} className="rounded-xl border px-3 py-2" placeholder="이름" />
</div>


<div className="grid gap-2">
<label className="text-sm text-slate-600">이메일</label>
<input name="email" type="email" value={form.email} onChange={onChange} className="rounded-xl border px-3 py-2" placeholder="example@email.com" />
</div>


<div className="grid gap-2">
<label className="text-sm text-slate-600">소개</label>
<textarea name="bio" value={form.bio} onChange={onChange} className="rounded-xl border px-3 py-2 min-h-[100px]" placeholder="간단한 소개를 적어주세요" />
</div>


<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="grid gap-2">
<label className="text-sm text-slate-600">언어</label>
<select name="language" value={form.language} onChange={onChange} className="rounded-xl border px-3 py-2">
<option value="ko">한국어</option>
<option value="en">English</option>
<option value="ja">日本語</option>
</select>
</div>
<div className="grid gap-2">
<label className="text-sm text-slate-600">시간대</label>
<input name="timezone" value={form.timezone} onChange={onChange} className="rounded-xl border px-3 py-2" placeholder="Asia/Seoul" />
</div>
</div>


<button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-slate-900 text-white hover:bg-slate-800">
<Save className="w-4 h-4" /> 저장
</button>


{saved && <p className="text-green-600 text-sm">저장되었습니다 ✅</p>}
</form>
</div>
);
}