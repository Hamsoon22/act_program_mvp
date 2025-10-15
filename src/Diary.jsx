import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, IconButton, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function Diary() {
  const [diaryText, setDiaryText] = useState('');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryDate, setDiaryDate] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setIsVisible(true), 100); }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    const [year, month, day] = dateValue.split('-');
    return `${year}.${month}.${day}`;
  };

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/', { replace: true }), 300);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    if (!diaryText.trim() || !diaryTitle.trim() || !diaryDate.trim()) {
      setError('제목, 날짜, 내용을 모두 입력해주세요.');
      setSaving(false);
      return;
    }

    const formattedDate = formatDate(diaryDate);

    // programId는 필수, 임시로 150 (실제 프로그램에 맞게 변경)
    const body = {
      programId: 150,
      diaryDate: formattedDate,
      diaryTitle,
      diaryContent: diaryText,
      backgroundColor,
    };

    try {
      await api.createDiary(body);
      alert('일기가 저장되었습니다!');
      navigate('/diary-list');
    } catch (e) {
      setError('저장 실패: ' + (e.message || ''));
    } finally {
      setSaving(false);
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
        <Box sx={{ minHeight: '100vh', backgroundColor, position: 'relative' }}>
          <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'transparent', top: 0 }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
              <Box sx={{ width: 48 }}>
                <IconButton onClick={handleBackClick} sx={{ color: '#1B1F27', p: 2 }}>
                  <img src={backIcon} alt="뒤로가기" style={{ width: '46px', height: '46px' }} />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1B1F27', fontWeight: 'bold', fontSize: '18px' }}>일기 쓰기</Typography>
              </Box>
              <Box sx={{ width: 48 }} />
            </Toolbar>
          </AppBar>
          <Container maxWidth="sm" sx={{ py: 0, px: 3, display: 'flex', flexDirection: 'column', pb: '120px' }}>
            <TextField label="날짜" type="date" value={diaryDate} onChange={e => setDiaryDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField label="제목" value={diaryTitle} onChange={e => setDiaryTitle(e.target.value)} sx={{ mb: 2 }} />
            <TextField multiline label="내용" value={diaryText} onChange={e => setDiaryText(e.target.value)} placeholder="오늘 하루는 어떠셨나요?" sx={{ width: '100%', flex: 1, pt: 2, pb: 2, mb: 2 }} />
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, pt: 2, pb: 3, px: 3, backgroundColor: 'rgba(255,255,255,0.8)' }}>
              {/* 배경색 선택창은 생략 */}
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{
                mt: 2,
                backgroundColor: '#1B1F27',
                fontWeight: 'bold',
                borderRadius: 50,
                textTransform: 'none'
              }}
            >
              저장
            </Button>
          </Container>
        </Box>
      </CSSTransition>
    </>
  );
}