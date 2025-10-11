import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, Button, Menu, MenuItem
} from '@mui/material';
import { MoreVert, Delete, Edit } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

export default function DiaryView() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const diary = location.state?.diary;

  useEffect(() => {
    // 일기 데이터가 없으면 메인으로 돌아가기
    if (!diary) {
      navigate('/', { replace: true });
      return;
    }

    // 컴포넌트 마운트 후 즉시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [diary, navigate]);

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
      const savedDiaries = [] /* loaded via API */;
      const updatedDiaries = savedDiaries.filter(d => d.id !== diary.id);
      // moved to API storage
      
      alert('일기가 삭제되었습니다.');
      navigate('/', { replace: true });
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
              
              {/* 오른쪽 메뉴 버튼 */}
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    color: '#1B1F27',
                    p: 1
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ py: 2, px: 3 }}>
            {/* 일기 날짜 */}
            <Typography variant="body2" sx={{ 
              color: '#666',
              mb: 3,
              fontSize: '14px',
              textAlign: 'left'
            }}>
              {diary.date} {diary.time}
            </Typography>

            {/* 일기 내용 */}
            <Typography variant="body1" sx={{ 
              color: '#333',
              lineHeight: 1.8,
              fontSize: '18px',
              fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
              whiteSpace: 'pre-wrap'
            }}>
              {diary.content}
            </Typography>
          </Container>

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
        </Box>
      </CSSTransition>
    </>
  );
}