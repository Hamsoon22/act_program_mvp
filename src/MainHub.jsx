import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function MainHub() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1B1F27' }}>
         임시 허브 페이지 
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
          확인할 페이지를 선택해 주세요.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Rumination Scale 버튼 */}
        <Paper elevation={2} sx={{ p: 0, borderRadius: 3 }}>
          <Button
            fullWidth
            onClick={() => navigate('/survey')}
            sx={{
              p: 3,
              textAlign: 'left',
              justifyContent: 'flex-start',
              color: 'inherit',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(27, 31, 39, 0.04)'
              }
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Rumination Scale
              </Typography>
           
            </Box>
          </Button>
        </Paper>

        {/* MBI 버튼 */}
        <Paper elevation={2} sx={{ p: 0, borderRadius: 3 }}>
          <Button
            fullWidth
            onClick={() => navigate('/mbi-survey')}
            sx={{
              p: 3,
              textAlign: 'left',
              justifyContent: 'flex-start',
              color: 'inherit',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(27, 31, 39, 0.04)'
              }
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                MBI
              </Typography>
          
            </Box>
          </Button>
        </Paper>

        {/* Voice Recording 버튼 */}
        <Paper elevation={2} sx={{ p: 0, borderRadius: 3 }}>
          <Button
            fullWidth
            onClick={() => navigate('/voice-rec')}
            sx={{
              p: 3,
              textAlign: 'left',
              justifyContent: 'flex-start',
              color: 'inherit',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(27, 31, 39, 0.04)'
              }
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                목소리 녹음
              </Typography>
           
            </Box>
          </Button>
        </Paper>

        {/* Diary 버튼 */}
        <Paper elevation={2} sx={{ p: 0, borderRadius: 3 }}>
          <Button
            fullWidth
            onClick={() => navigate('/diary-list')}
            sx={{
              p: 3,
              textAlign: 'left',
              justifyContent: 'flex-start',
              color: 'inherit',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(27, 31, 39, 0.04)'
              }
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                일기쓰기
              </Typography>
           
            </Box>
          </Button>
        </Paper>

        {/* LeafShip 버튼 */}
        <Paper elevation={2} sx={{ p: 0, borderRadius: 3 }}>
          <Button
            fullWidth
            onClick={() => navigate('/leaf-ship')}
            sx={{
              p: 3,
              textAlign: 'left',
              justifyContent: 'flex-start',
              color: 'inherit',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(27, 31, 39, 0.04)'
              }
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                나뭇잎 배 띄우기
              </Typography>
           
            </Box>
          </Button>
        </Paper>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="body2" sx={{ color: '#999' }}>
          개발 중인 임시 허브 페이지입니다
        </Typography>
      </Box>
    </Container>
  );
}