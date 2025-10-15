import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box, AppBar, Toolbar, IconButton, Modal, Backdrop,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { Mic, Refresh, Stop, PlayArrow, Pause, MoreVert, Save, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import backIcon from './back.svg';

export default function VoiceRec() {
  const [scrolled, setScrolled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [recordings, setRecordings] = useState([]); // 녹음 내역 상태
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태
  const [recordingTime, setRecordingTime] = useState(0); // 녹음 시간 (초)
  const [showRecordingModal, setShowRecordingModal] = useState(false); // 녹음 모달 표시
  const [audioData, setAudioData] = useState(new Array(30).fill(0)); // 오디오 스펙트럼 데이터
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]); // 녹음된 오디오 데이터
  const [playingId, setPlayingId] = useState(null); // 현재 재생 중인 녹음 ID
  const [currentAudio, setCurrentAudio] = useState(null); // 현재 재생 중인 Audio 객체
  const [isPaused, setIsPaused] = useState(false); // 일시정지 상태
  const [anchorEl, setAnchorEl] = useState(null); // 더보기 메뉴 앵커
  const [selectedRecordingId, setSelectedRecordingId] = useState(null); // 선택된 녹음 ID
  const [recordingCounter, setRecordingCounter] = useState(1); // 녹음 순서 카운터
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

  // 녹음 시간 타이머
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 오디오 스펙트럼 분석
  useEffect(() => {
    let animationFrame;
    
    const updateAudioData = () => {
      if (analyser && isRecording) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        // 30개 바에 맞게 데이터를 분할하고 정규화
        const bars = 30;
        const step = Math.floor(bufferLength / bars);
        const newAudioData = [];
        
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          const start = i * step;
          const end = Math.min(start + step, bufferLength);
          
          for (let j = start; j < end; j++) {
            sum += dataArray[j];
          }
          
          const average = sum / (end - start);
          // 높이를 20-80px 범위로 정규화
          const height = Math.max(20, (average / 255) * 60 + 20);
          newAudioData.push(height);
        }
        
        setAudioData(newAudioData);
        animationFrame = requestAnimationFrame(updateAudioData);
      }
    };

    if (isRecording && analyser) {
      updateAudioData();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRecording, analyser]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      setAudioStream(stream);
      setRecordedChunks([]); // 새로운 녹음을 위해 초기화
      
      // Web Audio API 설정
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      
      // 브라우저 호환성을 위한 안전한 MediaRecorder 설정
      let recorder;
      let mimeType = 'audio/webm'; // 기본값
      
      try {
        // 지원되는 형식을 순서대로 시도
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
          // 아무 옵션 없이 기본 설정
          recorder = new MediaRecorder(stream);
          mimeType = 'audio/webm'; // 가정
        }
      } catch (error) {
        console.log('MediaRecorder 옵션 설정 실패, 기본 설정 사용');
        recorder = new MediaRecorder(stream);
        mimeType = 'audio/webm';
      }
      
      console.log('최종 사용 MIME 타입:', mimeType);
      
      // 녹음 데이터 수집
      recorder.ondataavailable = (event) => {
        console.log('데이터 수신:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          setRecordedChunks(prev => {
            const updated = [...prev, event.data];
            console.log('총 청크 수:', updated.length);
            return updated;
          });
        }
      };
      
      // 녹음 중지 시 데이터 처리
      recorder.onstop = () => {
        console.log('녹음 중지됨, 데이터 처리 시작');
        
        // 현재 recordedChunks 상태를 직접 접근할 수 없으므로 setTimeout 사용
        setTimeout(() => {
          setRecordedChunks(currentChunks => {
            console.log('최종 청크 수:', currentChunks.length);
            
            if (currentChunks.length === 0) {
              alert('녹음된 데이터가 없습니다. 마이크 권한을 확인해주세요.');
              return currentChunks;
            }
            
            // MIME 타입 결정
            const finalMimeType = recorder.mimeType || mimeType;
            console.log('최종 MIME 타입:', finalMimeType);
            
            const audioBlob = new Blob(currentChunks, { type: finalMimeType });
            console.log('Blob 생성됨 - 크기:', audioBlob.size, 'bytes');
            
            if (audioBlob.size === 0) {
              alert('녹음 데이터가 비어있습니다.');
              return currentChunks;
            }
            
            // Blob URL 생성
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('Blob URL 생성됨');
            
            const newRecording = {
              id: Date.now(),
              number: recordingCounter, // 고유한 순서 번호
              duration: recordingTime,
              date: new Date().toLocaleString(),
              audioUrl: audioUrl,
              blob: audioBlob,
              mimeType: finalMimeType
            };
            
            console.log('새 녹음 저장:', {
              id: newRecording.id,
              number: newRecording.number,
              duration: newRecording.duration,
              size: audioBlob.size
            });
            
            setRecordings(prev => {
              const updated = [...prev, newRecording];
              console.log('전체 녹음 수:', updated.length);
              return updated;
            });
            
            // 청크 초기화
            return [];
          });
        }, 100);
      };
      
      setMediaRecorder(recorder);
      
      // 주기적으로 데이터 수집하도록 설정 (1초마다)
      recorder.start(1000);
      console.log('녹음 시작 - 1초마다 데이터 수집');
      
      setIsRecording(true);
      setRecordingTime(0);
      setShowRecordingModal(true);
    } catch (error) {
      console.error('녹음 시작 중 오류:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const handleStopRecording = () => {
    console.log('녹음 중지 시작');
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      console.log('MediaRecorder 상태:', mediaRecorder.state);
      
      // 마지막 데이터를 수집하기 위해 requestData 호출
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();
        console.log('마지막 데이터 요청됨');
      }
      
      // 잠시 후 중지
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          console.log('MediaRecorder 중지됨');
        }
      }, 100);
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => {
        track.stop();
        console.log('오디오 트랙 중지됨');
      });
      setAudioStream(null);
    }
    
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    
    setIsRecording(false);
    setShowRecordingModal(false);
    setAnalyser(null);
    setAudioData(new Array(30).fill(20)); // 기본 높이로 리셋
    
    // 녹음이 완료되면 카운터 증가
    setRecordingCounter(prev => prev + 1);
  };

  const handleRestartRecording = () => {
    setRecordingTime(0);
    setRecordedChunks([]); // 녹음 데이터도 초기화
    // 오디오 데이터는 계속 실시간으로 업데이트됨
  };

  const handlePlayRecording = (recording) => {
    console.log('재생/일시정지 시도:', recording);
    
    // 현재 재생 중인 녹음과 같은 녹음을 클릭한 경우
    if (playingId === recording.id && currentAudio) {
      if (currentAudio.paused) {
        // 일시정지 상태면 재생
        currentAudio.play().catch(err => {
          console.error('재생 실패:', err);
          setPlayingId(null);
          setCurrentAudio(null);
          alert('재생에 실패했습니다. 다시 시도해주세요.');
        });
      } else {
        // 재생 중이면 일시정지
        currentAudio.pause();
      }
      return;
    }
    
    // 기존 오디오가 재생 중이면 먼저 정지
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingId(null);
      setIsPaused(false);
    }
    
    try {
      // 새로운 Audio 객체 생성
      const audio = new Audio();
      
      // 먼저 이벤트 리스너 설정
      audio.addEventListener('loadstart', () => {
        console.log('오디오 로딩 시작');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('재생 준비 완료');
        // 재생 가능할 때 자동 재생
        audio.play().catch(err => {
          console.error('자동 재생 실패:', err);
          setPlayingId(null);
          setCurrentAudio(null);
          alert('재생에 실패했습니다. 다시 시도해주세요.');
        });
      });
      
      audio.addEventListener('play', () => {
        console.log('재생 시작됨');
        setPlayingId(recording.id);
        setCurrentAudio(audio);
        setIsPaused(false);
      });
      
      audio.addEventListener('pause', () => {
        console.log('재생 일시정지됨');
        setIsPaused(true);
      });
      
      audio.addEventListener('ended', () => {
        console.log('재생 종료');
        setPlayingId(null);
        setCurrentAudio(null);
        setIsPaused(false);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('오디오 오류:', e, audio.error);
        setPlayingId(null);
        setCurrentAudio(null);
        
        // 구체적인 오류 메시지
        let errorMsg = '재생 중 오류가 발생했습니다.';
        if (audio.error) {
          switch (audio.error.code) {
            case 1: errorMsg = '재생이 중단되었습니다.'; break;
            case 2: errorMsg = '네트워크 오류가 발생했습니다.'; break;
            case 3: errorMsg = '오디오 디코딩 오류입니다.'; break;
            case 4: errorMsg = '지원되지 않는 오디오 형식입니다.'; break;
          }
        }
        alert(errorMsg);
      });
      
      // Blob URL 설정 및 로드
      if (recording.audioUrl) {
        audio.src = recording.audioUrl;
        audio.load();
      } else {
        throw new Error('오디오 URL이 없습니다.');
      }
      
    } catch (error) {
      console.error('재생 준비 오류:', error);
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
      // MP3로 변환하여 다운로드
      const mp3Blob = await convertToMp3(recording.blob);
      const url = URL.createObjectURL(mp3Blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `녹음${recording.number}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      handleMoreClose();
    } catch (error) {
      console.error('MP3 변환 실패, 원본 파일로 다운로드:', error);
      
      // MP3 변환 실패 시 원본 파일로 다운로드
      const url = URL.createObjectURL(recording.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `녹음${recording.number}.${getFileExtension(recording.mimeType)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      handleMoreClose();
    }
  };

  const convertToMp3 = async (audioBlob) => {
    return new Promise((resolve, reject) => {
      try {
        // Web Audio API를 사용한 간단한 변환
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();
        
        fileReader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // WAV 형식으로 변환 (브라우저에서 MP3 인코딩은 복잡함)
            const wavBlob = audioBufferToWav(audioBuffer);
            resolve(wavBlob);
          } catch (error) {
            reject(error);
          }
        };
        
        fileReader.onerror = () => reject(new Error('파일 읽기 실패'));
        fileReader.readAsArrayBuffer(audioBlob);
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const audioBufferToWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numChannels * 2; // 16-bit
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV 헤더 작성
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // 오디오 데이터 작성
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const getFileExtension = (mimeType) => {
    if (!mimeType) return 'webm';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    return 'webm';
  };

  const handleDelete = (recordingId) => {
    if (window.confirm('이 녹음을 삭제하시겠습니까?')) {
      setRecordings(prev => prev.filter(recording => recording.id !== recordingId));
      
      // 현재 재생 중인 파일이 삭제된 경우 재생 중지
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
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 250);
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
      
      <CSSTransition
        in={isVisible && !isExiting}
        timeout={250}
        classNames="page"
        appear
      >
                <Box sx={{ 
          opacity: isVisible && !isExiting ? 1 : 0,
          transition: 'all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          margin: 0, 
          padding: 0,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: 'white',
          overflowX: 'hidden',
          maxWidth: '100vw'
        }}>
          {/* 헤더 */}
          <AppBar 
            position="static" 
            sx={{ 
              backgroundColor: scrolled ? 'white' : 'transparent',
              boxShadow: scrolled ? 2 : 0,
              transition: 'all 0.3s ease',
              marginTop: 0,
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
                  목소리 녹음
                </Typography>
              </Box>
              
              {/* 오른쪽 공간 (균형 맞추기) */}
              <Box sx={{ width: 48 }} />
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ 
            py: 2, 
            pb: 12,
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100vw'
          }}>
            {recordings.length === 0 ? (
              // 녹음 내역이 없을 때 표시 (중앙 정렬)
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {/* 경고 아이콘 */}
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    backgroundColor: '#e0e0e0', 
                    borderRadius: '50%',
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
                  <Typography variant="body1" sx={{ 
                    color: '#999',
                    fontSize: '16px',
                    fontWeight: 'medium'
                  }}>
                    ... 녹음 내역이 없습니다 ...
                  </Typography>
                </Box>
              </Box>
            ) : (
              // 녹음 내역이 있을 때 표시할 리스트 (상단부터)
              <Box sx={{ 
                width: '100%',
                overflowX: 'hidden'
              }}>
                {recordings.map((recording, index) => (
                  <Box key={recording.id} sx={{ 
                    mb: 2,                        // 하단 마진
                    p: 3,                        // 내부 패딩
                    backgroundColor: '#eef1f3ff',   // 배경색 (연한 회색)
                    borderRadius: 5,             // 모서리 둥글기
                    display: 'flex',             // 플렉스 레이아웃
                    alignItems: 'center',        // 세로 중앙 정렬
                    gap: 2,                      // 요소 간 간격
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}>
                    {/* 재생 버튼 (왼쪽) */}
                    <IconButton
                      onClick={() => handlePlayRecording(recording)}
                      sx={{
                        backgroundColor: playingId === recording.id ? '#c53030' : '#333',
                        color: 'white',
                        width: 48,
                        height: 48,
                        '&:hover': {
                          backgroundColor: playingId === recording.id ? '#a02626' : '#555'
                        }
                      }}
                    >
                      {(playingId === recording.id && !isPaused) ? 
                        <Pause sx={{ fontSize: 20 }} /> : 
                        <PlayArrow sx={{ fontSize: 20 }} />
                      }
                    </IconButton>

                    {/* 녹음 정보 (중앙) */}
                    <Box sx={{ 
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        녹음 {recording.number}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#666', 
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {recording.date} • {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                      </Typography>
                    </Box>
                    
                    {/* 더보기 버튼 (오른쪽) */}
                    <IconButton
                      onClick={(e) => handleMoreClick(e, recording.id)}
                      sx={{
                        color: '#666'
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </CSSTransition>

      {/* 하단 녹음 시작 버튼 */}
      {!showRecordingModal && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          px: 3,
          zIndex: 1000
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Mic />}
            onClick={handleStartRecording}
            sx={{
              width: '100%',
              maxWidth: 'sm',
              mx: 'auto',
              height: 56,
              backgroundColor: '#D1052E',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 1,
              '& .MuiButton-startIcon': {
                marginRight: '8px',
                marginLeft: 0
              },
              '&:hover': {
                backgroundColor: '#B8041A'
              }
            }}
          >
            녹음 시작
          </Button>
        </Box>
      )}

      {/* 녹음 중 모달 */}
      <Modal
        open={showRecordingModal}
        onClose={() => {}} // 배경 클릭으로 닫기 방지
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(2px)'
          }
        }}
      >
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f8f9fa',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          p: 4,
          pb: 6,
          transform: showRecordingModal ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 10000
        }}>
          {/* 음성 파형 애니메이션 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100px',
            mb: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '2px'
            }}>
              {audioData.map((height, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '3px',
                    height: `${height}px`,
                    backgroundColor: '#999',
                    borderRadius: '2px',
                    transition: 'height 0.1s ease'
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* 녹음 시간 */}
          <Typography variant="h4" sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: '#333',
            mb: 4
          }}>
            {formatTime(recordingTime)}
          </Typography>

          {/* 버튼들 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            px: '0px', 
            width: '100%'
          }}>
            {/* 재시작 버튼 */}
            <IconButton
              onClick={handleRestartRecording}
              sx={{
                width: 60,
                height: 60,
                backgroundColor: 'white',
                border: '2px solid #ddd',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <Refresh sx={{ fontSize: 30, color: '#333' }} />
            </IconButton>

            {/* 완료(저장) 버튼 */}
            <Button
              variant="contained"
              onClick={handleStopRecording}
              sx={{
                backgroundColor: '#D1052E',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                minWidth: '240px',
                '&:hover': {
                  backgroundColor: '#555'
                }
              }}
            >
              저장
            </Button>
          </Box>

          {/* 하단 인디케이터 */}
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '4px',
            backgroundColor: '#ddd',
            borderRadius: '2px'
          }} />
        </Box>
      </Modal>

      {/* 더보기 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMoreClose}
        PaperProps={{
          sx: {
            minWidth: 105,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
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