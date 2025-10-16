import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Box, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CSSTransition } from 'react-transition-group';
import html2canvas from 'html2canvas';
import backIcon from './back.svg';

// MBI 항목별 분류 (1-based indexing)
const emotionalExhaustionItems = [1, 2, 3, 6, 8, 13, 14, 16];
const depersonalizationItems = [5, 10, 11, 15];
const personalAccomplishmentItems = [4, 7, 9, 12];

// T점수 계산을 위한 평균과 표준편차
const T_SCORE_PARAMS = {
  emotionalExhaustion: { mean: 30.0, sd: 13.0 },
  depersonalization: { mean: 12.0, sd: 8.0 },
  personalAccomplishment: { mean: 34.0, sd: 8.5 }
};

function calcSum(indices, responses) {
  return indices.reduce((sum, i) => sum + (responses[i - 1] || 0), 0);
}

function calcMean(indices, responses) {
  const sum = calcSum(indices, responses);
  return sum / indices.length;
}

function calcT(sum, mean, sd) {
  return Math.round(50 + 10 * ((sum - mean) / sd));
}

// MBI용 평균/T점수 애니메이션 컴포넌트
function AnimatedScoreCombo({ targetAvg, targetTScore, delay = 0 }) {
  const [displayAvg, setDisplayAvg] = useState(0);
  const [displayTScore, setDisplayTScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800;
      const steps = 50;
      const avgIncrement = targetAvg / steps;
      const tScoreIncrement = targetTScore / steps;
      let currentStep = 0;
      
      const counter = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayAvg(avgIncrement * currentStep);
          setDisplayTScore(tScoreIncrement * currentStep);
        } else {
          setDisplayAvg(targetAvg);
          setDisplayTScore(targetTScore);
          clearInterval(counter);
        }
      }, duration / steps);
      
      return () => clearInterval(counter);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [targetAvg, targetTScore, delay]);
  
  return `${displayAvg.toFixed(2)} / ${displayTScore.toFixed(1)}`;
}

export default function MBIResultPage() {
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

  // MBI 계산
  const emotionalExhaustionSum = calcSum(emotionalExhaustionItems, responses);
  const depersonalizationSum = calcSum(depersonalizationItems, responses);
  const personalAccomplishmentSum = calcSum(personalAccomplishmentItems, responses);

  // 평균 계산
  const emotionalExhaustionAvg = calcMean(emotionalExhaustionItems, responses);
  const depersonalizationAvg = calcMean(depersonalizationItems, responses);
  const personalAccomplishmentAvg = calcMean(personalAccomplishmentItems, responses);

  // T점수 계산
  const emotionalExhaustionTScore = calcT(emotionalExhaustionSum, T_SCORE_PARAMS.emotionalExhaustion.mean, T_SCORE_PARAMS.emotionalExhaustion.sd);
  const depersonalizationTScore = calcT(depersonalizationSum, T_SCORE_PARAMS.depersonalization.mean, T_SCORE_PARAMS.depersonalization.sd);
  const personalAccomplishmentTScore = calcT(personalAccomplishmentSum, T_SCORE_PARAMS.personalAccomplishment.mean, T_SCORE_PARAMS.personalAccomplishment.sd);

  // 소진 수준 판단
  const getLevel = (tScore) => tScore >= 60 ? { level: 'High', color: '#F44336' } :
                               tScore >= 40 ? { level: 'Average', color: '#FF9800' } :
                               { level: 'Low', color: '#4CAF50' };

  const eeLevel = getLevel(emotionalExhaustionTScore);
  const dpLevel = getLevel(depersonalizationTScore);
  // Personal Accomplishment은 반대로 해석 (높을수록 좋음)
  const paLevel = personalAccomplishmentTScore >= 60 ? { level: 'High', color: '#4CAF50' } :
                  personalAccomplishmentTScore >= 40 ? { level: 'Average', color: '#FF9800' } :
                                                       { level: 'Low', color: '#F44336' };

  // 이미지 다운로드 함수
  const downloadImage = async () => {
    if (contentRef.current) {
      try {
        const canvas = await html2canvas(contentRef.current, {
          backgroundColor: 'white',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `MBI_결과_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '_')}.png`;
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
    }, 250);
  };

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
              MBI
            </Typography>
          </Box>
          
          {/* 오른쪽 공간 (균형 맞추기) */}
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ py: 2, pb: 8 }} ref={contentRef}>
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
          MBI 결과
        </Typography>
        
        {/* 구분선 */}
        <Box sx={{ 
          height: '1px', 
          backgroundColor: '#e0e0e0', 
          mb: 4, 
          mt: 2 
        }} />

        {/* MBI 3개 하위척도 결과 */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '45vh'
        }}>
          {/* 소진 (Emotional Exhaustion) */}
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 'bold', fontSize: '1.2rem' }}>
              소진
            </Typography>
            <Box sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: 3,
              p: 2,
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h4" sx={{ 
                color: '#000000', 
                fontWeight: 'bold',
                fontSize: '1.6rem',
                mb: 0.5
              }}>
                <AnimatedScoreCombo targetAvg={emotionalExhaustionAvg} targetTScore={emotionalExhaustionTScore} delay={0} />
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                평균 / T점수
              </Typography>
            </Box>
          </Box>

          {/* 냉소 (Cynicism) */}
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 'bold', fontSize: '1.2rem' }}>
              냉소
            </Typography>
            <Box sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: 3,
              p: 2,
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h4" sx={{ 
                color: '#000000', 
                fontWeight: 'bold',
                fontSize: '1.6rem',
                mb: 0.5
              }}>
                <AnimatedScoreCombo targetAvg={depersonalizationAvg} targetTScore={depersonalizationTScore} delay={150} />
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                평균 / T점수
              </Typography>
            </Box>
          </Box>

          {/* 효능감 (Personal Accomplishment) */}
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 'bold', fontSize: '1.2rem' }}>
              효능감
            </Typography>
            <Box sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: 3,
              p: 2,
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h4" sx={{ 
                color: '#000000', 
                fontWeight: 'bold',
                fontSize: '1.6rem',
                mb: 0.5
              }}>
                <AnimatedScoreCombo targetAvg={personalAccomplishmentAvg} targetTScore={personalAccomplishmentTScore} delay={300} />
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                평균 / T점수
              </Typography>
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