import React, { useState, useRef, useEffect } from "react";
import {
  Container, Typography, Radio, RadioGroup, FormControlLabel,
  Button, Box, AppBar, Toolbar, IconButton, Paper
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const questions = [
  "태어난 가족 (부모님, 형제 등)",
  "친밀한 관계 (부부, 연인, 배우자 등)",
  "양육하기·돌보기·부모되기",
  "친구관계,사회생활",
  "일·직업·커리어",
  "배우기·자신에 대한 교육 및 훈련",
  "휴식·즐거운 활동 및 취미",
  "종교 혹은 영적활동",
  "사회에 참여하기·시민의식",
  "자신을 신체적으로 돌보기 (운동, 수면, 식이 등)",
  "환경문제",
  "예술·창조성"
];

export function ValueIntroTitle({ step }) {
  const [isFixed, setIsFixed] = useState(false);
  const boxRef = useRef(null);
  const originTop = useRef(null);

  useEffect(() => {
    if (boxRef.current && originTop.current === null) {
      const rect = boxRef.current.getBoundingClientRect();
      originTop.current = window.scrollY + rect.top;
    }
    const handleScroll = () => {
      if (!boxRef.current || originTop.current === null) return;
      const shouldFix = window.scrollY + 56 >= originTop.current;
      setIsFixed(shouldFix);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const titleText = step === 1 ? "내가 가치롭게 여기는 정도" : "내가 헌신(행동)하는 정도";
  const description = step === 1
    ? (
      <>
        사람마다 중요하게 여기는 가치가 다르며, 정답은 없습니다.<br />
        가장 중요하다고 생각되면 10,<br />
        중요하지 않다고 생각되면 1입니다.
      </>
    )
    : (
      <>
        각 가치 점수 만큼, 내가 실제로 삶 속에서<br />
        실천하고 있는지를 떠올려보세요.<br />
        중요도가 3인데 3만큼 실천하고 있으면 10입니다.
      </>
    );

  return (
    <>
      {isFixed && (
        <Box sx={{ height: boxRef.current?.offsetHeight || 0 }} />
      )}
      <Paper
        ref={boxRef}
        elevation={isFixed ? 4 : 0}
        sx={{
          position: isFixed ? "fixed" : "static",
          top: isFixed ? 56 : "auto",
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isFixed ? '#F1F5F9' : 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #ffefdfff 90%)',
          py: 3,
          px: 2,
          borderRadius: isFixed ? 0 : 3,
          fontWeight: 'bold',
          fontSize: '1.2rem',
          textAlign: 'center'
        }}
      >
        {titleText}
      </Paper>
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          mt: 2,
          mb: 3,
          color: '#282828ff',
          fontWeight: 400,
          fontSize: '1.05rem'
        }}
      >
        {description}
      </Typography>
    </>
  );
}

function QuestionSection({ step, responses, setResponses, disabledIndices = [], importance = [], navigate }) {
  const isImportance = step === 1;
  const labelLeft = isImportance ? "1 중요하지 않음" : "1 헌신하지 않음";
  const labelRight = isImportance ? "10 매우 중요" : "10 매우 헌신";

  const handleChange = (index, value) => {
    const updated = [...responses];
    updated[index] = parseInt(value);
    setResponses(updated);
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, pb: 8, pt: 0, mt: 0 }}>
      {questions.map((q, idx) => {
        const isDisabled = disabledIndices.includes(idx);
        return (
          <Box
            key={idx}
            sx={{
              my: 4,
              py: 3,
              px: 2,
              background: '#F8FBFD',
              borderRadius: 3,
              boxShadow: '0px 2px 8px rgba(27,31,39,0.06)',
              opacity: isDisabled ? 0.65 : 1
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', lineHeight: 1.5 }}>
              {`${idx + 1}. ${q}`}
            </Typography>
            {step === 1 && (idx === 0 || idx === 2) && (
              <FormControlLabel
                control={
                  <Radio
                    checked={responses[idx] === 0}
                    onChange={(e) => handleChange(idx, e.target.checked ? 0 : undefined)}
                    sx={{ color: '#1B1F27' }}
                  />
                }
                label="해당 없음으로 선택"
                sx={{ mb: 1 }}
              />
            )}
            {isDisabled ? (
              <Typography sx={{ color: '#666', fontWeight: 500 }}>
                해당 없음으로 선택된 항목입니다.
              </Typography>
            ) : (
              <>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '400px',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, fontSize: '12px' }}>
                    {labelLeft}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, fontSize: '12px' }}>
                    {labelRight}
                  </Typography>
                </Box>
                <RadioGroup
                  row
                  value={responses[idx] || ''}
                  onChange={e => handleChange(idx, e.target.value)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '500px',
                    gap: 0.5
                  }}
                >
                  {[...Array(10)].map((_, i) => {
                    const score = i + 1;
                    return (
                      <Box
                        key={score}
                        sx={{
                          flex: '1 1 0',
                          minWidth: 0,
                          maxWidth: '10%',
                          textAlign: 'center'
                        }}
                      >
                        <Radio
                          checked={responses[idx] === score}
                          value={score}
                          onChange={() => handleChange(idx, score)}
                          sx={{
                            color: '#e0e0e0',
                            '&.Mui-checked': { color: '#1B1F27' },
                            p: 0.5
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.5,
                            fontWeight: 'bold',
                            color: responses[idx] === score ? '#1B1F27' : '#999',
                            fontSize: '13px'
                          }}
                        >
                          {score}
                        </Typography>
                      </Box>
                    );
                  })}
                </RadioGroup>
                {step === 2 && (
                  <Typography sx={{ mt: 2, color: '#1B1F27', fontWeight: 500 }}>
                    내가 가치롭게 여기는 정도: <strong>{importance[idx] ?? '선택 안함'}</strong>
                  </Typography>
                )}
              </>
            )}
          </Box>
        );
      })}
    </Container>
  );
}

function calculateResults(importance, commitment) {
  const validImportance = importance.map(v => v ?? 0);
  const validCommitment = commitment.map(v => v ?? 0);
  const scored = questions.map((q, i) => ({
    label: q,
    importance: validImportance[i],
    commitment: validCommitment[i],
    index: i
  }));
  const feedback1 = scored.filter(item => item.importance >= 9).sort((a, b) => b.importance - a.importance).map(item => item.label);
  const feedback2 = scored.filter(item => item.importance >= 9 && item.commitment <= 6).sort((a, b) => b.importance - a.importance).map(item => item.label);
  const score = scored.reduce((sum, val) => sum + val.importance * val.commitment, 0) / 12;
  return { feedback1, feedback2, score };
}

function VLQSurvey() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "사용자";
  const [step, setStep] = useState(1);
  const [importance, setImportance] = useState(Array(12).fill(undefined));
  const [commitment, setCommitment] = useState(Array(12).fill(undefined));
  const disabledIndices = step === 2 ? importance.map((v, i) => (v === 0 && (i === 0 || i === 2)) ? i : null).filter(i => i !== null) : [];

  const handleNext = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 결과보기 버튼 클릭 시 VLQResult 페이지로 이동 (경로: /vlq-result)
  const handleResult = () => {
    const res = calculateResults(importance, commitment);
    navigate("/vlq-result", { state: { results: res, importance, commitment, name } });
  };

  return (
    <>
      <AppBar position="sticky" sx={{ background: '#F1F5F9', boxShadow: 2 }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
          <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
              sx={{ color: '#1B1F27', p: 2 }}
            >
              <ArrowBackIcon fontSize="large" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: '#1B1F27', fontWeight: 'bold', fontSize: '1.1rem' }}>
              내 삶의 방향 찾기
            </Typography>
          </Box>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      <Box sx={{ background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #ffefdfff 90%)', pt: 4, pb: 1 }}>
        <ValueIntroTitle step={step} />
      </Box>

      {step === 1 && (
        <QuestionSection
          step={step}
          responses={importance}
          setResponses={setImportance}
          navigate={navigate}
        />
      )}
      {step === 2 && (
        <QuestionSection
          step={step}
          responses={commitment}
          setResponses={setCommitment}
          disabledIndices={disabledIndices}
          navigate={navigate}
          importance={importance}
        />
      )}

      {/* 고정된 하단 버튼 */}
      <Box sx={{
        position: 'fixed',
        bottom: '4%',
        left: '5%',
        right: '5%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(255,255,255,0)'
      }}>
        {step === 1 && (
          <>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/valueintro", { state: { name } })}
              sx={{
                mr: 2,
                height: '3.625rem',
                fontWeight: 'bold',
                borderRadius: 50,
                color: '#1B1F27',
                border: '2px solid #1B1F27'
              }}
            >
              이전
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              disabled={importance.includes(undefined)}
              sx={{
                height: '3.625rem',
                backgroundColor: '#1B1F27',
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
              다음
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setStep(1)}
              sx={{
                mr: 2,
                height: '3.625rem',
                fontWeight: 'bold',
                borderRadius: 50,
                color: '#1B1F27',
                border: '2px solid #1B1F27'
              }}
            >
              이전
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleResult}
              disabled={commitment.includes(undefined)}
              sx={{
                height: '3.625rem',
                backgroundColor: '#1B1F27',
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
          </>
        )}
      </Box>
    </>
  );
}

export default VLQSurvey;