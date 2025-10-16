import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { Camera, Save } from "lucide-react";
import BottomNavigation from "./components/BottomNavigation";
import HamburgerMenu from "./components/HamburgerMenu";
import {
  Container, Typography, Box, AppBar, Toolbar
} from '@mui/material';
import profileIcon from './profile.svg';
import { api } from "./lib/api"; // 경로에 맞게 수정

export default function ProfilePage() {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [form, setForm] = useState({
        userName: "",
        email: "",
        description: "",
        timeZone: "",
        language: "",
        avatarUrl: "",
        loginId: ""
    });
    const [saved, setSaved] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('mypage');
    const [isExiting, setIsExiting] = useState(false);

    // 비밀번호 변경 관련
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const fileRef = useRef(null);

    useEffect(() => {
        const fetchUserId = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await api.getUserProfile();
                setForm(f => ({
                    ...f,
                    loginId: data.loginId || "",
                    userName: data.userName || "",
                    email: data.email || "",
                    description: data.description || "",
                    timeZone: data.timeZone || "Asia/Seoul",
                    language: data.language || "ko",
                }));
            } catch (err) {
                setError(err.message || "에러가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserId();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setSaved(false);
    };

    const onPasswordChange = (e) => {
        const { name, value } = e.target;
        if (name === 'oldPassword') setOldPassword(value);
        if (name === 'newPassword') setNewPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
        setPasswordError('');
        setPasswordSuccess('');
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

    // 프로필 저장
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaved(false);
        try {
            const updateData = {
                userName: form.userName,
                language: form.language || 'ko',
                email: form.email,
                description: form.description,
                timeZone: form.timeZone || 'Asia/Seoul'
            };
            await api.updateUserProfile(updateData);
            setUser(form);
            setSaved(true);
        } catch (err) {
            console.error('Profile update error:', err);
            setError("회원정보 저장 중 오류가 발생했습니다: " + (err.message || ""));
        }
    };

    // 비밀번호 변경 (저장 버튼과 별도 동작)
    const onPasswordSubmit = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("모든 비밀번호 항목을 입력하세요.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('새 비밀번호와 확인이 일치하지 않습니다.');
            return;
        }
        // 정규식 체크: ^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&()+])[A-Za-z\d!@#$%^&*()+]{8,20}$
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&()+])[A-Za-z\d!@#$%^&*()+]{8,20}$/.test(newPassword)) {
            setPasswordError('비밀번호는 영문+숫자+특수문자 포함 8~20자여야 합니다.');
            return;
        }
        try {
            await api.changePassword({ oldPassword, newPassword });
            setPasswordSuccess("비밀번호가 성공적으로 변경되었습니다.");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError("비밀번호 변경 실패: " + (err.message || ""));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'home') {
            setIsExiting(true);
            setTimeout(() => {
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
        setShowMenu(false);
        setIsExiting(true);
        setTimeout(() => {
            navigate('/');
        }, 300);
    };

    if (loading) return <div className="p-12 text-center text-gray-500">사용자 정보를 불러오는 중...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

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
                                {form.avatarUrl ? (
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
                            <input name="userName" value={form.userName} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="이름을 입력하세요" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">아이디</label>
                            <input name="loginId" value={form.loginId || ""} disabled className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed" placeholder="아이디" />
                        </div>
                        <div className="grid gap-2 mt-6 mb-2">
                            <label className="text-sm text-slate-600 font-medium">비밀번호 변경</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={oldPassword}
                                onChange={onPasswordChange}
                                className="rounded-xl border border-slate-200 px-4 py-3"
                                placeholder="현재 비밀번호"
                            />
                            <input
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={onPasswordChange}
                                className="rounded-xl border border-slate-200 px-4 py-3"
                                placeholder="새 비밀번호"
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onPasswordChange}
                                className="rounded-xl border border-slate-200 px-4 py-3"
                                placeholder="새 비밀번호 확인"
                            />
                            <button
                                type="button"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-white transition-colors mt-2"
                                style={{ backgroundColor: '#00A3D9' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#0091C1'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#00A3D9'}
                                onClick={onPasswordSubmit}
                            >
                                비밀번호 변경
                            </button>
                            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
                            {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">이메일</label>
                            <input name="email" type="email" value={form.email} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="example@email.com" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm text-slate-600 font-medium">소개</label>
                            <textarea name="description" value={form.description} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="간단한 소개를 적어주세요" />
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
                                <input name="timeZone" value={form.timeZone} onChange={onChange} className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Asia/Seoul" />
                            </div>
                        </div>
                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors mt-4">
                            <Save className="w-4 h-4" /> 저장하기
                        </button>
                        {saved && <p className="text-green-600 text-sm text-center font-medium">✅ 저장되었습니다!</p>}
                        {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
                    </form>
                </Box>
            </Container>
            <HamburgerMenu
                open={showMenu}
                onClose={() => setShowMenu(false)}
                onOpenProfile={() => {}}
                onOpenHome={handleHomeNavigation}
                onLogout={handleLogout}
            />
            <BottomNavigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onOpenMenu={() => setShowMenu(true)}
                onOpenProfile={() => {}}
                showMenu={showMenu}
                onCloseMenu={() => setShowMenu(false)}
            />
            </Box>
        </>
    );
}