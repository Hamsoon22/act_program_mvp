import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, TextField, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function Diary() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const navigate = useNavigate();

  // 배경색 옵션들
  const backgroundOptions = [
    { name: '기본', color: '#ffffff' },
    { name: '미색', color: '#FFF8E7' },
    { name: '연두', color: '#F0F8F0' },
    { name: '하늘', color: '#E8F4FD' },
    { name: '라벤더', color: '#F3E8FF' },
    { name: '복숭아', color: '#FFF0F0' },
  ];

  useEffect(() => {
    // 컴포넌트 마운트 후 즉시 애니메이션 시작
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

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 300);
  };

  const handleSave = async () => {
    if (diaryText.trim()) {
      // 일기 저장
      const newDiary = {
        id: Date.now(),
        content: diaryText.trim(),
        backgroundColor: backgroundColor,
        date: new Date().toLocaleDateString('ko-KR'),
        time: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: new Date().toISOString()
      };
      
      // (API 저장으로 변경)
      const existingDiaries = [] /* loaded via API */;
      
      // 새 일기 추가 (메모리)
      const updatedDiaries = [newDiary, ...existingDiaries];
      
            // API 저장
      try { await api.createDiary({ userId: 'guest', ...newDiary }); } catch (e) { console.error(e); alert('저장 실패: ' + e.message); return; }
      
      alert('일기가 저장되었습니다!');
      
      // 일기 리스트 페이지로 이동
      navigate('/diary-list');
    } else {
      alert('내용을 입력해주세요.');
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
              {/* 왼쪽 백버튼 */}
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
                  일기 쓰기
                </Typography>
              </Box>
              
              {/* 오른쪽 저장 버튼 */}
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <Button
                  onClick={handleSave}
                  sx={{
                    color: '#00A3D9',
                    fontWeight: 'bold',
                    fontSize: '18px',
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
            {/* 텍스트 입력창 */}
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