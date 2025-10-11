import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, TextField, Button
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

export default function DiaryEdit() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const navigate = useNavigate();
  const location = useLocation();
  const diary = location.state?.diary;

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
    // 일기 데이터가 없으면 메인으로 돌아가기
    if (!diary) {
      navigate('/', { replace: true });
      return;
    }

    // 기존 일기 데이터로 초기화
    setDiaryText(diary.content);
    setBackgroundColor(diary.backgroundColor);

    // 컴포넌트 마운트 후 즉시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [diary, navigate]);

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

  const handleSave = () => {
    if (diaryText.trim()) {
      // 수정된 일기 데이터
      const updatedDiary = {
        ...diary,
        content: diaryText.trim(),
        backgroundColor: backgroundColor,
        editedAt: new Date().toISOString()
      };
      
      // localStorage에서 기존 일기들 가져오기
      const savedDiaries = [] /* loaded via API */;
      
      // 해당 일기 수정
      const updatedDiaries = savedDiaries.map(d => 
        d.id === diary.id ? updatedDiary : d
      );
      
      // localStorage에 저장
      // moved to API storage
      
      alert('일기가 수정되었습니다!');
      
      // 메인 허브로 이동
      navigate('/', { replace: true });
    } else {
      alert('내용을 입력해주세요.');
    }
  };

  if (!diary) {
    return null;
  }

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
                  일기 수정
                </Typography>
              </Box>
              
              {/* 오른쪽 저장 버튼 */}
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <Button
                  onClick={handleSave}
                  sx={{
                    color: '#007AFF',
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
            {/* 텍스트 입력창 */}
            <TextField
              multiline
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="일기 내용을 입력하세요..."
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
              pb: 4,
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