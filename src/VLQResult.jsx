import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  Paper,
  Container,
  Button,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function VLQResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const results = location.state?.results;
  const importance = location.state?.importance;
  const commitment = location.state?.commitment;
  const name = location.state?.name || "사용자";

  useEffect(() => {
    if (!results || !importance || !commitment) {
      navigate("/survey");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [results, importance, commitment, navigate]);

  if (!results || !importance || !commitment) return null;

  const topValues = results.feedback1.slice(0, 2);
  const topValue = topValues[0] || "해당없음";
  const lowCommit = results.feedback2.length > 0 ? results.feedback2[0] : "해당없음";

  const labels = [
    "가족", "부부관계", "부모됨", "친구관계",
    "일", "교육", "즐거움", "영성", "사회참여", "신체관리", "환경", "창조성"
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "가치",
        data: importance,
        backgroundColor: "rgba(18,146,238,0.15)",
        borderColor: "#1292EE",
        borderWidth: 2
      },
      {
        label: "실천",
        data: commitment,
        backgroundColor: "rgba(166,120,255,0.15)",
        borderColor: "#A678FF",
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: "#888", font: { size: 10 } },
        pointLabels: { font: { size: 12 }, color: "#333" },
        grid: { color: "#ccc" }
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#444",
          font: { size: 13 }
        }
      }
    }
  };

  const goBack = () => {
    navigate("/survey");
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <>
      <AppBar position="sticky" sx={{ background: '#F1F5F9', boxShadow: 2 }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
          <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton
              onClick={() => navigate(-1)}
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

      <Box sx={{
        background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #ffefdfff 90%)',
        pt: 4, pb: 1
      }}>
        <Paper elevation={2} sx={{
          mx: 'auto',
          my: 3,
          py: 3,
          px: 2,
          maxWidth: 480,
          background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #ffefdfff 90%)',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          {name}님의 가치로운 삶 결과
        </Paper>
      </Box>

      <Container maxWidth="md" sx={{ py: 0, pb: 8, pt: 0, mt: 0 }}>
        <Box sx={{
          background: "#F8FBFD",
          borderRadius: 4,
          p: 3,
          mb: 4,
          boxShadow: '0px 2px 8px rgba(27,31,39,0.06)'
        }}>
          <Radar data={chartData} options={chartOptions} />

          <Box sx={{
            mt: 4,
            mb: 2,
            background: "#fff",
            borderRadius: 3,
            p: 3,
            boxShadow: '0px 2px 8px rgba(27,31,39,0.08)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {name}님의 가치로운 삶 점수
            </Typography>
            <Box sx={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1292EE',
              mb: 2
            }}>
              {results.score.toFixed(1)}
            </Box>
            <Typography sx={{ mb: 1 }}>
              당신에게 중요한 가치는 <span style={{ color: "#1292EE", fontWeight: "bold" }}>{topValue}</span>입니다.
            </Typography>
            <Typography>
              중요하지만 잘 실천하지 못하는 가치는 <span style={{ color: "#A678FF", fontWeight: "bold" }}>{lowCommit}</span>입니다. <br />
              {lowCommit === "없습니다" ? "모두 잘 실천하고 있는 편이네요." : ""}
            </Typography>
          </Box>

          <Accordion sx={{ mt: 4 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 'bold' }}>가치 실천 자세히 보기</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {labels.map((label, idx) => {
                const isDisabled = importance[idx] === 0 && (idx === 0 || idx === 2);
                const importanceVal = importance[idx] ?? 0;
                const commitmentVal = commitment[idx] ?? 0;

                return (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {`${idx + 1}. ${label}`}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ minWidth: 60, fontSize: '0.95rem', color: '#1292EE' }}>가치</Box>
                      <Box sx={{
                        flex: 1,
                        height: 10,
                        background: '#e0e0e0',
                        borderRadius: 5,
                        mx: 2,
                        position: 'relative'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${importanceVal * 10}%`,
                          backgroundColor: isDisabled ? "#eee" : "#1292EE",
                          borderRadius: 5,
                          transition: 'width 200ms'
                        }} />
                      </Box>
                      <Box sx={{
                        minWidth: 24,
                        textAlign: 'right',
                        color: isDisabled ? '#aaa' : '#1292EE',
                        fontWeight: 'bold'
                      }}>
                        {isDisabled ? "-" : importanceVal}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ minWidth: 60, fontSize: '0.95rem', color: '#A678FF' }}>실천</Box>
                      <Box sx={{
                        flex: 1,
                        height: 10,
                        background: '#e0e0e0',
                        borderRadius: 5,
                        mx: 2,
                        position: 'relative'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${commitmentVal * 10}%`,
                          backgroundColor: isDisabled ? "#eee" : "#A678FF",
                          borderRadius: 5,
                          transition: 'width 200ms'
                        }} />
                      </Box>
                      <Box sx={{
                        minWidth: 24,
                        textAlign: 'right',
                        color: isDisabled ? '#aaa' : '#A678FF',
                        fontWeight: 'bold'
                      }}>
                        {isDisabled ? "-" : commitmentVal}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      <Box sx={{
        position: 'fixed',
        bottom: '4%',
        left: '5%',
        right: '5%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(255,255,255,0)',
      }}>
        <Button
          variant="outlined"
          size="large"
          onClick={goBack}
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
          onClick={goHome}
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
          확인
        </Button>
      </Box>
    </>
  );
}

export default VLQResult;