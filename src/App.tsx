import React, { useState } from 'react';
import { Container, Card, Typography, Box, TextField, Paper, Button, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useEffect } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';

function App() {
  // State สำหรับข้อมูลผู้ป่วย
  const [patient, setPatient] = useState({ name: '', hn: '', an: '' });
  // State สำหรับจับเวลา
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  // State สำหรับสรุปเวลา CPR
  const [startTime, setStartTime] = useState<Date | null>(null);
  // Log state
  const [logs, setLogs] = useState<string[]>([]);
  // State สำหรับเมนู EKG
  const [activeEkg, setActiveEkg] = useState<string | null>(null);
  // State สำหรับ Dialog ยืนยันรีเซ็ต
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  // State สำหรับ Atropine
  const [atropineTimer, setAtropineTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [atropineSeconds, setAtropineSeconds] = useState(0);
  const [atropineActive, setAtropineActive] = useState(false);
  // State สำหรับ Adenaline
  const [adrenalineCount, setAdrenalineCount] = useState(0);
  const [adrenalineActive, setAdrenalineActive] = useState(false);
  const [adrenalineSeconds, setAdrenalineSeconds] = useState(0);
  const [adrenalineTimer, setAdrenalineTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  // State สำหรับเมนูย่อย Stable ของ SVT
  const [showSvtStableSubmenu, setShowSvtStableSubmenu] = useState(false);
  // State สำหรับเมนูย่อย Unstable ของ SVT
  const [showSvtUnstableSubmenu, setShowSvtUnstableSubmenu] = useState(false);
  // เพิ่ม state สำหรับแสดง/ซ่อนเมนู EKG
  const [showEkgMenu, setShowEkgMenu] = useState(false);
  // เพิ่ม state สำหรับ Snackbar
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  // เพิ่ม state สำหรับนับจำนวนครั้ง Atropine
  const [atropineCount, setAtropineCount] = useState(0);

  // เมนูย่อยแต่ละ EKG
  const ekgSubmenus: Record<string, { label: string; color: string }[]> = {
    Bradycardia: [
      { label: 'Atropine 1 mg', color: '#f57c00' },
      { label: 'Dopamine 5-20 mcg/kg/min', color: '#f57c00' },
      { label: 'Adrenaline 2-10 mcg/kg/min', color: '#f57c00' },
      { label: 'Transvenous Pacing', color: '#f57c00' },
    ],
    Asystole: [
      { label: 'Adenaline 1 :10,000', color: '#f57c00' },
      { label: '0.9%NSS 1 L IV load', color: '#f57c00' },
      { label: '7.5%NaHCO3 50 ml', color: '#f57c00' },
      { label: '50%glucose 50 ml', color: '#f57c00' },
      { label: 'RI 10 u + 50%glucose 50 ml', color: '#f57c00' },
      { label: '10%calcium 10 ml', color: '#f57c00' },
      { label: 'PRC', color: '#f57c00' },
      { label: 'FFP', color: '#f57c00' },
    ],
    PEA: [
      { label: 'Adenaline 1 :10,000', color: '#f57c00' },
      { label: '0.9%NSS 1 L IV load', color: '#f57c00' },
      { label: '7.5%NaHCO3 50 ml', color: '#f57c00' },
      { label: '50%glucose 50 ml', color: '#f57c00' },
      { label: 'RI 10 u + 50%glucose 50 ml', color: '#f57c00' },
      { label: '10%calcium 10 ml', color: '#f57c00' },
      { label: 'PRC', color: '#f57c00' },
      { label: 'FFP', color: '#f57c00' },
    ],
    VF: [
      { label: 'Defrib 200 J', color: '#f57c00' },
      { label: 'Adenaline 1 :10,000', color: '#f57c00' },
      { label: '1st Cordarone 300 mg', color: '#f57c00' },
      { label: '2nd Cordarone 150 mg', color: '#f57c00' },
      { label: '1st Lidocaine 1-1.5 mg/kg', color: '#f57c00' },
      { label: '2nd Lidocaine 0.5-0.75 mg/kg', color: '#f57c00' },
    ],
    VT: [
      { label: 'Defrib 200 J', color: '#f57c00' },
      { label: 'Adenaline 1 :10,000', color: '#f57c00' },
      { label: '1st Cordarone 300 mg', color: '#f57c00' },
      { label: '2nd Cordarone 150 mg', color: '#f57c00' },
      { label: '1st Lidocaine 1-1.5 mg/kg', color: '#f57c00' },
      { label: '2nd Lidocaine 0.5-0.75 mg/kg', color: '#f57c00' },
    ],
    SVT: [
      { label: 'Stable', color: '#f57c00' },
      { label: 'Unstable SVT', color: '#f57c00' },
    ],
    AF: [
      { label: 'Synchronized 50 J', color: '#f57c00' },
      { label: 'Synchronized 100 J', color: '#f57c00' },
      { label: 'Codarone 150 mg', color: '#f57c00' },
      { label: 'Codarone 600 mg', color: '#f57c00' },
      { label: 'Codarone 900 mg', color: '#f57c00' },
    ],
    'Sinus Tachycardia': [
      { label: 'Synchronized 50 J', color: '#f57c00' },
      { label: 'Synchronized 100 J', color: '#f57c00' },
      { label: 'Labeterol 10 mg', color: '#f57c00' },
    ],
  };

  // Timer logic (พื้นฐาน)
  React.useEffect(() => {
    let interval: ReturnType<typeof setTimeout> | null = null;
    if (timerActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (!timerActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive]);

  // Effect สำหรับจับเวลา Atropine
  useEffect(() => {
    if (atropineActive && atropineSeconds < 180) {
      const timer = setInterval(() => setAtropineSeconds(s => s + 1), 1000);
      setAtropineTimer(timer);
      return () => clearInterval(timer);
    } else if (atropineActive && atropineSeconds >= 180) {
      setAtropineActive(false);
      setAtropineSeconds(0);
      if (atropineTimer) clearInterval(atropineTimer);
      addLog('ครบเวลา Atropine 1 mg');
      // เล่นเสียงครบ 3 นาที
      playSound('atropineครบ3นาที.mp3');
    }
    // eslint-disable-next-line
  }, [atropineActive, atropineSeconds]);

  // Reset Atropine เมื่อ reset หรือเริ่มจับเวลาใหม่
  useEffect(() => {
    if (!timerActive) {
      setAtropineSeconds(0);
      setAtropineActive(false);
      if (atropineTimer) clearInterval(atropineTimer);
      setAtropineCount(0); // Reset count when resetting
    }
    // eslint-disable-next-line
  }, [timerActive]);

  // Effect สำหรับจับเวลา Adenaline
  useEffect(() => {
    if (adrenalineActive && adrenalineSeconds < 180) {
      const timer = setInterval(() => setAdrenalineSeconds(s => s + 1), 1000);
      setAdrenalineTimer(timer);
      return () => clearInterval(timer);
    } else if (adrenalineActive && adrenalineSeconds >= 180) {
      setAdrenalineActive(false);
      setAdrenalineSeconds(0);
      if (adrenalineTimer) clearInterval(adrenalineTimer);
      addLog('ครบเวลา Adenaline 3 นาที');
      playSound('ครบ3นาทีอดีนารีน.mp3');
    }
    // eslint-disable-next-line
  }, [adrenalineActive, adrenalineSeconds]);

  // แจ้งเตือนทุก 2 นาทีด้วยเสียง alert.mp3
  useEffect(() => {
    if (timerActive && seconds > 0 && seconds % 120 === 0) {
      playSound('alert.mp3');
    }
    // eslint-disable-next-line
  }, [seconds, timerActive]);

  // ฟังก์ชันแปลงวินาทีเป็น mm:ss
  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ฟังก์ชันเพิ่ม log
  const addLog = (msg: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('th-TH', { hour12: false });
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // ฟังก์ชันเพิ่ม log ข้อมูลผู้ป่วยไว้บนสุด
  const addPatientInfoLog = () => {
    const info = `[HN: ${patient.hn || '-'} | AN: ${patient.an || '-'} | ชื่อ: ${patient.name || '-'}]`;
    setLogs((prev) => [info, ...prev]);
  };

  // ฟังก์ชันเพิ่ม log สรุปเวลาการทำ CPR
  const addSummaryLog = (start: Date | null, stop: Date | null) => {
    if (start && stop) {
      const diffMs = stop.getTime() - start.getTime();
      const m = Math.floor(diffMs / 60000);
      const s = Math.floor((diffMs / 1000) % 60);
      const summary = `สรุปเวลาการทำ CPR: เริ่ม ${start.toLocaleTimeString('th-TH', { hour12: false })} - หยุด ${stop.toLocaleTimeString('th-TH', { hour12: false })} (รวม ${m} นาที ${s} วินาที)`;
      setLogs((prev) => [...prev, summary]);
    }
  };

  // ฟังก์ชันเล่นเสียงจาก public/sounds
  const playSound = (filename: string) => {
    const audio = new Audio(`/sounds/${filename}`);
    audio.play();
  };

  // เพิ่มฟังก์ชัน handleBackToHome
  const handleBackToHome = () => {
    setActiveEkg(null);
    setShowSvtStableSubmenu(false);
    setShowSvtUnstableSubmenu(false);
    // setShowEkgMenu(false); // ไม่ต้องย่อเมนูเมื่อกดกลับหน้าหลัก
  };

  // ฟังก์ชันคัดลอก log
  const handleCopyLogs = () => {
    const text = logs.join('\n');
    navigator.clipboard.writeText(text);
    setCopySnackbarOpen(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 3, textAlign: 'center' }}>
        <img src="/assets/icon.png" alt="SMART CPR Logo" style={{ width: '60%', maxWidth: 220, display: 'block', margin: '0 auto 18px auto' }} />
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: 'Kanit', mt: 1 }}>
          แอปจับเวลาและบันทึกเหตุการณ์ CPR  ICU ศัลยกรรม 1
        </Typography>
      </Paper>

      {/* Patient Info */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ fontFamily: 'Kanit', textAlign: 'center', display: 'block', width: '100%' }}>
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          ข้อมูลผู้ป่วย
        </Typography>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <TextField
              label="ชื่อผู้ป่วย"
              fullWidth
              value={patient.name}
              onChange={e => setPatient({ ...patient, name: e.target.value })}
              sx={{ fontFamily: 'Kanit' }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="HN"
              fullWidth
              value={patient.hn}
              onChange={e => setPatient({ ...patient, hn: e.target.value })}
              sx={{ fontFamily: 'Kanit' }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="AN"
              fullWidth
              value={patient.an}
              onChange={e => setPatient({ ...patient, an: e.target.value })}
              sx={{ fontFamily: 'Kanit' }}
            />
          </Box>
        </Grid>
      </Card>

      {/* Timer Section */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ fontFamily: 'Kanit' }}>
          <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          เวลานับขึ้น (CPR)
        </Typography>
        <Typography variant="h2" fontWeight={700} color="primary" sx={{ fontFamily: 'Kanit', mb: 2 }}>
          {formatTime(seconds)}
        </Typography>
        <Stack direction="column" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => {
              setTimerActive(true);
              setStartTime(new Date());
              addLog('เริ่มจับเวลา');
            }}
            disabled={timerActive}
            sx={{ fontFamily: 'Kanit', minWidth: 120, borderRadius: 3 }}
          >
            <PlayArrowIcon sx={{ mr: 1 }} />
            Start
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => {
              setTimerActive(false);
              const stop = new Date();
              addPatientInfoLog();
              addLog('หยุดจับเวลา');
              addSummaryLog(startTime, stop);
            }}
            disabled={!timerActive}
            sx={{ fontFamily: 'Kanit', minWidth: 120, borderRadius: 3 }}
          >
            <StopIcon sx={{ mr: 1 }} />
            Stop
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => setResetDialogOpen(true)}
            sx={{ fontFamily: 'Kanit', minWidth: 120, borderRadius: 3 }}
          >
            <ReplayIcon sx={{ mr: 1 }} />
            Reset
          </Button>
        </Stack>
      </Card>

      {/* Section EKG & สถานการณ์หัวใจ */}
      {/* ส่วนแสดงเมนู EKG & สถานการณ์หัวใจ */}
      {!showEkgMenu ? (
        <Button variant="contained" size="large" fullWidth onClick={() => setShowEkgMenu(true)}
          sx={{ background: '#2563eb', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 24, borderRadius: 6, minHeight: 64, my: 4, boxShadow: 4, letterSpacing: 1 }}>
          EKG & สถานการณ์หัวใจ
        </Button>
      ) : (
        <>
          <Button variant="contained" size="large" fullWidth onClick={() => setShowEkgMenu(false)}
            sx={{ background: '#2563eb', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 24, borderRadius: 6, minHeight: 64, my: 4, boxShadow: 4, letterSpacing: 1 }}>
            EKG & สถานการณ์หัวใจ
          </Button>
          <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ fontFamily: 'Kanit', textAlign: 'center', display: 'block', width: '100%' }}>
              <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              EKG & สถานการณ์หัวใจ
            </Typography>
            {activeEkg === null ? (
              <Stack direction="column" spacing={2} alignItems="center">
                <Button variant="contained" onClick={() => setActiveEkg('Bradycardia')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  BRADYCARDIA
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('Asystole')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  ASYSTOLE
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('PEA')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  PEA
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('VF')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  VF
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('VT')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  VT
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('SVT')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  SVT
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('AF')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  AF
                </Button>
                <Button variant="contained" onClick={() => setActiveEkg('Sinus Tachycardia')}
                  sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 20, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 56, boxShadow: 3, px: 3, '&:hover': { background: '#bb4d00', boxShadow: 6 } }}>
                  SINUS TACHYCARDIA
                </Button>
              </Stack>
            ) : (
              <Stack direction="column" spacing={2} alignItems="center">
                {!(activeEkg === 'SVT' && (showSvtStableSubmenu || showSvtUnstableSubmenu)) && (
                  <Button variant="outlined" color="primary" onClick={handleBackToHome} sx={{ fontFamily: 'Kanit', fontWeight: 700, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, px: 4, py: 1, mb: 1 }}>
                    กลับหน้าหลัก
                  </Button>
                )}
                {activeEkg === 'SVT' && showSvtStableSubmenu ? (
                  <>
                    {/* เมนูย่อย Stable SVT */}
                    <Button variant="outlined" color="primary" onClick={handleBackToHome} sx={{ fontFamily: 'Kanit', fontWeight: 700, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, px: 4, py: 1, mb: 1 }}>
                      กลับหน้าหลัก
                    </Button>
                    <Button variant="contained" sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: '#bb4d00', boxShadow: 6, opacity: 0.9 } }} onClick={() => addLog('SVT Stable: Carotid massage')}>
                      Carotid massage
                    </Button>
                    <Button variant="contained" sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: '#bb4d00', boxShadow: 6, opacity: 0.9 } }} onClick={() => addLog('SVT Stable: Valsalva (เป่า syringe 1 ml)')}>
                      Valsalva (เป่า syringe 1 ml)
                    </Button>
                    <Button variant="contained" sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: '#bb4d00', boxShadow: 6, opacity: 0.9 } }} onClick={() => addLog('SVT Stable: Adenosine 6 mg')}>
                      Adenosine 6 mg
                    </Button>
                    <Button variant="contained" sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: '#bb4d00', boxShadow: 6, opacity: 0.9 } }} onClick={() => addLog('SVT Stable: Adenosine 12 mg')}>
                      Adenosine 12 mg
                    </Button>
                  </>
                ) : activeEkg === 'SVT' && showSvtUnstableSubmenu ? (
                  <>
                    {/* เมนูย่อย Unstable SVT */}
                    <Button variant="outlined" color="primary" onClick={handleBackToHome} sx={{ fontFamily: 'Kanit', fontWeight: 700, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, px: 4, py: 1, mb: 1 }}>
                      กลับหน้าหลัก
                    </Button>
                    <Button variant="contained" sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: '#bb4d00', boxShadow: 6, opacity: 0.9 } }} onClick={() => addLog('SVT Unstable: Synchronized 50 J')}>
                      Synchronized 50 J
                    </Button>
                    <Button variant="contained" sx={{ background: '#f57c00', color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: '#bb4d00', boxShadow: 6, opacity: 0.9 } }} onClick={() => addLog('SVT Unstable: Synchronized 100 J')}>
                      Synchronized 100 J
                    </Button>
                  </>
                ) : (
                  ekgSubmenus[activeEkg]?.map((item, idx) => {
                    if (activeEkg === 'SVT' && item.label === 'Stable') {
                      return (
                        <Button key={idx} variant="contained" onClick={() => {
                          addLog(`เลือก SVT: Stable ที่เวลา ${formatTime(seconds)}`);
                          setShowSvtStableSubmenu(true);
                        }}
                          sx={{ background: item.color, color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: item.color, boxShadow: 6, opacity: 0.9 } }}>
                          {item.label}
                        </Button>
                      );
                    }
                    if (activeEkg === 'SVT' && item.label === 'Unstable SVT') {
                      return (
                        <Button key={idx} variant="contained" onClick={() => {
                          addLog(`เลือก SVT: Unstable SVT ที่เวลา ${formatTime(seconds)}`);
                          setShowSvtUnstableSubmenu(true);
                        }}
                          sx={{ background: item.color, color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: item.color, boxShadow: 6, opacity: 0.9 } }}>
                          {item.label}
                        </Button>
                      );
                    }
                    if (item.label.toLowerCase().includes('adrenaline') || item.label.toLowerCase().includes('adenaline')) {
                      return (
                        <Button
                          key={idx}
                          variant="contained"
                          onClick={() => {
                            setAdrenalineCount(adrenalineCount + 1);
                            setAdrenalineActive(true);
                            setAdrenalineSeconds(0);
                            addLog(`${activeEkg}: ${item.label} ครั้งที่ ${adrenalineCount + 1} ที่เวลา ${formatTime(seconds)}`);
                            playSound('ให้ยาAdenaline.mp3');
                          }}
                          disabled={adrenalineActive || !timerActive}
                          sx={{ background: item.color, color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: item.color, boxShadow: 6, opacity: 0.9 } }}
                        >
                          {adrenalineActive ? `${item.label} (${adrenalineCount + 1}) [${formatTime(180 - adrenalineSeconds)}]` : `${item.label} (${adrenalineCount})`}
                        </Button>
                      );
                    }
                    if (activeEkg === 'Bradycardia' && item.label === 'Atropine 1 mg') {
                      return (
                        <Button
                          key={idx}
                          variant="contained"
                          onClick={() => {
                            const nextCount = atropineCount + 1;
                            setAtropineCount(nextCount);
                            setAtropineActive(true);
                            setAtropineSeconds(0);
                            addLog(`Bradycardia: Atropine 1 mg ครั้งที่ ${nextCount} ที่เวลา ${formatTime(seconds)}`);
                            playSound(`atropineครั้งที่${nextCount}.mp3`);
                          }}
                          disabled={atropineActive || !timerActive || atropineCount >= 3}
                          sx={{ background: item.color, color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: item.color, boxShadow: 6, opacity: 0.9 } }}
                        >
                          {atropineActive ? `Atropine 1 mg (${atropineCount + 1}) [${formatTime(180 - atropineSeconds)}]` : `Atropine 1 mg (${atropineCount}/3)`}
                        </Button>
                      );
                    }
                    return (
                      <Button key={idx} variant="contained" onClick={() => addLog(`${activeEkg}: ${item.label}`)}
                        sx={{ background: item.color, color: 'white', fontWeight: 700, fontFamily: 'Kanit', fontSize: 18, borderRadius: 999, width: '100%', maxWidth: 340, minHeight: 48, boxShadow: 2, px: 2, '&:hover': { background: item.color, boxShadow: 6, opacity: 0.9 } }}>
                        {item.label}
                      </Button>
                    );
                  })
                )}
              </Stack>
            )}
          </Card>
        </>
      )}

      {/* Log Section */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ fontFamily: 'Kanit', textAlign: 'center', display: 'block', width: '100%' }}>
          <ListAltIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          บันทึกเหตุการณ์
        </Typography>
        <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}>
          {logs.map((log, index) => (
            <Typography key={index} variant="body2" sx={{ fontFamily: 'Kanit', color: 'text.secondary' }}>{log}</Typography>
          ))}
        </Box>
        <Button variant="outlined" color="primary" onClick={handleCopyLogs} sx={{ fontFamily: 'Kanit', borderRadius: 3 }}>
          <ContentCopyIcon sx={{ mr: 1 }} />
          คัดลอกบันทึก
        </Button>
      </Card>

      {/* Reset Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title">ยืนยันรีเซ็ต</DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            คุณต้องการรีเซ็ตค่าทั้งหมดที่เกี่ยวข้องกับเวลาและบันทึกหรือไม่? การรีเซ็ตจะล้างข้อมูลทั้งหมดและกลับไปที่หน้าหลัก
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={() => {
            setTimerActive(false);
            setSeconds(0);
            setStartTime(null);
            setLogs([]);
            setActiveEkg(null);
            setShowSvtStableSubmenu(false);
            setShowSvtUnstableSubmenu(false);
            setShowEkgMenu(false);
            setAtropineSeconds(0);
            setAtropineActive(false);
            setAtropineCount(0); // Reset count when resetting
            setAdrenalineCount(0);
            setAdrenalineSeconds(0);
            setAdrenalineActive(false);
            setResetDialogOpen(false);
            alert('รีเซ็ตสำเร็จ');
            playSound('รีเซ็ตสำเร็จ.mp3');
          }} color="error" variant="contained">
            รีเซ็ต
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for copying logs */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setCopySnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setCopySnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          คัดลอกบันทึกแล้ว
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
