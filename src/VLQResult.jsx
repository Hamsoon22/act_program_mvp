import React, { useEffect, useState } from "react";
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
import backIcon from './back.svg';
import { useUser } from "./context/UserContext";
import { api } from "./lib/api";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function VLQResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [userName, setUserName] = useState("사용자");

  const results = location.state?.results;
  const importance = location.state?.importance;
  const commitment = location.state?.commitment;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userProfile = await api.getUserProfile();
        setUserName(userProfile.userName || user?.userName || "사용자");
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUserName(user?.userName || "사용자");
      }
    };
    fetchUserName();
  }, [user]);

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
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'transparent',
          boxShadow: 0,
          transition: 'all 0.3s ease',
          marginTop: 0,
          paddingTop: 0,
          top: 0
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
          <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
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
              VLQ
            </Typography>
          </Box>
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 0, pb: 8, pt: 0, mt: 0 }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #DFEFF6 0%, #DFEFF6 38%, #dfffeaff 90%)',
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
            내 삶의 방향 찾기(가치명확화)
          </Typography>
          <Typography variant="body2" sx={{
            color: '#282828ff',
            mb: 0,
            fontWeight: 'regular',
            fontSize: '13px',
            lineHeight: 1.5,
            mt: 2
          }}>
            자신에게 진정으로 중요한 것이 무엇인지 인식하고,
            <br></br>이를 삶의 방향성과 행동의 기준으로 삼는 <br></br>수용전념치료(ACT)의 방법중 하나 입니다.
          </Typography>
        </Box>
        <Box sx={{
          background: "transparent",
          borderRadius: 4,
          p: 3,
          mb: 4,
          boxShadow: 'none'
        }}>
          <Radar data={chartData} options={chartOptions} />

          <Box sx={{
            mt: 4,
            mb: 2,
            background: "transparent",
            borderRadius: 3,
            p: 3,
            boxShadow: 'none',
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {userName}님의 가치로운 삶 점수
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
              당신에게 중요한 가치는<br></br> <span style={{ color: "#1292EE", fontWeight: "bold" }}>{topValue}</span>
            </Typography>
            <Typography>
              중요하지만 잘 실천하지 못하는 가치는<br></br> <span style={{ color: "#A678FF", fontWeight: "bold" }}>{lowCommit}</span> <br />
              {lowCommit === "없습니다" ? "모두 잘 실천하고 있는 편이네요." : ""}
            </Typography>
          </Box>

          <Accordion expanded={true} sx={{ mt: 4 }}>
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
    </>
  );
}

export default VLQResult;