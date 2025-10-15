import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { Camera, Save } from "lucide-react";
import BottomNavigation from "./components/BottomNavigation";
import HamburgerMenu from "./components/HamburgerMenu";
import { CSSTransition } from 'react-transition-group';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton
} from '@mui/material';
import backIcon from './back.svg';
import profileIcon from './profile.svg';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [form, setForm] = useState(user);
    const [saved, setSaved] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('mypage');
    const [isExiting, setIsExiting] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const fileRef = useRef(null);
    
    // useEffect는 제거 - 초기에 바로 표시
    
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setSaved(false);
    };

    const onPasswordChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newPassword') {
            setNewPassword(value);
            // 확인 비밀번호가 있고 다를 경우 에러 표시
            if (confirmPassword && value !== confirmPassword) {
                setPasswordError('비밀번호가 일치하지 않습니다');
            } else {
                setPasswordError('');
            }
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
            // 새 비밀번호와 다를 경우 에러 표시
            if (newPassword && value !== newPassword) {
                setPasswordError('비밀번호가 일치하지 않습니다');
            } else {
                setPasswordError('');
            }
        }
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
        
        // 비밀번호 변경이 요청된 경우 검증
        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                setPasswordError('비밀번호가 일치하지 않습니다');
                return;
            }
            if (newPassword.length < 6) {
                setPasswordError('비밀번호는 6자 이상이어야 합니다');
                return;
            }
        }
        
        setPasswordError('');
        setUser(form);
        setSaved(true);
        
        // 비밀번호 변경 후 필드 초기화
        if (newPassword) {
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'home') {
            console.log('ProfilePage: Starting exit animation');
            setIsExiting(true);
            setTimeout(() => {
                console.log('ProfilePage: Navigating to home');
                navigate('/');
            }, 300);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleHomeNavigation = () => {
        console.log('ProfilePage: Home navigation from menu');
        setShowMenu(false);
        setIsExiting(true);
        setTimeout(() => {
            console.log('ProfilePage: Navigating to home from menu');
            navigate('/');
        }, 300);
    };

    return (
        <>
            <style>
                {`
                    .fade-container {
                        opacity: 1;
                        transition: opacity 300ms ease-out;
                    }
                    
                    .fade-container.exiting {
                        opacity: 0;
                    }
                `}
            </style>
            
            <Box 
                className={`fade-container ${isExiting ? 'exiting' : ''}`}
                sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #DFEFF6 90%)', paddingBottom: '80px' }}
            >
            {/* 상단 앱바 */}
            {!showMenu && (
                <AppBar 
                    position="static" 
                    sx={{ 
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        background: 'transparent'
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'flex-start', px: '18px' }}>
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
                    </Toolbar>
                </AppBar>
            )}

            <Container maxWidth="sm" sx={{ py: 1, pb: 2 }}>
                <Box sx={{ 
                    background: 'white',
                    borderRadius: 4,
                    p: 4,
                    boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
                }}>
               

                    <form onSubmit={onSubmit} className="grid gap-5">
                        <div className="flex flex-col items-center gap-4 justify-center">
                            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden">
                                {form?.avatarUrl ? (
                                    <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={profileIcon} alt="default profile" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                                <button type="button" onClick={onPickFile} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm">
                                    <Camera className="w-4 h-4" /> 이미지 변경
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">이름</label>
                            <input name="name" value={form.name} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="이름을 입력하세요" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">아이디</label>
                            <input name="userId" value={form.userId || "user123"} disabled className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed" placeholder="아이디" />
                        </div>

                        {/* 비밀번호 변경 */}
                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">비밀번호 변경</label>
                            <input 
                                type="password" 
                                name="newPassword" 
                                value={newPassword}
                                onChange={onPasswordChange}
                                className={`rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 ${
                                    passwordError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                                }`}
                                placeholder="새 비밀번호" 
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">비밀번호 확인</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={confirmPassword}
                                onChange={onPasswordChange}
                                className={`rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 ${
                                    passwordError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                                }`}
                                placeholder="새 비밀번호 재입력" 
                            />
                            {passwordError && (
                                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">이메일</label>
                            <input name="email" type="email" value={form.email} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="example@email.com" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">소개</label>
                            <textarea name="bio" value={form.bio} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="간단한 소개를 적어주세요" />
                        </div>

                        {/* 언어 및 시간대 설정 (숨김 처리)
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
                        */}

                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors mt-4">
                            <Save className="w-4 h-4" /> 저장하기
                        </button>

                        {saved && <p className="text-green-600 text-sm text-center font-medium">✅ 저장되었습니다!</p>}
                    </form>
                </Box>
            </Container>

            <HamburgerMenu
                open={showMenu}
                onClose={() => setShowMenu(false)}
                onOpenProfile={() => {}} // Already on profile page
                onOpenHome={handleHomeNavigation}
                onLogout={handleLogout}
            />

            <BottomNavigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onOpenMenu={() => setShowMenu(true)}
                onOpenProfile={() => {}} // Already on profile page
                showMenu={showMenu}
                onCloseMenu={() => setShowMenu(false)}
            />
            </Box>
        </>
    );
}