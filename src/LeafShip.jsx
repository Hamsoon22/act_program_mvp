import React, { useState, useEffect } from 'react';
import {
  Typography, Box, IconButton, Button, TextField, Modal, Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

export default function LeafShip() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = React.useRef(null);
  const navigate = useNavigate();

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

  const handleSendMessage = () => {
    if (message.trim()) {
      // 모달 닫기 애니메이션
      setModalOpen(false);
      
      // 영상 재생 시작
      setTimeout(() => {
        setVideoPlaying(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      }, 500);
    }
  };

  const handleModalClose = () => {
    // 빈 모달은 닫지 않음
    if (message.trim()) {
      setModalOpen(false);
      setTimeout(() => {
        setVideoPlaying(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      }, 500);
    }
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
            width: '100vw',
            position: 'relative',
            overflow: 'hidden',
            transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          {/* 배경 영상 */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => console.log('Video loaded successfully')}
            onError={(e) => console.error('Video error:', e)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              opacity: videoPlaying ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <source src="/act_program_mvp/leaf.mp4" type="video/mp4" />
          </video>

          {/* 기본 배경 (영상이 로드되기 전) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'linear-gradient(135deg, #1E9FD4 0%, #54A046 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              opacity: videoPlaying ? 0 : 1,
              transition: 'opacity 0.5s ease-in-out'
            }}
          />

          {/* 어두운 오버레이 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: modalOpen ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
              zIndex: 2,
              transition: 'background-color 0.5s ease-in-out'
            }}
          />

          {/* 헤더 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              height: '78px',
              px: 2
            }}
          >
            {/* 왼쪽 백버튼 */}
            <IconButton 
              onClick={handleBackClick}
              sx={{ 
                color: 'white',
                p: 0
              }}
            >
              <img 
                src={backIcon} 
                alt="뒤로가기" 
                style={{ 
                  width: '46px', 
                  height: '46px',
                  filter: 'brightness(0) invert(1)'
                }} 
              />
            </IconButton>
            
            {/* 중앙 제목 */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}
              >
                나뭇잎 배 보내기
              </Typography>
            </Box>
            
            {/* 오른쪽 빈 공간 */}
            <Box sx={{ width: 48 }} />
          </Box>

          {/* 메시지 입력 모달 */}
          <Modal
            open={modalOpen}
            onClose={handleModalClose}
            closeAfterTransition
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20
            }}
          >
            <Fade in={modalOpen} timeout={500}>
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  p: 4,
                  mx: 3,
                  maxWidth: 400,
                  width: '100%',
                  outline: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: 'center',
                    mb: 2,
                    fontWeight: 'bold',
                    color: '#333'
                  }}
                >
                  부정적인 생각과 감정을 작성하고

                  <br />
                  나뭇잎 배에 떠나 보내세요.
                </Typography>

                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  placeholder="불안한 생각이..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9'
                    }
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  sx={{
                    backgroundColor: '#000000ff',
                    color: 'white',
                    py: 1.5,
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#000000ff'
                    },
                    '&:disabled': {
                      backgroundColor: '#bdc3c7',
                      color: '#7f8c8d'
                    }
                  }}
                >
                  보내기
                </Button>
              </Box>
            </Fade>
          </Modal>

          {/* 영상 재생 후 내용 (나중에 구현) */}
          {videoPlaying && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 5,
                textAlign: 'center'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  fontSize: '18px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.7)'
                }}
              >
                나뭇잎 배가<br />당신의 걱정을 가져갑니다.
              </Typography>
            </Box>
          )}
        </Box>
      </CSSTransition>
    </>
  );
}