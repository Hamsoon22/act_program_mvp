import React, { useState, useEffect } from "react";
import loginImg from "./login.png";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CSSTransition } from 'react-transition-group';
import HeaderEditable from "./components/HeaderEditable";
import {
  Calendar as CalendarIcon, User, CheckCircle2, Music2, Mic, Leaf, Pencil, Gift, FileText, Plus,
  Eye, EyeOff, Trash2, LogIn, LogOut, Play, Save, Link as LinkIcon, ArrowRight,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { api } from "./lib/api";
import { UserProvider } from "./context/UserContext";
import UserMenuButton from "./components/UserMenuButton";
import HamburgerMenu from "./components/HamburgerMenu";
import BottomNavigation from "./components/BottomNavigation";
import LoginPage from "./LoginPage";
import MainHub from "./MainHub";
import ProfilePage from "./ProfilePage";
import RuminationSurvey from "./RuminationSurvey";
import ResultPage from "./ResultPage";
import MBISurvey from "./MBISurvey";
import MBIResultPage from "./MBIResultPage";
import VoiceRec from "./VoiceRec";
import Diary from "./Diary";
import DiaryList from "./DiaryList";
import DiaryView from "./DiaryView";
import DiaryEdit from "./DiaryEdit";
import LeafShip from "./LeafShip";
import VLQSurvey from "./VLQSurvey";
import VLQResult from "./VLQResult";

/* ========== UI SHIMS ========== */
const Button = ({ className = "", variant = "default", ...props }) => (
  <button
    className={
      `inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base shadow-sm transition active:scale-[.99] ` +
      (variant === "outline"
        ? "border border-gray-300 bg-white hover:bg-gray-50"
        : variant === "ghost"
        ? "hover:bg-gray-100"
        : "bg-black text-white hover:bg-gray-800") +
      (" " + className)
    }
    {...props}
  />
);
const Input = (props) => (
  <input
    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-sky-400"
    {...props}
  />
);
const Label = ({ children, className = "" }) => (
  <label className={"text-xs sm:text-sm text-gray-600 " + className}>{children}</label>
);
const Card = ({ className = "", children }) => (
  <div className={"rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm " + className}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={"p-3 sm:p-4 md:p-6 " + className}>{children}</div>
);

const ICONS = {
  check: { label: "체크", Icon: CheckCircle2 },
  music: { label: "음악", Icon: Music2 },
  mic:   { label: "녹음", Icon: Mic },
  leaf:  { label: "나뭇잎", Icon: Leaf },
  pencil:{ label: "연필", Icon: Pencil },
  gift:  { label: "기념", Icon: Gift },
  file:  { label: "문서", Icon: FileText },
};

const TYPES = [
  { value: "assessment", label: "진단/설문" },
  { value: "practice",   label: "연습/활동" },
  { value: "content",    label: "콘텐츠" },
  { value: "milestone",  label: "마일스톤" },
  { value: "feature",    label: "앱 기능" },
];

const FEATURES = {
  survey: { label: "Rumination Scale", path: "/survey" },
  mbi:    { label: "MBI 설문",         path: "/mbi-survey" },
  voice:  { label: "목소리 녹음",       path: "/voice-rec" },
  diary:  { label: "일기 쓰기",         path: "/diary-list" },
  leaf:   { label: "나뭇잎 배 띄우기",   path: "/leaf-ship" },
};

function emptyProgram() {
  return { title: "ACT Program", dateStart: null, dateEnd: null, coach: "", weeks: [] };
}
const STORAGE_KEY = "act-program-builder-mvp";
const saveLS = (data) => {
  const replacer = (key, value) => (value instanceof Date ? value.toISOString() : value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, replacer));
};
const loadLS = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const reviver = (key, value) => {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        const d = new Date(value);
        if (!isNaN(d)) return d;
      }
      return value;
    };
    return JSON.parse(raw, reviver);
  } catch {
    return null;
  }
};

const ROLE_LS = "act-role";
const MODE_LS = "act-clientmode";
const cn = (...a) => a.filter(Boolean).join(" ");

// 날짜를 YYYY.MM.DD로 변환
function formatDateToYYYYMMDD(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function Toolbar({ clientMode, setClientMode, role, onLogout, openWeekSetup, onOpenMenu }) {
  const [copied, setCopied] = useState(false);
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);

  const copyShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="sticky top-0 z-50 -mx-4 mb-4 rounded-2xl bg-white/80 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {role === "counselor" && (
            <Button onClick={() => setClientMode((v) => !v)} variant="outline" className="rounded-2xl">
              {clientMode ? <EyeOff size={16} /> : <Eye size={16} />} {clientMode ? "빌더 보기" : "내담자 뷰"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* UserMenuButton 숨김 처리
          <UserMenuButton onClick={onOpenMenu} />
          */}
        </div>
      </div>
      {role === "counselor" && (
        <div className="flex items-center gap-2 w-full">
          {/* <Button
            variant="outline"
            onClick={openWeekSetup}
            className="flex-1 bg-gray-100 hover:bg-gray-200 border-gray-300 justify-center"
          >
            주차 설정
          </Button> */}
          <Button
            variant="outline"
            onClick={() => setShowNewProgramModal(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 border-gray-300 justify-center"
          >
            새 프로그램
          </Button>
          <Button
            variant="outline"
            onClick={copyShare}
            className="flex-1 bg-gray-100 hover:bg-gray-200 border-gray-300 justify-center"
          >
            <LinkIcon size={16} />
            {copied ? "링크 복사됨!" : "링크 복사"}
          </Button>
        </div>
      )}
      {showNewProgramModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-8 shadow-xl max-w-xs w-full text-center">
            <h2 className="text-lg font-bold mb-2">새 프로그램</h2>
            <p className="mb-4 text-gray-600">준비중입니다!<br />빠른 시일 내에 지원 예정이에요.</p>
            <Button variant="outline" onClick={() => setShowNewProgramModal(false)}>닫기</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- ProgramItemCard -----
function ProgramItemCard({ item, onChange, onRemove, clientMode, editMode, onEditModeChange, idx, weekIdx, role }) {
  const navigate = useNavigate();
  const Icon = ICONS[item.icon]?.Icon ?? FileText;
  const [open, setOpen] = useState(false);
  const isDiary = item.type === "practice";
  const isFeature = item.type === "feature";
  const selectedFeature = isFeature ? FEATURES[item.featureKey] : null;
  const diaryKey = `diary-week-${weekIdx}-item-${idx}`;
  const [diary, setDiary] = useState("");
  const [openDiary, setOpenDiary] = useState(false);
  const [diarySaved, setDiarySaved] = useState(false);

  useEffect(() => { setDiary(localStorage.getItem(diaryKey) || ""); }, [diaryKey]);
  const hasVideo = Boolean(item.videoUrl);

  useEffect(() => {
    if (!isFeature) return;
    if (!item.featureKey) {
      onChange({ featureKey: "survey", title: FEATURES.survey.label, autoTitle: true });
      return;
    }
    if (item.autoTitle && selectedFeature) {
      onChange({ title: selectedFeature.label });
    }
  }, [isFeature, item.featureKey, item.autoTitle]);

  function saveDiary() {
    localStorage.setItem(diaryKey, diary);
    setDiarySaved(true);
    setTimeout(() => setDiarySaved(false), 1200);
  }

  const FeatureOpenButton = () => (
    isFeature && selectedFeature ? (
      <Button
        variant="outline"
        className="h-7 rounded-xl px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
        onClick={() => navigate(selectedFeature.path)}
      >
        <ArrowRight size={16} />
        <span className="hidden sm:inline">이동</span>
      </Button>
    ) : null
  );

  // 종류별 아이콘 배경색 (새로운 HEX 코드)
  const typeBg = {
    assessment: { backgroundColor: '#C4EBF9' },   // 진단/설문
    practice:   { backgroundColor: '#E0F6DB' },   // 연습/활동
    content:    { backgroundColor: '#E1DFFF' },   // 콘텐츠
    milestone:  { backgroundColor: '#F2CDDE' },   // 마일스톤
    feature:    { backgroundColor: '#F9E9D5' }    // 앱 기능
  };
  return (
    <div className="flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
      <div
        className={cn("grid h-10 w-10 place-items-center rounded-xl")}
        style={typeBg[item.type] || { backgroundColor: '#f3f4f6' }}
      >
        <Icon />
      </div>
      <div className="flex-1">
        {clientMode ? (
          <>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-sm sm:text-base font-medium">{item.title}</div>
              {hasVideo && (
                <Button variant="outline" className="h-7 rounded-xl px-2 py-1 text-xs sm:text-sm" onClick={() => setOpen(true)}>
                  <Play size={14}/> <span className="hidden sm:inline">보기</span>
                </Button>
              )}
              <FeatureOpenButton />
            </div>
            <div className="text-xs sm:text-sm text-gray-500">{item.subtitle}</div>
            {/* 내부 라우팅 버튼으로 navigate 사용 */}
            {item.type === "assessment" && item.link && (
              <Button
                variant="outline"
                className="mt-2 underline flex items-center gap-1"
                style={{ color: '#1EB4E6', borderColor: '#D1EAF7' }}
                onClick={() => {
                  if (item.link && item.link.startsWith("/")) {
                    navigate(item.link);
                  } else if (item.link) {
                    window.open(item.link, "_blank");
                  }
                }}
              >
                진단하기 바로가기
                <ArrowRight size={18} style={{marginLeft: 2}} />
              </Button>
            )}
            {isDiary && (
              <div className="mt-3">
                <Button variant="outline" className="mb-2" onClick={() => setOpenDiary(v => !v)}>
                  <Pencil size={16} />
                  <span className="hidden sm:inline">{openDiary ? "입력창 닫기" : "활동 기록하기"}</span>
                </Button>
                {openDiary && (
                  <div>
                    <Label>나의 기록</Label>
                    <textarea className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-sky-400" rows={6} value={diary} onChange={e => setDiary(e.target.value)} placeholder="오늘의 활동 내용을 자유롭게 써보세요." />
                    <Button className="mt-2" onClick={saveDiary}><Save size={16} /> <span className="hidden sm:inline">저장하기</span></Button>
                    {diarySaved && (<span className="ml-3 text-xs sm:text-sm text-green-500">저장되었습니다!</span>)}
                  </div>
                )}
                {diary && !openDiary && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-2 text-sm sm:text-base text-gray-700">
                    <b>나의 기록:</b>
                    <div className="mt-1 whitespace-pre-line">{diary}</div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : editMode && role === "counselor" ? (
          <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label>제목</Label>
              <Input value={item.title} onChange={(e) => onChange({ title: e.target.value, autoTitle: false })} />
            </div>
            <div>
              <Label>종류</Label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base"
                value={item.type}
                onChange={(e) => {
                  const nextType = e.target.value;
                  if (nextType === "feature") {
                    const needsKey = !item.featureKey;
                    const needsTitle = !item.title;
                    onChange({
                      type: nextType,
                      ...(needsKey ? { featureKey: "survey" } : null),
                      ...(needsTitle ? { title: FEATURES.survey.label, autoTitle: true } : null),
                    });
                  } else {
                    onChange({ type: nextType });
                  }
                }}
              >
                {TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            {isFeature && (
              <div className="md:col-span-3">
                <Label>연결할 앱 기능</Label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base"
                  value={item.featureKey || "survey"}
                  onChange={(e) => onChange({ featureKey: e.target.value })}
                >
                  {Object.entries(FEATURES).map(([key, f]) => (
                    <option key={key} value={key}>{f.label} ({f.path})</option>
                  ))}
                </select>
                {selectedFeature && (
                  <div className="mt-1 text-xs sm:text-sm text-gray-500">
                    선택됨: {selectedFeature.label} → <code>{selectedFeature.path}</code>
                  </div>
                )}
              </div>
            )}
            <div className="md:col-span-2">
              <Label>부제 / 설명</Label>
              <Input value={item.subtitle} onChange={(e) => onChange({ subtitle: e.target.value })} />
            </div>
            <div>
              <Label>아이콘</Label>
              <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base" value={item.icon} onChange={(e) => onChange({ icon: e.target.value })}>
                {Object.entries(ICONS).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>
            {item.type === "assessment" && (
              <div className="md:col-span-3">
                <Label>진단/설문 링크</Label>
                <Input placeholder="설문/진단 링크 입력" value={item.link || ""} onChange={e => onChange({ link: e.target.value })} />
              </div>
            )}
            {item.type === "content" && (
              <div className="md:col-span-3">
                <Label>동영상 링크 (YouTube/MP4)</Label>
                <Input placeholder="https://youtu.be/..." value={item.videoUrl || ""} onChange={(e) => onChange({ videoUrl: e.target.value })} />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-sm sm:text-base font-medium">{item.title}</div>
              {hasVideo && (
                <Button variant="outline" className="h-7 rounded-xl px-2 py-1 text-xs sm:text-sm" onClick={() => setOpen(true)}>
                  <Play size={14}/> <span className="hidden sm:inline">보기</span>
                </Button>
              )}
              <FeatureOpenButton />
            </div>
            <div className="text-xs sm:text-sm text-gray-500">{item.subtitle}</div>
            {item.type === "assessment" && item.link && (
              <Button
                variant="outline"
                className="mt-2 text-sky-600 underline"
                onClick={() => {
                  if (item.link && item.link.startsWith("/")) {
                    navigate(item.link);
                  } else if (item.link) {
                    window.open(item.link, "_blank");
                  }
                }}
              >
                진단하기 바로가기
              </Button>
            )}
          </>
        )}
      </div>
      {!clientMode && role === "counselor" && (
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => { onEditModeChange(editMode ? false : true); }}>
            {editMode ? <Save size={16} /> : <Pencil size={16} />}
            <span className="hidden sm:inline">{editMode ? "저장" : "수정"}</span>
          </Button>
          <Button variant="ghost" onClick={onRemove}><Trash2 size={16}/><span className="hidden sm:inline">삭제</span></Button>
        </div>
      )}
      {clientMode && hasVideo && open &&  <VideoModal
                url={item.videoUrl}
                onClose={() => setOpen(false)}
                description={item.description || item.subtitle || item.title}
              /> }
    </div>
  );
}

// 아래 WeekEditor, VideoModal, AppHome, App 등은 기존 코드 그대로 두세요!
// ----- WeekEditor -----
function WeekEditor({ week, onChange, onRemove, clientMode, role, weekIdx, programMasterId, reloadWeeks }) {
  const [editItemIdx, setEditItemIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleAddWeekToDB = async () => {
    setErr("");
    setLoading(true);
    try {
      const dateStr = formatDateToYYYYMMDD(week.dateTag);
      await api.createProgramWeek({
        programMasterId,
        programWeekName: week.weekLabel,
        programWeekDate: dateStr,
      });
      alert("주차(DB) 저장 성공!");
      if (reloadWeeks) reloadWeeks();
    } catch (e) {
      setErr(e.message || "주차 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeekToDB = async () => {
    setErr("");
    setLoading(true);
    try {
      const dateStr = formatDateToYYYYMMDD(week.dateTag);
      if (!week.id) {
        setErr("DB id값 없음 (먼저 저장하세요)");
        setLoading(false);
        return;
      }
      await api.updateProgramWeek(week.id, {
        programMasterId,
        programWeekName: week.weekLabel,
        programWeekDate: dateStr,
      });
      alert("주차(DB) 수정 성공!");
      if (reloadWeeks) reloadWeeks();
    } catch (e) {
      setErr(e.message || "주차 수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeekFromDB = async () => {
    setErr("");
    setLoading(true);
    try {
      if (!week.id) {
        setErr("DB id값 없음 (먼저 저장하세요)");
        setLoading(false);
        return;
      }
      await api.deleteProgramWeek(week.id);
      alert("주차(DB) 삭제 성공!");
      if (reloadWeeks) reloadWeeks();
    } catch (e) {
      setErr(e.message || "주차 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (role !== "counselor") return;
    const newItem = {
      icon: "file",
      type: "feature",
      featureKey: "survey",
      title: FEATURES.survey.label,
      autoTitle: true,
      subtitle: "설명",
      done: false,
      videoUrl: ""
    };
    const newItems = [...week.items, newItem];
    onChange({ ...week, items: newItems });
    setEditItemIdx(newItems.length - 1);
  };
  const updateItem = (idx, patch) => {
    const items = week.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange({ ...week, items });
  };
  const removeItem = (idx) => {
    if (role !== "counselor") return;
    const items = week.items.filter((_, i) => i !== idx);
    onChange({ ...week, items });
    setEditItemIdx(null);
  };
  return (
    <Card className="mb-3 sm:mb-4">
      <CardContent>
        <div className="mb-2 sm:mb-3 flex items-center justify-between flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3">
            {clientMode ? (
              <>
                <span className="rounded-full bg-gray-900 px-3 py-1 text-xs sm:text-sm font-medium text-white">{week.weekLabel || "주차"}</span>
                {week.dateTag && (<span className="ml-2 text-xs sm:text-sm text-gray-600">{week.dateTag instanceof Date ? week.dateTag.toLocaleDateString() : ""}</span>)}
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Input className="w-24" value={week.weekLabel} onChange={(e) => onChange({ ...week, weekLabel: e.target.value })} placeholder="1주차" disabled={role !== "counselor"} />
                <DatePicker selected={week.dateTag} onChange={(date) => onChange({ ...week, dateTag: date })} dateFormat="yyyy.MM.dd" placeholderText="날짜" className="w-36 rounded-xl border px-2 py-1 text-sm sm:text-base" disabled={role !== "counselor"} />
              </div>
            )}
          </div>
          {role === "counselor" && (
            <>
              <Button variant="ghost" onClick={onRemove}>
                <Trash2 size={16} /><span className="hidden sm:inline">삭제(프론트)</span>
              </Button>
              <Button variant="outline" color="red" onClick={handleDeleteWeekFromDB} disabled={loading}>
                <Trash2 size={16} /><span className="hidden sm:inline">DB 삭제</span>
              </Button>
            </>
          )}
        </div>
        <div className="space-y-2 sm:space-y-3">
          {week.items.map((item, idx) => (
            <ProgramItemCard
              key={idx}
              item={item}
              onChange={(patch) => updateItem(idx, patch)}
              onRemove={() => removeItem(idx)}
              clientMode={clientMode}
              editMode={editItemIdx === idx}
              onEditModeChange={(on) => setEditItemIdx(on ? idx : null)}
              idx={idx}
              weekIdx={weekIdx}
              role={role}
            />
          ))}
        </div>
        {!clientMode && role === "counselor" && (
          <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-4 flex-wrap">
            <Button onClick={addItem}><Plus size={16} /><span className="hidden sm:inline">프로그램 추가(프론트)</span></Button>
            <Button onClick={handleAddWeekToDB} disabled={loading}>
              <Save size={16} /><span className="hidden sm:inline">{loading ? "저장 중..." : "DB 저장"}</span>
            </Button>
            <Button onClick={handleUpdateWeekToDB} disabled={loading}>
              <Pencil size={16} /><span className="hidden sm:inline">{loading ? "수정 중..." : "DB 수정"}</span>
            </Button>
            {err && <span className="text-sm sm:text-base text-red-500">{err}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----- VideoModal -----
function getYouTubeId(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}
// ----- VideoModal -----
function VideoModal({ url, onClose, description }) {
  const yt = getYouTubeId(url);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-2 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardContent>
            {yt ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${yt}`}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : url?.match(/\.mp4($|\?)/i) ? (
              <video className="w-full rounded-xl" src={url} controls />
            ) : (
              <div className="text-sm sm:text-base text-gray-600">
                이 링크는 임베드할 수 없어요. <a className="text-sky-600 underline" href={url} target="_blank" rel="noreferrer">새 탭에서 열기</a>
              </div>
            )}

            {/* === 설명 추가 === */}
            {description && (
              <div className="mt-4 text-gray-700 whitespace-pre-line text-base">{description}</div>
            )}

            <div className="mt-4 text-right"><Button variant="outline" onClick={onClose}>닫기</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// ----- WeekSetup -----
function WeekSetup({ initialWeeks, onConfirm, onCancel }) {
  const [weeks, setWeeks] = useState(initialWeeks);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
        <h2 className="text-lg font-bold mb-4">주차 설정</h2>
        <div className="mb-4">
          <Label>주차 수</Label>
          <Input
            type="number"
            min="1"
            max="20"
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onConfirm(weeks)} className="flex-1">
            확인
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}

// ----- AppHome -----
function AppHome() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // 'counselor' | 'client' | null
  const programMasterId = 1;
  const [activeTab, setActiveTab] = useState('home');
  const [isExiting, setIsExiting] = useState(false);

  const [clientMode, setClientMode] = useState(() => {
    const saved = localStorage.getItem("act-clientmode");
    if (saved === "1") return true;
    if (saved === "0") return false;
    return role === "client";
  });


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'mypage') {
      console.log('App: Starting exit animation to profile');
      setIsExiting(true);
      setTimeout(() => {
        console.log('App: Navigating to profile');
        navigate('/profile');
      }, 300);
    }
    // 'home' tab은 이미 홈에 있으므로 아무것도 하지 않음
  };

  // ====== 하드코딩된 weeks 배열 ======
  const hardCodedWeeks = [
    {
      weekLabel: "1주차",
      dateTag: null,
      items: [
        {
          icon: "check",
          type: "assessment",
          title: "MBI (Malasch Burnout Inventory)",
          subtitle: "진단하기",
          link: "/mbi-survey",
        },
        {
          icon: "music",
          type: "content",
          title: "호흡 및 일상 명상하기",
          subtitle: "링크 임베드",
          videoUrl: "https://www.youtube.com/embed/BY6pJb5zEQA",
           // 설명 추가!
           description: `
        호흡 명상
        
        복식 호흡을 하면서 호흡 명상을 해보도록 하겠습니다. 처음 연습해 보는 것이라면, 왼손을 가슴 위에, 오른손을 배 위에 두고 가슴 보다는 배(오른손)가 움직이도록 하면서 연습해 보는 것이 좋습니다. 호흡 명상을 할 때 중요한 것은 호흡을 천천히 하는 것입니다. 숨을 천천히 하나, 둘, 셋 들이쉬고 잠시 멈추어 있다가(하나, 둘, 셋) 다시 천천히 내쉽니다. 하나, 둘, 셋, 넷, 그리고 잠시 멈춥니다(하나, 둘, 셋). 만약 천천히 내쉬는 것이 어렵다면, 마치 초를 불 때처럼 입을 조그맣게 모아서 입으로 천천히 내쉽니다.
        
        이렇게 몇 번 숨을 들이쉬고 내쉬면서 호흡이 내 코와 입을 통해 몸으로 들어가는 느낌, 이 숨을 통해 내 몸이 변화되는 것을 느껴 봅니다. 이 때도 다양한 생각과 느낌이 왔다 갈 수 있습니다. 그러면 감정이나 생각이 왔다 갔다는 것을 알아차리고 다시 부드럽게 호흡으로 돌아옵니다.
                `,
        }
      ]
    },
    {
      weekLabel: "2주차",
      dateTag: null,
      items: [
        {
          icon: "check",
          type: "assessment",
          title: "Rumination Scale",
          subtitle: "진단하기",
          link: "/survey",
        },
        {
          icon: "music",
          type: "content",
          title: "mindfulness 영상 보기",
          subtitle: "마인드풀니스 유튜브",
          videoUrl: "https://www.youtube.com/embed/3nwwKbM_vJc",
          description: `A. Erik Satie - Gymnopédie No.1 (연주: 피아니스트 문선영)

먼저 호흡에 집중해 보면서, 숨이 내 몸에 들어가고 나가는 느낌을 느껴 봅니다.
음악이 시작되면, 음악이 좋다, 나쁘다와 같이 판단하는 마음을 ‘끄고,’ 대신 소리가 만들어 내는 공명, 소리의 변화, 조성의 변경과 같이 순간 순간 변화되는 현재의 음악에 주의를 기울입니다. 이 때 마음 속에는 여느 때와 같이 많은 생각과 감정이 왔다 갈 것입니다. 이 생각과 감정이 찾아왔다는 것을 알아차리고, 다시금 부드럽게 음악을 듣는 현재로 돌아옵니다.

B. J.S. Bach: Invention No. 1 in C Major, BWV 772a & Invention No. 2 in C Minor, BWV 773 (연주: 피아니스트 문선영)

첫 곡을 통해 개방된 주의력(open attention)을 연습해 보았다면, 이번에는 집중된 주의력(focused attention)을 연습해 보도록 하겠습니다. 이렇게 함으로서 주어지는 자극, 마음 속에서 일어나는 많은 생각, 감정에 주의를 ‘빼앗기는’ 것이 아니라 내가 주도적으로 나의 주의력을 줄 자극을 선택할 수 있는 연습이 됩니다.

두 개의 성부로 되어 있는 피아노 곡을 들으면서 특정 소리에만 주의를 기울이는 연습을 해보겠습니다. 처음에는 주어지는 악보를 보면서 연습해 보아도 좋습니다. 주의를 자꾸만 다른 성부에 빼앗기곤 하겠지만, 연습이 지속되면서 점차로 주의력을 스스로 조절할 수 있는 자신을 발견하게 될 것입니다.
`,
},
          
        {
          icon: "mic",
          type: "feature",
          title: "목소리 녹음하기",
          featureKey: "voice",
          subtitle: "녹음 기능",
        },
        {
          icon: "leaf",
          type: "feature",
          title: "나뭇잎배 보내기",
          featureKey: "leaf",
          subtitle: "나뭇잎 배 띄우기",
        }
      ]
    },
    {
      weekLabel: "3주차",
      dateTag: null,
      items: [
        {
          icon: "check",
          type: "assessment",
          title: "VLQ 진단하기",
          subtitle: "내 삶의 가치 찾기",
          link: "/vlq-survey",
        },
        {
          icon: "pencil",
          type: "feature",
          title: "일기쓰기",
          featureKey: "diary",
          subtitle: "일기 쓰기 기능",
        }
      ]
    },
    {
      weekLabel: "4주차",
      dateTag: null,
      items: [
        {
          icon: "gift",
          type: "milestone",
          title: "수고하셨습니다.",
          subtitle: "완주!"
        }
      ]
    }
  ];

  // ====== 여기서만 하드코딩(초기값) ======
  const [program, setProgram] = useState(() => ({
    title: "ACT Program",
    dateStart: null, dateEnd: null, coach: "",
    weeks: hardCodedWeeks
  }));

  // 이하 기존 코드 그대로
  const [showWeekSetup, setShowWeekSetup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const route = useLocation();
  

  useEffect(() => saveLS(program), [program]);
  useEffect(() => {
    if (role) localStorage.setItem(ROLE_LS, role);
    else localStorage.removeItem(ROLE_LS);
  }, [role]);
  useEffect(() => {
    localStorage.setItem(MODE_LS, clientMode ? "1" : "0");
  }, [clientMode]);
  useEffect(() => {
    if (showMenu) setShowMenu(false);
    if (showProfile) setShowProfile(false);
  }, [route.pathname]);
  useEffect(() => {
    if (showMenu) setShowMenu(false);
    if (showProfile) setShowProfile(false);
  }, [role]);

  const onLogout = () => {
    setShowMenu(false);
    setShowProfile(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem(ROLE_LS);
    localStorage.removeItem(MODE_LS);
    navigate("/login", { replace: true });
  };

  const generateWeeks = (n) => {
    if (role !== "counselor") return;
    const weeks = Array.from({ length: n }).map((_, idx) => ({ weekLabel: `${idx + 1}주차`, dateTag: null, items: [] }));
    setProgram((p) => ({ ...p, weeks }));
  };
  const openWeekSetup = () => setShowWeekSetup(true);
  const onConfirmWeeks = (n) => { generateWeeks(n); setShowWeekSetup(false); };
  const addWeek = () => {
    if (role === "counselor") {
      setProgram({ ...program, weeks: [...program.weeks, { weekLabel: `${program.weeks.length + 1}주차`, dateTag: null, items: [] }] });
    }
  };
  const changeWeek = (idx, patch) => setProgram({ ...program, weeks: program.weeks.map((w, i) => (i === idx ? patch : w)) });
  const removeWeek = (idx) => {
    if (role === "counselor") {
      setProgram({ ...program, weeks: program.weeks.filter((_, i) => i !== idx) });
    }
  };

  return (
    <>
      <style>
        {`
          .fade-container {
            opacity: 1;
            transition: opacity 300ms ease-out;
          }
          .fade-container.exiting {
            opacity: 0;
          }
        `}
      </style>
      <div 
        className={`fade-container ${isExiting ? 'exiting' : ''}`}
        style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f8f9fa',
          paddingBottom: '100px'
        }}
      >
        {/* 상단 그라데이션+모션 헤더 */}
        <div
          className="animate-gradient-xy"
          style={{
            background: 'linear-gradient(135deg, #A5E1F5 0%, #F0C5D9 100%)',
            backgroundSize: '400% 400%',
            padding: '2rem 1rem 1.5rem 1rem',
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
            transition: 'background-position 1s ease',
            position: 'relative'
          }}
        >
          <div className="max-w-md mx-auto" style={{position: 'relative'}}>
            <img 
              src={loginImg} 
              alt="login graphic" 
              style={{
                width: 150, 
                height: 150, 
                objectFit: 'contain', 
                position: 'absolute', 
                right: '0px', 
                top: '0px', 
                zIndex: 1, 
                pointerEvents: 'none',
                opacity: 0.85
              }} 
            />
            <div className="flex items-center gap-4" style={{minHeight: 120}}>
              <h1 className="text-2xl font-bold text-black mb-4 leading-tight z-10" style={{position: 'relative', zIndex: 2}}>
                ACT for Burn Out<br />
                in College<br />
                Students
              </h1>
            </div>
            {/* 날짜 정보 */}
            <div className="bg-white/95 rounded-full px-3 py-1.5 mb-2 flex items-center gap-2" style={{position: 'relative', zIndex: 2}}>
              <CalendarIcon size={16} className="text-gray-600" />
              <span className="text-gray-800 font-medium text-sm">
                2025.10.21 ~ 2025.11.11
              </span>
            </div>
            {/* 강사 정보 */}
            <div className="bg-white/95 rounded-full px-3 py-1.5 flex items-center gap-2" style={{position: 'relative', zIndex: 2}}>
              <User size={16} className="text-gray-600" />
              <span className="text-gray-800 font-medium text-sm">김지은 교수님</span>
            </div>
          </div>
        </div>

        {/* 하단 흰색 콘텐츠 영역 */}
        <div className="px-4 py-6 bg-white" style={{ minHeight: '60vh' }}>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">번아웃 회복 워크샵</h2>

          {role === "counselor" && !clientMode && (
            <div className="max-w-md mx-auto mb-6">
              <Toolbar
                clientMode={clientMode}
                setClientMode={setClientMode}
                role={role}
                onLogout={onLogout}
                openWeekSetup={openWeekSetup}
                onOpenMenu={() => setShowMenu(true)}
              />
            </div>
          )}

          {role === "counselor" && program.weeks.length === 0 && (
            <div className="max-w-md mx-auto rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500 bg-gray-50">
              주차가 없습니다. 우측 상단의 <b>주차 설정</b> 버튼을 눌러 1~20주를 생성하세요.
            </div>
          )}

          <div className="max-w-md mx-auto space-y-4">
            {program.weeks.map((week, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <WeekEditor
                  week={week}
                  onChange={(w) => changeWeek(i, w)}
                  onRemove={() => removeWeek(i)}
                  clientMode={clientMode}
                  role={role}
                  weekIdx={i}
                  programMasterId={programMasterId}
                  reloadWeeks={undefined}
                />
              </motion.div>
            ))}

            {!clientMode && role === "counselor" && (
              <div className="grid place-items-center py-6">
                <Button className="px-6 py-3 text-base bg-purple-600 text-white hover:bg-purple-700">
                  <Plus /> <span className="hidden sm:inline">주차 추가</span>
                </Button>
              </div>
            )}
          </div>
          
          {/* 하단 정보 - 제일 아래로 이동 */}
          <div className="text-center text-gray-500 py-6 mt-6">
            <p className="mb-2">역할: 내담자 • 로컬 저장됨</p>
            <p className="text-sm">진단하기</p>
          </div>
          </div>
        </div>

        {showWeekSetup && role === "counselor" && (
          <WeekSetup initialWeeks={Math.max(1, program.weeks.length || 4)} onConfirm={onConfirmWeeks} onCancel={() => setShowWeekSetup(false)} />
        )}

        <HamburgerMenu
          open={showMenu}
          onClose={() => setShowMenu(false)}
          onOpenProfile={() => navigate('/profile')}
          onLogout={onLogout}
        />
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenMenu={() => setShowMenu(true)}
          onOpenProfile={() => navigate('/profile')}
          showMenu={showMenu}
          onCloseMenu={() => setShowMenu(false)}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppHome />
            </ProtectedRoute>
          }
        />
        <Route path="/hub" element={<ProtectedRoute><MainHub /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/survey" element={<ProtectedRoute><RuminationSurvey /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="/mbi-survey" element={<ProtectedRoute><MBISurvey /></ProtectedRoute>} />
        <Route path="/mbi-result" element={<ProtectedRoute><MBIResultPage /></ProtectedRoute>} />
        <Route path="/vlq-survey" element={<ProtectedRoute><VLQSurvey/></ProtectedRoute>} />
        <Route path="/vlq-result" element={<ProtectedRoute><VLQResult/></ProtectedRoute>} />
        <Route path="/voice-rec" element={<ProtectedRoute><VoiceRec /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/diary-list" element={<ProtectedRoute><DiaryList /></ProtectedRoute>} />
        <Route path="/diary-view" element={<ProtectedRoute><DiaryView /></ProtectedRoute>} />
        <Route path="/diary-edit" element={<ProtectedRoute><DiaryEdit /></ProtectedRoute>} />
        <Route path="/leaf-ship" element={<ProtectedRoute><LeafShip /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </UserProvider>
  );
}