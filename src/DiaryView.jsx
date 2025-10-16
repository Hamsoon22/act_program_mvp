import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, Button, Menu, MenuItem
} from '@mui/material';
import { MoreVert, Delete, Edit, Download } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function DiaryView() {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const diaryContentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const diary = location.state?.diary;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/diary-list', { replace: true });
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

  const handleDelete = async () => {
    handleMenuClose();
    if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      try {
        await api.deleteDiary(diary.id);
        alert('일기가 삭제되었습니다.');
        navigate('/diary-list', { replace: true });
      } catch (err) {
        alert('삭제 실패: ' + (err.message || ''));
      }
    }
  };

  // 이미지 저장 핸들러 (생략 가능, 필요하면 추가)
  // const handleSaveAsImage = ...;

  if (!diary) return null;

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
          <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'transparent', top: 0 }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
                <IconButton onClick={handleBackClick} sx={{ color: '#1B1F27', p: 2 }}>
                  <img src={backIcon} alt="뒤로가기" style={{ width: '46px', height: '46px' }} />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1B1F27', fontWeight: 'bold', fontSize: '18px' }}>
                  일기 보기
                </Typography>
              </Box>
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <IconButton onClick={handleMenuClick} sx={{ color: '#1B1F27', p: 1 }}>
                  <MoreVert />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          <Container ref={diaryContentRef} maxWidth="sm" sx={{ py: 2, px: 3, backgroundColor: diary.backgroundColor || '#ffffff', minHeight: 'calc(100vh - 120px)', borderRadius: '0 0 20px 20px' }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '14px', textAlign: 'left' }}>
              {diary.diaryDate}
            </Typography>
            <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold', mb: 3, fontSize: '22px', fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif' }}>
              {diary.diaryTitle}
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.8, fontSize: '18px', fontFamily: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif', whiteSpace: 'pre-wrap', mb: 10 }}>
              {diary.diaryContent}
            </Typography>
          </Container>
        </Box>
      </CSSTransition>
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