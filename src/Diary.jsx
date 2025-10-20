import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, TextField, Button
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function Diary() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // optional diary id for edit

  const backgroundOptions = [
    { name: '기본', color: '#ffffff' },
    { name: '미색', color: '#FFF8E7' },
    { name: '연두', color: '#F0F8F0' },
    { name: '하늘', color: '#E8F4FD' },
    { name: '라벤더', color: '#F3E8FF' },
    { name: '복숭아', color: '#FFF0F0' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // if id present, load diary for editing
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDiary(id);
        // data expected to contain diaryContent, diaryDate, diaryTitle, colorCode (if backend supports)
        if (cancelled) return;
        if (data) {
          if (data.diaryContent !== undefined) setDiaryText(data.diaryContent);
          else if (data.content !== undefined) setDiaryText(data.content); // fallback field name
          if (data.colorCode) setBackgroundColor(data.colorCode);
          // optionally set diaryDate/title if you expose those fields in UI
        }
      } catch (e) {
        console.error('Failed to load diary', e);
        setError('일기 불러오기 실패');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 300);
  };

  // 프로그램 ID 없으면 1로 처리
  const getProgramId = () => 1;

  const handleSave = async () => {
    setError('');
    if (!diaryText.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    // 날짜 형식 고침
    const date = new Date();
    const diaryDate = `${date.getFullYear()}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getDate().toString().padStart(2,'0')}`;
    const diaryTitle = '';
    const diaryContent = diaryText.trim();
    const programId = getProgramId();
    const colorCode = backgroundColor;

    const token = localStorage.getItem('accessToken');

    if (token && id) {
      // logged in and editing existing diary
      try {
        await api.updateDiary(id, {
          programId,
          diaryDate,
          diaryTitle,
          diaryContent,
          colorCode,
        });
        alert('일기가 수정되었습니다!');
        navigate('/diary-list');
      } catch (e) {
        console.error(e);
        setError('수정 실패: ' + (e.message || ''));
      }
      return;
    }

    if (token && !id) {
      // logged in and creating new diary
      try {
        await api.createDiary({
          programId,
          diaryDate,
          diaryTitle,
          diaryContent,
          colorCode,
        });
        alert('일기가 저장되었습니다!');
        navigate('/diary-list');
      } catch (e) {
        console.error(e);
        setError('저장 실패: ' + (e.message || ''));
      }
      return;
    }

    // Not logged in: local temporary save (includes color)
    try {
      const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
      const tempDiary = {
        id: Date.now(),
        programId,
        diaryDate,
        diaryTitle,
        diaryContent,
        backgroundColor: colorCode,
      };
      localStorage.setItem('diaries', JSON.stringify([tempDiary, ...savedDiaries]));
      alert('로그인 없이 임시로 일기가 저장되었습니다!');
      navigate('/diary-list');
    } catch (e) {
      console.error(e);
      setError('임시 저장 실패: ' + (e.message || ''));
    }
  };

  return (
    <>
      <CSSTransition
        in={isVisible && !isExiting}
        timeout={300}
        classNames="slide-right"
        unmountOnExit
      >
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            position: 'relative',
            transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out, background-color 0.3s ease',
          }}
        >
          {/* 앱바 */}
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              backgroundColor: 'transparent',
              backdropFilter: 'none',
              borderBottom: 'none',
              paddingTop: 0,
              top: 0
            }}
          >
            <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
                <IconButton 
                  onClick={handleBackClick}
                  sx={{ 
                    color: '#1B1F27',
                    p: 2
                  }}
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
              
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1B1F27', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}
                >
                  {id ? '일기 수정' : '일기 쓰기'}
                </Typography>
              </Box>
              
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <Button
                  onClick={handleSave}
                  sx={{
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0
                  }}
                >
                  저장
                </Button>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ py: 0, px: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', pb: '120px' }}>
            <TextField
              multiline
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="오늘 하루는 어떠셨나요?"
              sx={{
                width: '100%',
                flex: 1,
                pt: 2,
                pb: 2,
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  fontSize: '20px',
                  lineHeight: 1.6,
                  padding: 0,
                  height: '100%',
                  alignItems: 'flex-start',
                  '& fieldset': {
                    border: 'none'
                  },
                  '&:hover fieldset': {
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none'
                  }
                },
                '& .MuiInputBase-input': {
                  padding: 0,
                  color: '#333',
                  fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
                  height: '100% !important',
                  overflow: 'auto !important',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1
                  }
                }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            {/* 배경색 선택창 */}
            <Box sx={{ 
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              pt: 2,
              pb: 3,
              px: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                justifyContent: 'center',
                maxWidth: 'sm',
                mx: 'auto'
              }}>
                {backgroundOptions.map((option) => (
                  <Box
                    key={option.name}
                    onClick={() => setBackgroundColor(option.color)}
                    sx={{
                      width: 35,
                      height: 35,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                      border: backgroundColor === option.color ? '3px solid #000000' : '2px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: backgroundColor === option.color ? '0 0 0 2px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      </CSSTransition>
    </>
  );
}