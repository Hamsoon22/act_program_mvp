import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, TextField, Button
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function DiaryEdit() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [error, setError] = useState('');
  const [diaryId, setDiaryId] = useState(null);
  const [diaryDate, setDiaryDate] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();

  const backgroundOptions = [
    { name: '기본', color: '#ffffff' },
    { name: '미색', color: '#FFF8E7' },
    { name: '연두', color: '#F0F8F0' },
    { name: '하늘', color: '#E8F4FD' },
    { name: '라벤더', color: '#F3E8FF' },
    { name: '복숭아', color: '#FFF0F0' },
  ];

  // 기존 일기 정보 세팅
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // DiaryList에서 넘긴 경우
    const diary = location.state?.diary;
    if (diary) {
      setDiaryText(diary.diaryContent || diary.content || '');
      setBackgroundColor(diary.backgroundColor || '#ffffff');
      setDiaryId(diary.id);
      setDiaryDate(diary.diaryDate || diary.date || '');
      return;
    }

    // 새로고침 등으로 직접 진입한 경우
    if (paramId) {
      api.getDiary(paramId).then((data) => {
        setDiaryText(data.diaryContent || '');
        setBackgroundColor(data.backgroundColor || '#ffffff');
        setDiaryId(data.id);
        setDiaryDate(data.diaryDate || '');
      }).catch(() => navigate('/diary-list'));
    }
  }, [location.state, paramId, navigate]);

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
      navigate('/diary-list', { replace: true });
    }, 300);
  };

  // 저장 (수정)
  const handleSave = async () => {
    setError('');
    if (!diaryText.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    try {
      await api.updateDiary(diaryId, {
        diaryDate, // 기존 날짜 그대로 사용
        diaryTitle: '', // 필요 없으면 빈값
        diaryContent: diaryText.trim(),
        // backgroundColor, // 컬럼 있으면 추가!
      });
      alert('일기가 수정되었습니다!');
      navigate('/diary-list');
    } catch (e) {
      setError('수정 실패: ' + (e.message || ''));
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
                  일기 수정
                </Typography>
              </Box>
              
              {/* 오른쪽 저장 버튼 */}
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
              placeholder="내용을 수정하세요"
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