import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { Camera, Save } from "lucide-react";
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton
} from '@mui/material';
import backIcon from './back.svg';

export default function ProfilePage() {
    const navigate = useNavigate();
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
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #DFEFF6 90%)' }}>
            {/* 상단 앱바 */}
            <AppBar 
                position="sticky" 
                sx={{ 
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    background: 'transparent'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {/* 뒤로가기 버튼 */}
                    <Box>
                        <IconButton 
                            onClick={() => navigate(-1)}
                            sx={{ p: 0 }}
                        >
                            <img 
                                src={backIcon} 
                                alt="뒤로가기" 
                                style={{ 
                                    width: '46px', 
                                    height: '46px' 
                                }} 
                            />
                        </IconButton>
                    </Box>
                    
                    {/* 중앙 제목 */}
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: '#1B1F27', 
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}
                        >
                            프로필
                        </Typography>
                    </Box>
                    
                    {/* 오른쪽 공간 (균형 맞추기) */}
                    <Box sx={{ width: 48 }} />
                </Toolbar>
            </AppBar>

            <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
                <Box sx={{ 
                    background: 'white',
                    borderRadius: 4,
                    p: 4,
                    boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
                        앱을 사용하는 이용자 정보입니다.
                    </Typography>

                    <form onSubmit={onSubmit} className="grid gap-5">
                        <div className="flex items-center gap-4 justify-center">
                            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden">
                                {form?.avatarUrl ? (
                                    <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-slate-500 text-sm">No Image</div>
                                )}
                            </div>
                            <div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                                <button type="button" onClick={onPickFile} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm">
                                    <Camera className="w-4 h-4" /> 아바타 변경
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">이름</label>
                            <input name="name" value={form.name} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="이름을 입력하세요" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">이메일</label>
                            <input name="email" type="email" value={form.email} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="example@email.com" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">소개</label>
                            <textarea name="bio" value={form.bio} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="간단한 소개를 적어주세요" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm text-slate-600 font-medium">언어</label>
                                <select name="language" value={form.language} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="ko">한국어</option>
                                    <option value="en">English</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm text-slate-600 font-medium">시간대</label>
                                <input name="timezone" value={form.timezone} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Asia/Seoul" />
                            </div>
                        </div>

                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors mt-4">
                            <Save className="w-4 h-4" /> 저장하기
                        </button>

                        {saved && <p className="text-green-600 text-sm text-center font-medium">✅ 저장되었습니다!</p>}
                    </form>
                </Box>
            </Container>
        </Box>
    );
}