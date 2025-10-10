import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, Button, Card, CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

export default function DiaryList() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [diaries, setDiaries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트 마운트 후 즉시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // localStorage에서 일기 목록 가져오기
    const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
    setDiaries(savedDiaries);
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

  const handleDiaryClick = (diary) => {
    navigate('/diary-view', { state: { diary } });
  };

  const handleNewDiary = () => {
    navigate('/diary');
  };

  const formatPreview = (content) => {
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
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
            backgroundColor: 'white',
            position: 'relative',
            transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          {/* 앱바 */}
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : 'none',
              transition: 'border-bottom 0.3s ease',
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
              
              {/* 오른쪽 빈 공간 */}
              <Box sx={{ width: 48 }} />
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ py: 2, pb: 4 }}>
          

            {diaries.length === 0 ? (
              // 일기가 없을 때 표시
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {/* 경고 아이콘 */}
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    backgroundColor: '#e0e0e0', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <Typography sx={{ 
                      fontSize: '48px', 
                      color: '#666',
                      fontWeight: 'bold'
                    }}>
                      !
                    </Typography>
                  </Box>
                  
                  {/* 메시지 */}
                  <Typography variant="body1" sx={{ 
                    color: '#999',
                    fontSize: '16px',
                    fontWeight: 'medium'
                  }}>
                    ... 일기 내역이 없습니다 ...
                  </Typography>
                </Box>
              </Box>
            ) : (
              // 일기 목록 표시
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {diaries.map((diary) => (
                  <Box
                    key={diary.id}
                    sx={{
                      backgroundColor: diary.backgroundColor,
                      borderRadius: '16px',
                      p: 3,
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* 일기 내용 */}
                    <Box
                      onClick={() => handleDiaryClick(diary)}
                      sx={{
                        cursor: 'pointer',
                        mb: 2
                      }}
                    >
                      <Typography variant="body1" sx={{ 
                        color: '#333',
                        lineHeight: 1.6,
                        fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
                        fontSize: '16px'
                      }}>
                        {formatPreview(diary.content)}
                      </Typography>
                    </Box>

                    {/* 하단 정보와 버튼들 */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        {diary.date}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/diary-edit', { state: { diary } });
                          }}
                          sx={{
                            color: '#666',
                            fontSize: '14px',
                            textTransform: 'none',
                            minWidth: 'auto',
                            p: 0.5
                          }}
                        >
                          수정
                        </Button>
                        <Typography sx={{ color: '#ddd' }}>|</Typography>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
                              const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
                              const updatedDiaries = savedDiaries.filter(d => d.id !== diary.id);
                              localStorage.setItem('diaries', JSON.stringify(updatedDiaries));
                              setDiaries(updatedDiaries);
                              alert('일기가 삭제되었습니다.');
                            }
                          }}
                          sx={{
                            color: '#ff6b6b',
                            fontSize: '14px',
                            textTransform: 'none',
                            minWidth: 'auto',
                            p: 0.5
                          }}
                        >
                          삭제
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </CSSTransition>

      {/* 하단 고정 CTA 버튼 - 항상 표시 */}
      <Box sx={{ 
        position: 'fixed !important', 
        bottom: '4%', 
        left: '5%', 
        right: '5%', 
        display: 'flex',
        justifyContent: 'center',
        p: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        zIndex: 99999,
        transform: 'translateZ(0)',
        pointerEvents: 'auto'
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNewDiary}
          sx={{ 
            width: '100%',
            height: '3.625rem',
            flexShrink: 0,
            backgroundColor: '#1B1F27',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: 50,
            boxShadow: '0 4px 12px rgba(27, 31, 39, 0.3)',
            '&:hover': {
              backgroundColor: '#2A2F38',
              boxShadow: '0 6px 16px rgba(27, 31, 39, 0.4)',
            },
            textTransform: 'none'
          }}
        >
          일기 쓰기
        </Button>
      </Box>
    </>
  );
}