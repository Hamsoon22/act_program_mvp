import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function DiaryList() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [diaries, setDiaries] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // helper: pick a color from any possible server/local field names
  const normalizeColor = (d) => {
    return d?.colorCode ?? d?.backgroundColor ?? d?.color ?? '#ffffff';
  };

  // 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 일기 목록 불러오기 (서버 또는 localStorage)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 서버에서 일기 목록 불러오기
      api.listDiaries().then((data) => {
        console.log('listDiaries raw:', data);
        const diariesFromServer = (Array.isArray(data) ? data : []).map(diary => {
          const bg = normalizeColor(diary);
          return {
            id: diary.id,
            title: diary.diaryTitle || '',
            content: diary.diaryContent || '',
            date: diary.diaryDate || '',
            time: diary.diaryTime || '',
            // normalized for UI
            backgroundColor: bg,
            // preserve original server colorCode if any (useful when updating)
            colorCode: diary.colorCode ?? null,
            isSample: false,
            raw: diary
          };
        });
        console.log('mapped diariesFromServer:', diariesFromServer);
        setDiaries(diariesFromServer);
      }).catch((e) => {
        setError('목록 불러오기 실패: ' + (e.message || ''));
        setDiaries([]);
      });
    } else {
      // 로그인 안한 경우 localStorage에서
      const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
      // normalize saved local diaries so backgroundColor always exists
      const normalizedLocal = savedDiaries.map(d => ({
        ...d,
        backgroundColor: normalizeColor(d),
        colorCode: d.colorCode ?? d.backgroundColor ?? null
      }));
      // 샘플 일기 추가
      const sampleDiary = {
        id: 'sample',
        title: '샘플 일기',
        content: `오늘은 정말 좋은 하루였다. ...`,
        date: '2024년 1월 1일',
        time: '오후 6:30',
        backgroundColor: '#FFF8E7',
        colorCode: '#FFF8E7',
        isSample: true
      };
      const hasSample = normalizedLocal.some(diary => diary.isSample);
      const finalList = hasSample ? normalizedLocal : [sampleDiary, ...normalizedLocal];
      console.log('local diaries normalized:', finalList);
      setDiaries(finalList);
    }
  }, []);

  // 스크롤 이벤트
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
    // ensure the object passed to view has backgroundColor and colorCode
    const payload = {
      ...diary,
      backgroundColor: diary.backgroundColor ?? diary.colorCode ?? '#ffffff',
      colorCode: diary.colorCode ?? diary.backgroundColor ?? null
    };
    navigate('/diary-view', { state: { diary: payload } });
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
                  일기 쓰기
                </Typography>
              </Box>

              <Box sx={{ width: 48 }} />
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ py: 2, pb: 4 }}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {diaries.length === 0 ? (
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
                              if (localStorage.getItem('accessToken')) {
                                api.deleteDiary(diary.id)
                                  .then(() => {
                                    setDiaries((prev) => prev.filter(d => d.id !== diary.id));
                                    alert('일기가 삭제되었습니다.');
                                  })
                                  .catch((e) => {
                                    alert('삭제 실패: ' + (e.message || ''));
                                  });
                              } else {
                                const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
                                const updatedDiaries = savedDiaries.filter(d => d.id !== diary.id);
                                localStorage.setItem('diaries', JSON.stringify(updatedDiaries));
                                setDiaries(updatedDiaries);
                                alert('일기가 삭제되었습니다.');
                              }
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