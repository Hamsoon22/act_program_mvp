import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Radio, RadioGroup, FormControlLabel,
  FormControl, Button, Box, AppBar, Toolbar, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

const questions = [
  "내가 얼마나 외로운지에 대해 생각한다.",
  "“이런 기분에서 빠져 나오지 못하면 일을 하지 못할 거야.”라고 생각한다.",
  "내가 얼마나 피로하고 아픈지에 대해 생각한다.",
  "집중하는 것이 얼마나 어려운지에 대해 생각한다.",
  "“내가 무슨 일을 했기에 이런 일을 당할까?”라고 생각한다.",
  "내가 얼마나 수동적이고 의욕이 없는지에 대해 생각한다.",
  "내가 왜 우울해졌는지 알아내기 위해 최근 사건들을 분석해 본다.",
  "이제 더 이상 아무 것도 느낄 수 없을 것만 같다고 생각한다.",
  "“왜 나는 꿋꿋하게 지내지 못할까?”하고 생각한다.",
  "“왜 나는 항상 이런 식으로 반응할까?”라고 생각한다.",
  "혼자 조용히 왜 내가 이렇게 느끼는지에 대해 생각한다.",
  "내가 생각하고 있는 것을 글로 쓰고 분석해 본다.",
  "최근의 상황이 더 나았으면 좋았을 걸 하고 생각한다.",
  "“계속 이런 식으로 느끼다가는 집중하는 게 힘들거야.” 라고 생각한다.",
  "“나는 왜 다른 사람들에게는 없는 문제가 있을까?”라고 생각한다.",
  "“왜 나는 더 잘 대처하지 못할까?”라고 생각한다.",
  "내가 얼마나 슬픈지에 대해 생각한다.",
  "나의 단점과 실패들, 잘못, 실수에 대해 생각한다.",
  "아무 것도 할 기분이 안 든다는 생각을 한다.",
  "내가 왜 우울해졌는지 이해하려고 나의 성격을 분석해 본다.",
  "혼자 어디론가 가서 내 기분에 대해 생각한다.",
  "내가 스스로에게 얼마나 화가 났는지에 대해 생각한다.",
];

export default function RuminationSurvey() {
  const [responses, setResponses] = useState(Array(22).fill(null));
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트 마운트 후 즉시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // 10ms 지연으로 애니메이션 트리거
    
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
      }, 300); // 300ms로 조금 더 지연
    }
  };

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(-1);
    }, 250); // CSSTransition 시간에 맞춤
  };

  const handleSubmit = () => {
    const encoded = encodeURIComponent(JSON.stringify(responses));
    navigate(`/result?data=${encoded}`);
  };

  const ScaleItem = ({ value, checked, onChange }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      flex: '1 1 0',
      minWidth: 0,
      maxWidth: '25%'
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
            fontSize: { xs: 28, sm: 32, md: 36 },
          },
          '& .MuiRadio-root': {
            '&:before': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '8px solid',
              borderColor: checked ? '#1B1F27' : '#e0e0e0',
              backgroundColor: 'white',
            }
          },
          padding: { xs: '6px', sm: '8px', md: '10px' },
        }}
        icon={
          <Box
            sx={{
              width: { xs: 14, sm: 16, md: 18 },
              height: { xs: 14, sm: 16, md: 18 },
              borderRadius: '50%',
              border: '12px solid #e0e0e0',
              backgroundColor: 'white',
            }}
          />
        }
        checkedIcon={
          <Box
            sx={{
              width: { xs: 14, sm: 16, md: 18 },
              height: { xs: 14, sm: 16, md: 18 },
              borderRadius: '50%',
              border: '12px solid #1B1F27',
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
          fontSize: { xs: '16px', sm: '18px', md: '20px' }
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
              Rumination Scale
            </Typography>
          </Box>
          
          {/* 오른쪽 공간 (균형 맞추기) */}
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ py: 0, pb: 10, pt: 0, mt: 0 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg,rgba(223, 239, 246, 1) 0%, rgba(223, 239, 246, 1) 38%, rgba(246, 223, 236, 1) 90%)',
          px: 3,
          pt: 11, // 헤더가 고정되지 않으므로 패딩 줄임
          pb: 5, 
          mb: 4,
          mx: -3,
          mt: -10, // 상단 여백 제거
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}>
          <Typography variant="body2" sx={{ fontSize: '22px', color: '#000000ff', mb: 1, fontWeight: 'bold', mt: 0 }}>
            나는 우울할 때... 
          </Typography>
          <Typography variant="body2" sx={{ color: '#282828ff', mb: 0, fontWeight: 'regular', mt: 0 }}>
            사람들은 우울할 때 여러 가지 생각과 행동을 하게 됩니다.<br /> 아래 문항들을 읽고 우울할 때 <br />이러한 생각이나 행동을 어느 정도 하는지 선택해 주세요.
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
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium', fontSize: '14px' }}>
                    거의 전혀 아니다
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium', fontSize: '14px' }}>
                    거의 언제나 그렇다
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
                    maxWidth: '350px',
                    margin: '0 auto',
                    gap: { xs: 0.2, sm: 0.5, md: 1 }
                  }}
                >
                  {[1, 2, 3, 4].map((value) => (
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