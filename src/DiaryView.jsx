import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, Button, Menu, MenuItem
} from '@mui/material';
import { MoreVert, Delete, Edit, Download } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

export default function DiaryView() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const diaryContentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 샘플 일기 데이터
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
    backgroundColor: '#FFF8E7',
    isSample: true
  };
  
  const diary = location.state?.diary || sampleDiary;

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

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate('/diary-edit', { state: { diary } });
  };

    const handleDelete = () => {
    handleMenuClose();
    
    if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      // localStorage에서 일기 삭제
      const savedDiaries = JSON.parse(localStorage.getItem('diaries') || '[]');
      const updatedDiaries = savedDiaries.filter(d => d.id !== diary.id);
      localStorage.setItem('diaries', JSON.stringify(updatedDiaries));
      
      // 일기 목록으로 돌아가기
      navigate('/diary-list', { replace: true });
    }
  };

  // 일기를 이미지로 저장하는 함수 (Canvas API 사용)
  const handleSaveAsImage = async () => {
    if (!diaryContentRef.current) return;
    
    try {
      const element = diaryContentRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 캔버스 크기 설정 (스크롤 높이 포함)
      const scale = 2; // 고화질을 위해 2배 스케일
      const elementWidth = 400; // 고정 너비
      const padding = 40; // 좌우 패딩
      
      // 텍스트 내용과 크기 계산
      ctx.font = '18px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
      const lines = diary.content.split('\n');
      const lineHeight = 32;
      
      // 전체 높이 계산
      let totalHeight = 120; // 상단 여백 + 날짜 + 제목
      
      lines.forEach(line => {
        if (line.trim() === '') {
          totalHeight += lineHeight / 2;
        } else {
          // 긴 줄 자동 줄바꿈 계산
          const words = line.split(' ');
          let currentLine = '';
          let lineCount = 0;
          
          words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > elementWidth - padding && currentLine !== '') {
              lineCount++;
              currentLine = word + ' ';
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine.trim() !== '') {
            lineCount++;
          }
          
          totalHeight += lineCount * lineHeight;
        }
      });
      
      totalHeight += 60; // 하단 여백
      
      // 캔버스 크기 설정
      canvas.width = elementWidth * scale;
      canvas.height = totalHeight * scale;
      ctx.scale(scale, scale);
      
      // 배경색 설정
      ctx.fillStyle = diary.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, elementWidth, totalHeight);
      
      let yPosition = 40;
      
      // 날짜 그리기
      ctx.fillStyle = '#666';
      ctx.font = '14px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
      ctx.fillText(`${diary.date} ${diary.time || ''}`, 20, yPosition);
      yPosition += 40;
      
      // 제목 그리기
      ctx.fillStyle = '#333';
      ctx.font = 'bold 22px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
      const titleText = diary.title + (diary.isSample ? ' (샘플)' : '');
      ctx.fillText(titleText, 20, yPosition);
      yPosition += 50;
      
      // 내용 그리기 (줄바꿈 처리)
      ctx.fillStyle = '#333';
      ctx.font = '18px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
      
      lines.forEach(line => {
        if (line.trim() === '') {
          yPosition += lineHeight / 2;
        } else {
          // 긴 줄 자동 줄바꿈
          const words = line.split(' ');
          let currentLine = '';
          
          words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > elementWidth - padding && currentLine !== '') {
              ctx.fillText(currentLine, 20, yPosition);
              currentLine = word + ' ';
              yPosition += lineHeight;
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine.trim() !== '') {
            ctx.fillText(currentLine, 20, yPosition);
            yPosition += lineHeight;
          }
        }
      });
      
      // 이미지 다운로드
      const link = document.createElement('a');
      link.download = `${diary.title || '일기'}_${diary.date || new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
    } catch (error) {
      console.error('이미지 저장 중 오류:', error);
      alert('이미지 저장 중 오류가 발생했습니다.');
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
            backgroundColor: diary.backgroundColor,
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
                  일기 보기
                </Typography>
              </Box>
              
              {/* 오른쪽 메뉴 버튼 - 샘플이 아닐 때만 표시 */}
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                {!diary.isSample && (
                  <IconButton
                    onClick={handleMenuClick}
                    sx={{
                      color: '#1B1F27',
                      p: 1
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          <Container ref={diaryContentRef} maxWidth="sm" sx={{ 
            py: 2, 
            px: 3,
            backgroundColor: diary.backgroundColor || '#ffffff',
            minHeight: 'calc(100vh - 120px)',
            borderRadius: '0 0 20px 20px'
          }}>
            {/* 일기 날짜 */}
            <Typography variant="body2" sx={{ 
              color: '#666',
              mb: 2,
              fontSize: '14px',
              textAlign: 'left'
            }}>
              {diary.date} {diary.time}
            </Typography>

            {/* 일기 제목 */}
            <Typography variant="h5" sx={{ 
              color: '#333',
              fontWeight: 'bold',
              mb: 3,
              fontSize: '22px',
              fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
            }}>
              {diary.title}
              {diary.isSample && (
                <Typography component="span" sx={{ 
                  color: '#999', 
                  fontSize: '16px', 
                  fontWeight: 'normal',
                  ml: 1 
                }}>
                  (샘플)
                </Typography>
              )}
            </Typography>

            {/* 일기 내용 */}
            <Typography variant="body1" sx={{ 
              color: '#333',
              lineHeight: 1.8,
              fontSize: '18px',
              fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
              whiteSpace: 'pre-wrap',
              mb: 10 // 하단 고정 버튼을 위한 여백
            }}>
              {diary.content}
            </Typography>
          </Container>
        </Box>
      </CSSTransition>

      {/* 하단 고정 이미지 저장 버튼 */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        pt: 2,
        pb: 3,
        px: 3,
        zIndex: 1000
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          maxWidth: 'sm',
          mx: 'auto'
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Download />}
            onClick={handleSaveAsImage}
            sx={{
              width: '100%',
              height: '56px',
              backgroundColor: '#1B1F27',
              color: 'white',
              borderRadius: '28px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#2A2F38'
              }
            }}
          >
            이미지로 저장
          </Button>
        </Box>
      </Box>

      {/* 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 120,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1, color: '#333' }} />
          수정
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: '#d32f2f' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </>
  );
}