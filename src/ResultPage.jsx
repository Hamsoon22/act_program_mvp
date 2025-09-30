import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Button, Grid, Box, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CSSTransition } from 'react-transition-group';
import html2canvas from 'html2canvas';
import backIcon from './back.svg';

const depressiveItems = [1,2,3,5,6,8,9,17,19];
const reflectiveItems = [7,11,12,20,21,22];
const broodingItems = [4,10,13,14,15,16,18];

const T_SCORE_PARAMS = {
  total: { mean: 40.73, sd: 13.85 },
  depressive: { mean: 16.25, sd: 5.69 },
  reflective: { mean: 10.38, sd: 4.11 },
  brooding: { mean: 14.13, sd: 5.19 },
};

function calcSum(indices, responses) {
  return indices.reduce((sum, i) => sum + (responses[i - 1] || 0), 0);
}

function calcT(sum, mean, sd) {
  return Math.round(50 + 10 * ((sum - mean) / sd));
}

// 애니메이션 카운터 컴포넌트
function AnimatedScore({ targetScore, delay = 0 }) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800; // 0.8초로 단축
      const steps = 50; // 단계도 줄여서 더 빠르게
      const increment = targetScore / steps;
      let currentStep = 0;
      
      const counter = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayScore((increment * currentStep).toFixed(1));
        } else {
          setDisplayScore(targetScore.toFixed(1));
          clearInterval(counter);
        }
      }, duration / steps);
      
      return () => clearInterval(counter);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [targetScore, delay]);
  
  return displayScore;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const raw = searchParams.get("data");

  useEffect(() => {
    // 컴포넌트 마운트 후 즉시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  if (!raw) return <Typography>결과 데이터를 찾을 수 없습니다.</Typography>;

  const responses = JSON.parse(decodeURIComponent(raw));

  // 이미지 다운로드 함수
  const downloadImage = async () => {
    if (contentRef.current) {
      try {
        const canvas = await html2canvas(contentRef.current, {
          backgroundColor: 'white',
          scale: 2, // 고화질을 위해 2배 스케일
          useCORS: true,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `Rumination_Scale_결과_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('이미지 다운로드 실패:', error);
      }
    }
  };

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 250); // CSSTransition 시간에 맞춤
  };

  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  const dep = calcSum(depressiveItems, responses);
  const ref = calcSum(reflectiveItems, responses);
  const bro = calcSum(broodingItems, responses);

  const tTotal = calcT(totalScore, T_SCORE_PARAMS.total.mean, T_SCORE_PARAMS.total.sd);
  const tDep = calcT(dep, T_SCORE_PARAMS.depressive.mean, T_SCORE_PARAMS.depressive.sd);
  const tRef = calcT(ref, T_SCORE_PARAMS.reflective.mean, T_SCORE_PARAMS.reflective.sd);
  const tBro = calcT(bro, T_SCORE_PARAMS.brooding.mean, T_SCORE_PARAMS.brooding.sd);

  return (
    <>
      <style>
        {`
          .page-container {
            transform: translateX(${isVisible ? '0' : '100%'});
            transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
            width: 100%;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
          }
          
          .slide-exit {
            transform: translateX(0);
          }
          .slide-exit-active {
            transform: translateX(100%);
            transition: transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}
      </style>
      <CSSTransition
        in={!isExiting}
        timeout={250}
        classNames="slide"
        unmountOnExit={false}
      >
        <Box className="page-container" sx={{ 
          margin: 0, 
          padding: 0,
          width: '100%',
          minHeight: '100vh'
        }}>
      {/* 헤더 */}
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'white',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          marginTop: 0,
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
              Rumination Scale
            </Typography>
          </Box>
          
          {/* 오른쪽 공간 (균형 맞추기) */}
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ py: 4, pb: 10 }} ref={contentRef}>
        {/* 날짜 */}
        <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '14px' }}>
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
        
        {/* 제목 */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Rumination Scale 결과
        </Typography>
        
        {/* 구분선 */}
        <Box sx={{ 
          height: '1px', 
          backgroundColor: '#e0e0e0', 
          mb: 4, 
          mt: 2 
        }} />
        
        {/* 점수 그리드 */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          {/* 첫 번째 줄: 반추적 반응, 우울형 반추 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%', maxWidth: '400px' }}>
            {/* 반추적 반응 */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.4rem' }}>
                반추적 반응
              </Typography>
              <Box sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 3,
                p: 3,
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h2" sx={{ 
                  color: '#000000ff', 
                  fontWeight: 'bold',
                  fontSize: '3rem'
                }}>
                  <AnimatedScore targetScore={tTotal} delay={0} />
                </Typography>
              </Box>
            </Box>
            
            {/* 우울형 반추 */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.4rem' }}>
                우울형 반추
              </Typography>
              <Box sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 3,
                p: 3,
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h2" sx={{ 
                  color: '#000000ff', 
                  fontWeight: 'bold',
                  fontSize: '3rem'
                }}>
                  <AnimatedScore targetScore={tDep} delay={150} />
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* 두 번째 줄: 숙고, 자책 */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: '400px' }}>
            {/* 숙고 */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.4rem' }}>
                숙고
              </Typography>
              <Box sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 3,
                p: 3,
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h2" sx={{ 
                  color: '#000000ff', 
                  fontWeight: 'bold',
                  fontSize: '3rem'
                }}>
                  <AnimatedScore targetScore={tRef} delay={300} />
                </Typography>
              </Box>
            </Box>
            
            {/* 자책 */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.4rem' }}>
                자책
              </Typography>
              <Box sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 3,
                p: 3,
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h2" sx={{ 
                  color: '#000000ff', 
                  fontWeight: 'bold',
                  fontSize: '3rem'
                }}>
                  <AnimatedScore targetScore={tBro} delay={450} />
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
      </CSSTransition>

      {/* 고정된 하단 버튼 - 독립적으로 고정 */}
      <Box sx={{ 
        position: 'fixed !important', 
        bottom: '4%', 
        left: '5%', 
        right: '5%', 
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        p: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        zIndex: 99999,
        transform: 'translateZ(0)',
        pointerEvents: 'auto'
      }}>
        <Button
          variant="outlined"
          size="large"
          onClick={downloadImage}
          sx={{ 
            width: '48%',
            height: '3.625rem',
            flexShrink: 0,
            backgroundColor: '#f5f5f5',
            color: '#1B1F27',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: 50,
            border: '1px solid #1B1F27',
            boxShadow: '0 4px 12px rgba(27, 31, 39, 0.1)',
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderColor: '#000000',
              boxShadow: '0 6px 16px rgba(27, 31, 39, 0.2)',
            }
          }}
        >
          이미지 저장
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/', { replace: true })}
          sx={{ 
            width: '48%',
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
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          다시 하기
        </Button>
      </Box>
    </>
  );
}
