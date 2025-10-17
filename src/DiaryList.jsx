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
        // 서버 데이터 구조에 맞게 변환
        const diariesFromServer = (Array.isArray(data) ? data : []).map(diary => ({
          id: diary.id,
          title: diary.diaryTitle || '',
          content: diary.diaryContent || '',
          date: diary.diaryDate || '',
          time: '', // 필요시 서버에서 제공받으면 넣기
          backgroundColor: diary.backgroundColor || '#ffffff', // 컬럼 있으면
          isSample: false
        }));
        setDiaries(diariesFromServer);
      }).catch((e) => {
        setError('목록 불러오기 실패: ' + (e.message || ''));
        setDiaries([]);
      });
    } else {
      // 로그인 안한 경우 localStorage에서
      const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
      // 샘플 일기 추가
      const sampleDiary = {
        id: 'sample',
        title: '샘플 일기',
        content: `오늘은 정말 좋은 하루였다. 아침에 일어나서 창밖을 보니 햇살이 너무 따뜻했다.

점심에는 친구들과 함께 맛있는 음식을 먹었고, 오후에는 공원을 산책했다. 저녁에는 가족들과 함께 영화를 보며 즐거운 시간을 보냈다.

내일도 이런 좋은 하루가 되었으면 좋겠다.

오늘 하루를 돌아보면서 느낀 것은, 작은 일상의 소중함이다. 평범해 보이는 순간들이 모여서 행복한 하루를 만든다는 것을 깨달았다.

아침에 마신 따뜻한 커피 한 잔, 길에서 만난 고양이의 귀여운 모습, 친구와 나눈 즐거운 대화, 가족과 함께 보낸 편안한 시간 등 모든 것이 소중한 추억이 되었다.

이런 일상의 소중함을 잊지 않고 살아가야겠다고 다짐했다. 매일매일이 특별한 의미를 가질 수 있도록 더욱 감사하는 마음으로 살아가야겠다.

내일은 또 어떤 새로운 일들이 기다리고 있을까? 기대가 된다.

오늘도 감사한 하루였다. 이런 평범하지만 소중한 일상이 계속되었으면 좋겠다.

끝으로, 이 일기를 읽는 미래의 나에게 하고 싶은 말은, 항상 지금의 감사한 마음을 잊지 말라는 것이다. 어떤 어려움이 와도 이런 작은 행복들을 기억하며 힘내길 바란다.`,
        date: '2024년 1월 1일',
        time: '오후 6:30',
        backgroundColor: '#FFF8E7',
        isSample: true
      };
      const hasample = savedDiaries.some(diary => diary.isSample);
      if (!hasample) {
        setDiaries([sampleDiary, ...savedDiaries]);
      } else {
        setDiaries(savedDiaries);
      }
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
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
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
                              if (localStorage.getItem('accessToken')) {
                                // 서버 삭제 구현 필요 (api.deleteDiary)
                                api.deleteDiary(diary.id)
                                  .then(() => {
                                    setDiaries((prev) => prev.filter(d => d.id !== diary.id));
                                    alert('일기가 삭제되었습니다.');
                                  })
                                  .catch((e) => {
                                    alert('삭제 실패: ' + (e.message || ''));
                                  });
                              } else {
                                // localStorage에서 삭제
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