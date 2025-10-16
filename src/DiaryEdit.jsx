import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, AppBar, Toolbar, IconButton, TextField, Button
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function DiaryEdit() {
  const [diaryText, setDiaryText] = useState('');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryDate, setDiaryDate] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const diary = location.state?.diary;

  useEffect(() => {
    if (!diary) {
      navigate('/', { replace: true });
      return;
    }
    setDiaryText(diary.diaryContent);
    setDiaryTitle(diary.diaryTitle);
    setDiaryDate(diary.diaryDate);
    setBackgroundColor(diary.backgroundColor || '#ffffff');
    setTimeout(() => setIsVisible(true), 100);
  }, [diary, navigate]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    // YYYY-MM-DD => YYYY.MM.DD
    if (dateValue.includes('.')) return dateValue;
    const [year, month, day] = dateValue.split('-');
    return `${year}.${month}.${day}`;
  };

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 300);
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

    try {
      await api.updateDiary(diary.id, {
        diaryDate: formattedDate,
        diaryTitle,
        diaryContent: diaryText,
      });
      alert('일기가 수정되었습니다!');
      navigate('/diary-list');
    } catch (e) {
      setError('수정 실패: ' + (e.message || ''));
    } finally {
      setSaving(false);
    }
  };

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
            backgroundColor: backgroundColor,
            position: 'relative',
          }}
        >
          <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'transparent', top: 0 }}>
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
                <Typography variant="h6" sx={{ color: '#1B1F27', fontWeight: 'bold', fontSize: '18px' }}>
                  일기 수정
                </Typography>
              </Box>
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    color: '#007AFF',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0
                  }}
                >
                  저장
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Container maxWidth="sm" sx={{ py: 0, px: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', pb: '120px' }}>
            <TextField label="날짜" type="date" value={diaryDate?.replace(/\./g, '-')} onChange={e => setDiaryDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField label="제목" value={diaryTitle} onChange={e => setDiaryTitle(e.target.value)} sx={{ mb: 2 }} />
            <TextField multiline label="내용" value={diaryText} onChange={(e) => setDiaryText(e.target.value)} placeholder="일기 내용을 입력하세요..." sx={{ width: '100%', flex: 1, pt: 2, pb: 2, mb: 2 }} />
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          </Container>
        </Box>
      </CSSTransition>
    </>
  );
}