import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Button, Box, AppBar, Toolbar, IconButton, Modal, Backdrop,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { Mic, Refresh, PlayArrow, Pause, MoreVert, Save, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';
import { api } from './lib/api';

export default function VoiceRec() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [audioData, setAudioData] = useState(new Array(30).fill(0));
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecordingId, setSelectedRecordingId] = useState(null);
  const [recordingCounter, setRecordingCounter] = useState(1);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  // finalChunks: 녹음 데이터 임시 저장 (useRef 사용해 렌더링 간 유지)
  const finalChunksRef = useRef([]);

  const getProgramId = () => 1;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(time => time + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let animationFrame;
    const updateAudioData = () => {
      if (analyser && isRecording) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const bars = 30;
        const step = Math.floor(bufferLength / bars);
        const newAudioData = [];

        for (let i = 0; i < bars; i++) {
          let sum = 0;
          const start = i * step;
          const end = Math.min(start + step, bufferLength);
          for (let j = start; j < end; j++) sum += dataArray[j];
          const average = sum / (end - start);
          const height = Math.max(20, (average / 255) * 60 + 20);
          newAudioData.push(height);
        }

        setAudioData(newAudioData);
        animationFrame = requestAnimationFrame(updateAudioData);
      }
    };
    if (isRecording && analyser) updateAudioData();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isRecording, analyser]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const convertWebmToWav = async (webmBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(webmBlob);
    });
  };

  const audioBufferToWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    let result;
    if (numChannels === 2) {
      result = interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
    } else {
      result = audioBuffer.getChannelData(0);
    }
    const buffer = new ArrayBuffer(44 + result.length * 2);
    const view = new DataView(buffer);
    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    }
    function interleave(inputL, inputR) {
      const length = inputL.length + inputR.length;
      const result = new Float32Array(length);
      let index = 0, inputIndex = 0;
      while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
      }
      return result;
    }
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + result.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitDepth / 8, true);
    view.setUint16(32, numChannels * bitDepth / 8, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, result.length * 2, true);
    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      setAudioStream(stream);
      finalChunksRef.current = [];
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);
      setAudioContext(context);
      setAnalyser(analyserNode);
      let recorder;
      let mimeType = 'audio/webm';
      try {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
          recorder = new MediaRecorder(stream, { mimeType: mimeType });
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
          recorder = new MediaRecorder(stream, { mimeType: mimeType });
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
          recorder = new MediaRecorder(stream, { mimeType: mimeType });
        } else {
          recorder = new MediaRecorder(stream);
          mimeType = 'audio/webm';
        }
      } catch (error) {
        recorder = new MediaRecorder(stream);
        mimeType = 'audio/webm';
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          finalChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const currentChunks = finalChunksRef.current;
        finalChunksRef.current = [];
        if (currentChunks.length === 0) {
          alert('녹음된 데이터가 없습니다. 마이크 권한을 확인해주세요.');
          return;
        }
        const finalMimeType = recorder.mimeType || mimeType;
        const audioBlob = new Blob(currentChunks, { type: finalMimeType });
        if (audioBlob.size === 0) {
          alert('녹음 데이터가 비어있습니다.');
          return;
        }
        let wavBlob;
        try {
          wavBlob = await convertWebmToWav(audioBlob);
        } catch (err) {
          alert('webm → wav 변환 실패: ' + (err.message || err));
          return;
        }
        if (wavBlob.size > 15 * 1024 * 1024) {
          alert('파일 크기가 15MB를 초과합니다.');
          return;
        }
        const audioUrl = URL.createObjectURL(wavBlob);
        const wavFile = new File([wavBlob], 'voice.wav', { type: 'audio/wav' });
        try {
          await api.uploadRecord(getProgramId(), wavFile);
          alert('녹음 파일(wav)이 서버에 저장되었습니다!');
        } catch (e) {
          setUploadError('녹음 파일 서버 저장 실패: ' + (e.message || ''));
          alert('녹음 파일 서버 저장 실패: ' + (e.message || ''));
          return;
        }
        const newRecording = {
          id: Date.now(),
          number: recordingCounter,
          duration: recordingTime,
          date: new Date().toLocaleString(),
          audioUrl: audioUrl,
          blob: wavFile,
          mimeType: 'audio/wav'
        };
        setRecordings(prev => [...prev, newRecording]);
        setRecordingCounter(prev => prev + 1);
      };

      setMediaRecorder(recorder);
      recorder.start();

      setIsRecording(true);
      setRecordingTime(0);
      setShowRecordingModal(true);
    } catch (error) {
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();
      }
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 100);
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setIsRecording(false);
    setShowRecordingModal(false);
    setAnalyser(null);
    setAudioData(new Array(30).fill(20));
  };

  const handleRestartRecording = () => {
    setRecordingTime(0);
    finalChunksRef.current = [];
  };

  const handlePlayRecording = (recording) => {
    if (playingId === recording.id && currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play().catch(err => {
          setPlayingId(null);
          setCurrentAudio(null);
          alert('재생에 실패했습니다. 다시 시도해주세요.');
        });
      } else {
        currentAudio.pause();
      }
      return;
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingId(null);
      setIsPaused(false);
    }
    try {
      const audio = new Audio();
      audio.addEventListener('canplay', () => {
        audio.play().catch(err => {
          setPlayingId(null);
          setCurrentAudio(null);
          alert('재생에 실패했습니다. 다시 시도해주세요.');
        });
      });
      audio.addEventListener('play', () => {
        setPlayingId(recording.id);
        setCurrentAudio(audio);
        setIsPaused(false);
      });
      audio.addEventListener('pause', () => {
        setIsPaused(true);
      });
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setCurrentAudio(null);
        setIsPaused(false);
      });
      audio.addEventListener('error', () => {
        setPlayingId(null);
        setCurrentAudio(null);
        alert('오디오 오류 발생');
      });
      if (recording.audioUrl) {
        audio.src = recording.audioUrl;
        audio.load();
      } else {
        throw new Error('오디오 URL이 없습니다.');
      }
    } catch (error) {
      setPlayingId(null);
      setCurrentAudio(null);
      alert('오디오 재생 준비 중 오류가 발생했습니다.');
    }
  };

  const handleMoreClick = (event, recordingId) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecordingId(recordingId);
  };

  const handleMoreClose = () => {
    setAnchorEl(null);
    setSelectedRecordingId(null);
  };

  const handleDownload = async (recording) => {
    try {
      const url = URL.createObjectURL(recording.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `녹음${recording.number}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      handleMoreClose();
    } catch (error) {
      alert('다운로드에 실패했습니다.');
      handleMoreClose();
    }
  };

  const handleDelete = (recordingId) => {
    if (window.confirm('이 녹음을 삭제하시겠습니까?')) {
      setRecordings(prev => prev.filter(recording => recording.id !== recordingId));
      if (playingId === recordingId && currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setPlayingId(null);
      }
      handleMoreClose();
    }
  };

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/', { replace: true }), 250);
  };

  return (
    <>
      <style>
        {`
          .page-enter {
            transform: translateX(100%);
            opacity: 0;
          }
          .page-enter-active {
            transform: translateX(0);
            opacity: 1;
            transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .page-exit {
            transform: translateX(0);
            opacity: 1;
          }
          .page-exit-active {
            transform: translateX(100%);
            opacity: 0;
            transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}
      </style>
      <CSSTransition in={isVisible && !isExiting} timeout={250} classNames="page" appear>
        <Box sx={{
          opacity: isVisible && !isExiting ? 1 : 0,
          transition: 'all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          margin: 0, padding: 0, width: '100%', minHeight: '100vh',
          backgroundColor: 'white', overflowX: 'hidden', maxWidth: '100vw'
        }}>
          <AppBar position="static"
            sx={{
              backgroundColor: scrolled ? 'white' : 'transparent',
              boxShadow: scrolled ? 2 : 0,
              transition: 'all 0.3s ease',
              marginTop: 0, paddingTop: 0, top: 0
            }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
              <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
                <IconButton onClick={handleBackClick} sx={{ color: '#1B1F27', p: 2 }}>
                  <img src={backIcon} alt="뒤로가기" style={{ width: '46px', height: '46px' }} />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6"
                  sx={{ color: '#1B1F27', fontWeight: 'bold', fontSize: '18px' }}>
                  목소리 녹음
                </Typography>
              </Box>
              <Box sx={{ width: 48 }} />
            </Toolbar>
          </AppBar>
          <Container maxWidth="sm"
            sx={{ py: 2, pb: 12, overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
            {uploadError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {uploadError}
              </Typography>
            )}
            {recordings.length === 0 ? (
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh'
              }}>
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                }}>
                  <Box sx={{
                    width: 80, height: 80, backgroundColor: '#e0e0e0', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3
                  }}>
                    <Typography sx={{
                      fontSize: '48px', color: '#666', fontWeight: 'bold'
                    }}>!</Typography>
                  </Box>
                  <Typography variant="body1" sx={{
                    color: '#999', fontSize: '16px', fontWeight: 'medium'
                  }}>
                    ... 녹음 내역이 없습니다 ...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'hidden' }}>
                {recordings.map((recording) => (
                  <Box key={recording.id} sx={{
                    mb: 2, p: 3, backgroundColor: '#eef1f3ff', borderRadius: 5,
                    display: 'flex', alignItems: 'center', gap: 2,
                    width: '100%', maxWidth: '100%', overflowX: 'hidden'
                  }}>
                    <IconButton
                      onClick={() => handlePlayRecording(recording)}
                      sx={{
                        backgroundColor: playingId === recording.id ? '#c53030' : '#333',
                        color: 'white', width: 48, height: 48,
                        '&:hover': { backgroundColor: playingId === recording.id ? '#a02626' : '#555' }
                      }}>
                      {(playingId === recording.id && !isPaused) ?
                        <Pause sx={{ fontSize: 20 }} /> :
                        <PlayArrow sx={{ fontSize: 20 }} />
                      }
                    </IconButton>
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <Typography variant="body1" sx={{
                        fontWeight: 'bold', mb: 0.5, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        녹음 {recording.number}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#666', fontSize: '12px', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {recording.date} • {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                      </Typography>
                    </Box>
                    <IconButton onClick={(e) => handleMoreClick(e, recording.id)}
                      sx={{ color: '#666' }}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </CSSTransition>
      {!showRecordingModal && (
        <Box sx={{
          position: 'fixed', bottom: 20, left: 0, right: 0, px: 3, zIndex: 1000
        }}>
          <Button
            variant="contained" size="large" startIcon={<Mic />}
            onClick={handleStartRecording}
            sx={{
              width: '100%', maxWidth: 'sm', mx: 'auto', height: 56,
              backgroundColor: '#D1052E', color: 'white', fontSize: '1.1rem',
              fontWeight: 'bold', borderRadius: '28px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 1,
              '& .MuiButton-startIcon': { marginRight: '8px', marginLeft: 0 },
              '&:hover': { backgroundColor: '#B8041A' }
            }}>
            녹음 시작
          </Button>
        </Box>
      )}
      <Modal
        open={showRecordingModal}
        onClose={() => { }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(2px)' }
        }}
      >
        <Box sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#f8f9fa',
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px', p: 4, pb: 6,
          transform: showRecordingModal ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out', zIndex: 10000
        }}>
          <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100px', mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {audioData.map((height, index) => (
                <Box key={index}
                  sx={{
                    width: '3px', height: `${height}px`, backgroundColor: '#999',
                    borderRadius: '2px', transition: 'height 0.1s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
          <Typography variant="h4"
            sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333', mb: 4 }}>
            {formatTime(recordingTime)}
          </Typography>
          <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '20px', px: '0px', width: '100%'
          }}>
            <IconButton
              onClick={handleRestartRecording}
              sx={{
                width: 60, height: 60, backgroundColor: 'white',
                border: '2px solid #ddd', flexShrink: 0,
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}>
              <Refresh sx={{ fontSize: 30, color: '#333' }} />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleStopRecording}
              sx={{
                backgroundColor: '#D1052E', color: 'white', px: 4, py: 2,
                borderRadius: '50px', fontSize: '16px', fontWeight: 'bold',
                minWidth: '240px', '&:hover': { backgroundColor: '#555' }
              }}>
              저장
            </Button>
          </Box>
          <Box sx={{
            position: 'absolute', bottom: 10, left: '50%',
            transform: 'translateX(-50%)', width: '60px', height: '4px',
            backgroundColor: '#ddd', borderRadius: '2px'
          }} />
        </Box>
      </Modal>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMoreClose}
        PaperProps={{
          sx: { minWidth: 105, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }
        }}
      >
        <MenuItem
          onClick={() => {
            const recording = recordings.find(r => r.id === selectedRecordingId);
            if (recording) handleDownload(recording);
          }}
        >
          <ListItemIcon>
            <Save fontSize="small" sx={{ color: '#333' }} />
          </ListItemIcon>
          <ListItemText primary="저장" />
        </MenuItem>
        <MenuItem
          onClick={() => handleDelete(selectedRecordingId)}
          sx={{ color: '#c53030' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: '#c53030' }} />
          </ListItemIcon>
          <ListItemText primary="삭제" />
        </MenuItem>
      </Menu>
    </>
  );
}