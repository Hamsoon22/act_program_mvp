import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Radio, RadioGroup, FormControlLabel,
  FormControl, Button, Box, AppBar, Toolbar, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

const questions = [
  "맡은 일을 하는 데 있어서 정서적으로 고갈된 느낌이 든다.",
  "일을 마치고 퇴근할 때쯤이면 기진맥진한 느낌이 든다.",
  "아침에 일어나서 다시 출근할 생각을 하면 피곤한 느낌이 든다.",
  "하루 종일 일하는 것은 나를 긴장시킨다.",
  "나는 직무상 발생하는 문제들을 효과적으로 해결한다.",
  "일 때문에 소진된 상태이다.",
  "직장에 효과적인 기여를 하고 있다고 느낀다.",
  "이 일을 시작한 이후로 내 일에 대한 관심이 줄었다.",
  "맡은 일을 하는데 있어서 소극적이 되었다.",
  "내가 생각할 때, 나는 일을 잘한다.",
  "직무상 무언가를 성취했을 때 기쁨을 느낀다.",
  "나는 현재의 직무에서 가치 있는 많은 것을 이루어왔다.",
  "나는 방해받지 않고 내 일을 수행하기 원할 뿐이다.",
  "내 일이 무언가에 기여하든 말든 나는 점점 더 냉소적이 되었다.",
  "내 일의 중요성이 의심스럽다.",
  "나는 일을 효과적으로 처리하고 있다는 자신감이 있다."
];

export default function MBISurvey() {
  const [responses, setResponses] = useState(Array(16).fill(null));
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트 마운트 후 즉시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (index, value) => {
    const updated = [...responses];
    updated[index] = parseInt(value);
    setResponses(updated);
    
    // 다음 질문으로 스크롤 (마지막 질문이 아닌 경우)
    if (index < questions.length - 1) {
      setTimeout(() => {
        const nextQuestionElement = document.getElementById(`question-${index + 1}`);
        if (nextQuestionElement) {
          nextQuestionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
    }
  };

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/');
    }, 250); // CSSTransition 시간에 맞춤
  };

  const handleSubmit = () => {
    const encoded = encodeURIComponent(JSON.stringify(responses));
    navigate(`/mbi-result?data=${encoded}`);
  };

  const ScaleItem = ({ value, checked, onChange }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      flex: '1 1 0',
      minWidth: 0,
      maxWidth: '14.28%' // 7개 버튼이므로 100/7
    }}>
      <Radio
        checked={checked}
        onChange={onChange}
        value={value}
        sx={{
          color: '#e0e0e0',
          '&.Mui-checked': {
            color: '#1B1F27',
          },
          '& .MuiSvgIcon-root': {
            fontSize: { xs: 24, sm: 28, md: 32 },
          },
          padding: { xs: '4px', sm: '6px', md: '8px' },
        }}
        icon={
          <Box
            sx={{
              width: { xs: 12, sm: 14, md: 16 },
              height: { xs: 12, sm: 14, md: 16 },
              borderRadius: '50%',
              border: '10px solid #e0e0e0',
              backgroundColor: 'white',
            }}
          />
        }
        checkedIcon={
          <Box
            sx={{
              width: { xs: 12, sm: 14, md: 16 },
              height: { xs: 12, sm: 14, md: 16 },
              borderRadius: '50%',
              border: '10px solid #1B1F27',
              backgroundColor: 'white',
            }}
          />
        }
      />
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 0.5, 
          fontWeight: 'bold', 
          color: checked ? '#1B1F27' : '#999', 
          fontSize: { xs: '12px', sm: '14px', md: '16px' }
        }}
      >
        {value}
      </Typography>
    </Box>
  );

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
          backgroundColor: scrolled ? 'white' : 'transparent',
          boxShadow: scrolled ? 2 : 0,
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
      
      <Container maxWidth="md" sx={{ py: 0, pb: 10, pt: 0, mt: 0 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #ffefdfff 90%)',
          px: 3,
          pt: 11,
          pb: 5, 
          mb: 4,
          mx: -3,
          mt: -10,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}>
          <Typography variant="body2" sx={{ fontSize: '22px', color: '#000000ff', mb: 1, fontWeight: 'bold', mt: 0 }}>
            MBI
          </Typography>
          <Typography variant="body2" sx={{ color: '#282828ff', mb: 0, fontWeight: 'regular', mt: 0 }}>
            직장에서 느끼는 감정과 경험에 대한 문항입니다.<br /> 각 문항을 읽고 얼마나 자주<br />그런 감정이나 생각을 경험하는지 선택해주세요.<br /><br />
            <strong>척도 안내:</strong><br />
            0: 전혀 없다, 1: 1년에 2-3회 또는 그 미만<br />
            2: 한 달에 한 번 또는 그 미만, 3: 한 달에 2-3회<br />
            4: 일주일에 1회 정도, 5: 일주일에 2-3회, 6: 매일
          </Typography>
        </Box>
        
        {questions.map((question, index) => (
          <Box key={index} id={`question-${index}`} sx={{ my: 4, py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', lineHeight: 1.6 }}>
              Q{index + 1}. {question}
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '600px' }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium', fontSize: '12px' }}>
                    전혀 없다
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium', fontSize: '12px' }}>
                    매일
                  </Typography>
                </Box>
                
                <RadioGroup
                  row
                  value={responses[index] || ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '500px',
                    margin: '0 auto',
                    gap: { xs: 0.1, sm: 0.2, md: 0.3 }
                  }}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                    <ScaleItem
                      key={value}
                      value={value}
                      checked={responses[index] === value}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  ))}
                </RadioGroup>
              </Box>
            </FormControl>
          </Box>
        ))}
      </Container>
    </Box>
      </CSSTransition>

      {/* 고정된 하단 버튼 - CSSTransition 바깥에 위치 */}
      <Box sx={{ 
        position: 'fixed !important', 
        bottom: '4%', 
        left: '5%', 
        right: '5%', 
        display: 'flex',
        justifyContent: 'center',
        p: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        zIndex: 9999,
        transform: 'translateZ(0)'
      }}>
        <Button
          variant="contained"
          size="large"
          disabled={responses.includes(null)}
          onClick={handleSubmit}
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
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          결과 보기
        </Button>
      </Box>
    </>
  );
}