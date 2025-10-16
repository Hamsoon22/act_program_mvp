import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function DiaryList() {
  const [diaries, setDiaries] = useState([]);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  useEffect(() => {
    api.listDiaries().then(res => {
      setDiaries(res.data || []);
    }).catch(e => setError('목록 불러오기 실패'));
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/', { replace: true }), 300);
  };

  const handleNewDiary = () => {
    navigate('/diary');
  };

  const handleDiaryClick = (diary) => {
    navigate('/diary-view', { state: { diary } });
  };

  const handleDeleteDiary = async (diaryId) => {
    if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      await api.deleteDiary(diaryId);
      setDiaries(diaries.filter(d => d.id !== diaryId));
    }
  };

  return (
    <>
      <CSSTransition
        nodeRef={nodeRef}
        in={isVisible && !isExiting}
        timeout={300}
        classNames="slide-right"
        unmountOnExit
      >
        <Box ref={nodeRef} sx={{ minHeight: '100vh', backgroundColor: 'white', position: 'relative' }}>
          <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'rgba(255,255,255,0.95)', top: 0 }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
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
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1B1F27', fontWeight: 'bold', fontSize: '18px' }}>일기 목록</Typography>
              </Box>
              <Box sx={{ width: 48 }} />
            </Toolbar>
          </AppBar>
          <Container maxWidth="sm" sx={{ py: 2, pb: 4 }}>
            {error ? <Typography color="error">{error}</Typography>
            : diaries.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                {/* 아이콘 */}
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}>
                  <Typography sx={{ 
                    fontSize: '48px', 
                    color: '#666',
                    fontWeight: 'bold'
                  }}>
                    !
                  </Typography>
                </Box>
                
                {/* 메시지 */}
                <Typography variant="body1" sx={{ color: '#999', fontSize: '16px', fontWeight: 'medium' }}>
                  ... 일기 내역이 없습니다 ...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {diaries.map((diary) => (
                  <Box key={diary.id} sx={{ backgroundColor: diary.backgroundColor || '#fff', borderRadius: '16px', p: 3 }}>
                    <Box onClick={() => handleDiaryClick(diary)} sx={{ cursor: 'pointer', mb: 2 }}>
                      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6, fontSize: '16px' }}>
                        {diary.diaryContent}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '14px' }}>
                        {diary.diaryDate}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={(e) => {e.stopPropagation(); navigate('/diary-edit', { state: { diary } });}}
                          sx={{ color: '#666', fontSize: '14px', textTransform: 'none', minWidth: 'auto', p: 0.5 }}>수정</Button>
                        <Typography sx={{ color: '#ddd' }}>|</Typography>
                        <Button onClick={async (e) => {e.stopPropagation(); await handleDeleteDiary(diary.id);}}
                          sx={{ color: '#ff6b6b', fontSize: '14px', textTransform: 'none', minWidth: 'auto', p: 0.5 }}>삭제</Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </CSSTransition>
      <Box sx={{ position: 'fixed', bottom: '4%', left: '5%', right: '5%', display: 'flex', justifyContent: 'center', zIndex: 99999 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNewDiary}
          sx={{
            width: '100%',
            height: '3.625rem',
            flexShrink: 0,
            backgroundColor: '#1B1F27',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: 50,
            boxShadow: '0 4px 12px rgba(27, 31, 39, 0.3)',
            '&:hover': { backgroundColor: '#2A2F38', boxShadow: '0 6px 16px rgba(27, 31, 39, 0.4)' },
            textTransform: 'none'
          }}
        >
          일기 쓰기
        </Button>
      </Box>
    </>
  );
}