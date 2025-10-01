// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon, User, CheckCircle2, Music2, Mic, Leaf, Pencil, Gift, FileText, Plus,
  Eye, EyeOff, Trash2, LogIn, LogOut, Play, Save, Link as LinkIcon,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// 외부로 분리된 컴포넌트/컨텍스트
import { UserProvider } from "./context/UserContext";
import UserMenuButton from "./components/UserMenuButton";
import HamburgerMenu from "./components/HamburgerMenu";
import ProfileSheet from "./components/ProfileSheet";

// (허브/기능 페이지들)
import MainHub from "./MainHub";
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

/* ========== tiny UI shims ========== */
const Button = ({ className = "", variant = "default", ...props }) => (
  <button
    className={
      `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm shadow-sm transition active:scale-[.99] ` +
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
    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
    {...props}
  />
);
const Label = ({ children, className = "" }) => (
  <label className={"text-xs text-gray-600 " + className}>{children}</label>
);
const Card = ({ className = "", children }) => (
  <div className={"rounded-2xl border border-gray-200 bg-white shadow-sm " + className}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={"p-4 " + className}>{children}</div>
);

/* ========== Program Types / utils ========== */
const ICONS = {
  check: { label: "체크", Icon: CheckCircle2 },
  music: { label: "음악", Icon: Music2 },
  mic:   { label: "녹음", Icon: Mic },
  leaf:  { label: "나뭇잎", Icon: Leaf },
  pencil:{ label: "연필", Icon: Pencil },
  gift:  { label: "기념", Icon: Gift },
  file:  { label: "문서", Icon: FileText },
};

// 기존 타입 유지 + feature 추가
const TYPES = [
  { value: "assessment", label: "진단/설문" },
  { value: "practice",   label: "연습/활동" },
  { value: "content",    label: "콘텐츠" },
  { value: "milestone",  label: "마일스톤" },
  { value: "feature",    label: "앱 기능" }, // 추가
];

// 앱 기능 라우트 매핑
const FEATURES = {
  survey: { label: "Rumination Scale", path: "/survey" },
  mbi:    { label: "MBI 설문",         path: "/mbi-survey" },
  voice:  { label: "목소리 녹음",       path: "/voice-rec" },
  diary:  { label: "일기 쓰기",         path: "/diary" },
  leaf:   { label: "나뭇잎 배 띄우기",   path: "/leaf-ship" },
};

function emptyProgram() {
  return { title: "ACT Program", dateStart: null, dateEnd: null, coach: "", weeks: [] };
}

// LocalStorage helpers (프로그램)
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

/* ========== Toolbar ========== */
function Toolbar({ clientMode, setClientMode, role, onLogout, openWeekSetup, onOpenMenu }) {
  const [copied, setCopied] = useState(false);
  const copyShare = async () => {
    // 현재 보기를 복사 (HashRouter 사용 시에도 안전)
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="sticky top-0 z-50 -mx-4 mb-4 flex items-center justify-between rounded-2xl bg-white/80 p-4 backdrop-blur">
      <div className="flex items-center gap-2">
        {role === "counselor" && (
          <Button onClick={() => setClientMode((v) => !v)} variant="outline" className="rounded-full">
            {clientMode ? <EyeOff size={16} /> : <Eye size={16} />} {clientMode ? "빌더 보기" : "클라이언트 보기"}
          </Button>
        )}
        {role === "counselor" && (
          <Button variant="outline" onClick={openWeekSetup}>주차 설정</Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {role === "counselor" && (
          <Button variant="outline" onClick={copyShare}>
            <LinkIcon size={16} />
            {copied ? "링크 복사됨!" : "링크 복사"}
          </Button>
        )}
        {role === "counselor" && (
          <Button variant="outline" onClick={openWeekSetup}>새 프로그램</Button>
        )}
        <UserMenuButton onClick={onOpenMenu} />
        {role && (
          <Button variant="ghost" onClick={onLogout}><LogOut size={16}/> 로그아웃</Button>
        )}
      </div>
    </div>
  );
}

/* ========== Landing ========== */
function Landing({ onChooseRole }) {
  return (
    <div className="mx-auto max-w-md py-16">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-sky-700">나만의 프로그램을 만들어보세요</h1>
        <p className="mb-1 text-base text-gray-600">상담사와 내담자가 함께하는 맞춤 프로그램을 손쉽게 설계하고, 실행할 수 있습니다.</p>
        <p className="text-sm text-gray-400">아래에서 역할을 선택해 시작하세요.</p>
      </div>
      <div className="space-y-6">
        <Button className="w-full rounded-2xl py-4 text-lg font-semibold shadow bg-sky-600 hover:bg-sky-700" onClick={() => onChooseRole("counselor")}>
          <LogIn size={20} /> 상담사로 프로그램 만들기
        </Button>
        <Button className="w-full rounded-2xl py-4 text-lg font-semibold text-sky-700 shadow" variant="outline" onClick={() => onChooseRole("client")}>
          내담자(클라이언트)로 참여하기
        </Button>
      </div>
    </div>
  );
}

/* ========== HeaderEditable ========== */
function HeaderEditable({ program, setProgram, clientMode }) {
  return (
    <Card className="mb-4">
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-2">
            {clientMode ? (
              <h1 className="text-2xl font-semibold leading-snug">{program.title}</h1>
            ) : (
              <div className="space-y-1">
                <Label>프로그램 제목</Label>
                <Input value={program.title} onChange={(e) => setProgram({ ...program, title: e.target.value })} />
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} />
                {clientMode ? (
                  <span>{program.dateStart && program.dateEnd ? `${program.dateStart.toLocaleDateString()} ~ ${program.dateEnd.toLocaleDateString()}` : ""}</span>
                ) : (
                  <div className="flex gap-2">
                    <DatePicker selected={program.dateStart} onChange={(date) => setProgram({ ...program, dateStart: date })} selectsStart startDate={program.dateStart} endDate={program.dateEnd} dateFormat="yyyy.MM.dd" placeholderText="시작일" className="border rounded-xl px-2 py-1 text-sm" />
                    <span>~</span>
                    <DatePicker selected={program.dateEnd} onChange={(date) => setProgram({ ...program, dateEnd: date })} selectsEnd startDate={program.dateStart} endDate={program.dateEnd} minDate={program.dateStart} dateFormat="yyyy.MM.dd" placeholderText="종료일" className="border rounded-xl px-2 py-1 text-sm" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                {clientMode ? (
                  <span>{program.coach}</span>
                ) : (
                  <Input value={program.coach} onChange={(e) => setProgram({ ...program, coach: e.target.value })} placeholder="상담사 이름" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ========== Video helpers / Cards / Week ========== */
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
function VideoModal({ url, onClose }) {
  const yt = getYouTubeId(url);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4" onClick={onClose}>
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
              <div className="text-sm text-gray-600">
                이 링크는 임베드할 수 없어요. <a className="text-sky-600 underline" href={url} target="_blank" rel="noreferrer">새 탭에서 열기</a>
              </div>
            )}
            <div className="mt-4 text-right"><Button variant="outline" onClick={onClose}>닫기</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgramItemCard({ item, onChange, onRemove, clientMode, editMode, onEditModeChange, idx, weekIdx }) {
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

  // 기능 변경 시 자동 제목: 사용자가 직접 수정하지 않았다면(autoTitle)
  useEffect(() => {
    if (!isFeature) return;
    if (!item.featureKey) {
      onChange({ featureKey: "survey", title: FEATURES.survey.label, autoTitle: true });
      return;
    }
    if (item.autoTitle && selectedFeature) {
      onChange({ title: selectedFeature.label });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="h-7 rounded-xl px-2 py-1 text-xs"
        onClick={() => navigate(selectedFeature.path)}
      >
        열기
      </Button>
    ) : null
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3">
      <div className={cn("grid h-10 w-10 place-items-center rounded-xl", item.done ? "bg-green-50" : "bg-orange-50")}><Icon /></div>
      <div className="flex-1">
        {clientMode ? (
          <>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">{item.title}</div>
              {hasVideo && (
                <Button variant="outline" className="h-7 rounded-xl px-2 py-1 text-xs" onClick={() => setOpen(true)}>
                  <Play size={14}/> 보기
                </Button>
              )}
              <FeatureOpenButton />
            </div>
            <div className="text-xs text-gray-500">{item.subtitle}</div>
            {item.type === "assessment" && item.link && (
              <a href={item.link} className="inline-block mt-2 text-sky-600 underline" target="_blank" rel="noopener noreferrer">진단하기 바로가기</a>
            )}
            {isDiary && (
              <div className="mt-3">
                <Button variant="outline" className="mb-2" onClick={() => setOpenDiary(v => !v)}>
                  {openDiary ? "입력창 닫기" : "활동 기록하기"}
                </Button>
                {openDiary && (
                  <div>
                    <Label>나의 기록</Label>
                    <textarea className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400" rows={6} value={diary} onChange={e => setDiary(e.target.value)} placeholder="오늘의 활동 내용을 자유롭게 써보세요." />
                    <Button className="mt-2" onClick={saveDiary}><Save size={16} /> 저장하기</Button>
                    {diarySaved && (<span className="ml-3 text-xs text-green-500">저장되었습니다!</span>)}
                  </div>
                )}
                {diary && !openDiary && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-2 text-sm text-gray-700">
                    <b>나의 기록:</b>
                    <div className="mt-1 whitespace-pre-line">{diary}</div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : editMode ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label>제목</Label>
              <Input value={item.title} onChange={(e) => onChange({ title: e.target.value, autoTitle: false })} />
            </div>
            <div>
              <Label>종류</Label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  value={item.featureKey || "survey"}
                  onChange={(e) => onChange({ featureKey: e.target.value })}
                >
                  {Object.entries(FEATURES).map(([key, f]) => (
                    <option key={key} value={key}>{f.label} ({f.path})</option>
                  ))}
                </select>
                {selectedFeature && (
                  <div className="mt-1 text-xs text-gray-500">
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
              <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={item.icon} onChange={(e) => onChange({ icon: e.target.value })}>
                {Object.entries(ICONS).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>

            {item.type === "assessment" && (
              <div className="md:col-span-3">
                <Label>진단/설문 링크</Label>
                <Input placeholder="설문/진단 링크 입력 (예: https://forms.gle/...)" value={item.link || ""} onChange={e => onChange({ link: e.target.value })} />
              </div>
            )}
            {item.type === "content" && (
              <div className="md:col-span-3">
                <Label>동영상 링크 (YouTube 주소 또는 MP4 링크)</Label>
                <Input placeholder="예: https://youtu.be/abc123 또는 https://cdn.site/video.mp4" value={item.videoUrl || ""} onChange={(e) => onChange({ videoUrl: e.target.value })} />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">{item.title}</div>
              {hasVideo && (
                <Button variant="outline" className="h-7 rounded-xl px-2 py-1 text-xs" onClick={() => setOpen(true)}>
                  <Play size={14}/> 보기
                </Button>
              )}
              <FeatureOpenButton />
            </div>
            <div className="text-xs text-gray-500">{item.subtitle}</div>
            {item.type === "assessment" && item.link && (
              <a href={item.link} className="inline-block mt-2 text-sky-600 underline" target="_blank" rel="noopener noreferrer">진단하기 바로가기</a>
            )}
          </>
        )}
      </div>
      {clientMode ? null : (
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { onEditModeChange(editMode ? false : true); }}>
            {editMode ? <Save size={16} /> : <Pencil size={16} />}{editMode ? "저장" : "수정"}
          </Button>
          <Button variant="ghost" onClick={onRemove}><Trash2 size={16}/></Button>
        </div>
      )}
      {clientMode && hasVideo && open && (<VideoModal url={item.videoUrl} onClose={() => setOpen(false)} />)}
    </div>
  );
}

function WeekEditor({ week, onChange, onRemove, clientMode, role, weekIdx }) {
  const [editItemIdx, setEditItemIdx] = useState(null);
  const addItem = () => {
    // 기본을 feature 아이템으로 생성 + 자동 제목
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
    const items = week.items.filter((_, i) => i !== idx);
    onChange({ ...week, items });
    setEditItemIdx(null);
  };
  return (
    <Card className="mb-4">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clientMode ? (
              <>
                <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">{week.weekLabel || "주차"}</span>
                {week.dateTag && (<span className="ml-2 text-xs text-gray-600">{week.dateTag instanceof Date ? week.dateTag.toLocaleDateString() : ""}</span>)}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Input className="w-24" value={week.weekLabel} onChange={(e) => onChange({ ...week, weekLabel: e.target.value })} placeholder="1주차" />
                <DatePicker selected={week.dateTag} onChange={(date) => onChange({ ...week, dateTag: date })} dateFormat="yyyy.MM.dd" placeholderText="날짜" className="w-36 rounded-xl border px-2 py-1 text-sm" />
              </div>
            )}
          </div>
          {role === "counselor" && (
            <Button variant="ghost" onClick={onRemove}>
              <Trash2 size={16} /> 삭제
            </Button>
          )}
        </div>

        <div className="space-y-3">
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
            />
          ))}
        </div>

        {!clientMode && (
          <div className="mt-4">
            <Button onClick={addItem}><Plus size={16} /> 프로그램 추가하기</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function WeekSetup({ initialWeeks = 4, onConfirm, onCancel }) {
  const [weeks, setWeeks] = useState(initialWeeks);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">몇 주 프로그램입니까?</h3>
          <p className="mb-2 text-sm text-gray-600">1주부터 20주까지 선택할 수 있어요.</p>
          <select className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
            {Array.from({ length: 20 }).map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}주</option>))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>취소</Button>
            <Button onClick={() => onConfirm(weeks)}>확인</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ========== AppHome: 메인 프로그램 화면 ========== */
function AppHome() {
  const [program, setProgram] = useState(() => loadLS() || emptyProgram());
  // 해시(#client) 의존 제거 — 사용자/상담사 모두 LS로 역할/모드 보존
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_LS) || null);
  const [clientMode, setClientMode] = useState(() => {
    const saved = localStorage.getItem(MODE_LS);
    if (saved === "1") return true;
    if (saved === "0") return false;
    return (localStorage.getItem(ROLE_LS) === "client");
  });

  const [showWeekSetup, setShowWeekSetup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const route = useLocation();

  useEffect(() => saveLS(program), [program]);

  // 역할/모드 영구 저장 (뒤로가기/새로고침 시 유지)
  useEffect(() => {
    if (role) localStorage.setItem(ROLE_LS, role);
    else localStorage.removeItem(ROLE_LS);
  }, [role]);
  useEffect(() => {
    localStorage.setItem(MODE_LS, clientMode ? "1" : "0");
  }, [clientMode]);

  // 라우트 바뀌면 메뉴/프로필 닫기
  useEffect(() => {
    if (showMenu) setShowMenu(false);
    if (showProfile) setShowProfile(false);
  }, [route.pathname]);

  // 역할이 바뀌면 메뉴/프로필 닫기
  useEffect(() => {
    if (showMenu) setShowMenu(false);
    if (showProfile) setShowProfile(false);
  }, [role]);

  const onLogout = () => {
    setRole(null);
    setShowMenu(false);
    setShowProfile(false);
    localStorage.removeItem(ROLE_LS);
    localStorage.removeItem(MODE_LS);
  };

  const generateWeeks = (n) => {
    const weeks = Array.from({ length: n }).map((_, idx) => ({ weekLabel: `${idx + 1}주차`, dateTag: null, items: [] }));
    setProgram((p) => ({ ...p, weeks }));
  };
  const openWeekSetup = () => setShowWeekSetup(true);
  const onConfirmWeeks = (n) => { generateWeeks(n); setShowWeekSetup(false); };
  const addWeek = () => setProgram({ ...program, weeks: [...program.weeks, { weekLabel: `${program.weeks.length + 1}주차`, dateTag: null, items: [] }] });
  const changeWeek = (idx, patch) => setProgram({ ...program, weeks: program.weeks.map((w, i) => (i === idx ? patch : w)) });
  const removeWeek = (idx) => setProgram({ ...program, weeks: program.weeks.filter((_, i) => i !== idx) });

  if (!role)
    return (
      <>
        <Landing
          onChooseRole={(r) => {
            setRole(r);
            setClientMode(r === "client");
            if (r === "counselor" && program.weeks.length === 0) setShowWeekSetup(true);
            setShowMenu(false);
            setShowProfile(false);
          }}
        />
      </>
    );

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Toolbar
        clientMode={clientMode}
        setClientMode={setClientMode}
        role={role}
        onLogout={onLogout}
        openWeekSetup={openWeekSetup}
        onOpenMenu={() => setShowMenu(true)}
      />

      <HeaderEditable program={program} setProgram={setProgram} clientMode={clientMode} />

      {role === "counselor" && program.weeks.length === 0 && (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
          주차가 없습니다. 우측 상단의 <b>주차 설정</b> 버튼을 눌러 1~20주를 생성하세요.
        </div>
      )}

      <div className="space-y-4">
        {program.weeks.map((week, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <WeekEditor
              week={week}
              onChange={(w) => changeWeek(i, w)}
              onRemove={() => removeWeek(i)}
              clientMode={clientMode}
              role={role}
              weekIdx={i}
            />
          </motion.div>
        ))}

        {!clientMode && role === "counselor" && (
          <div className="grid place-items-center py-6">
            <Button onClick={addWeek} className="px-6 py-3 text-base"><Plus /> 주차 추가</Button>
          </div>
        )}
      </div>

      <footer className="py-10 text-center text-xs text-gray-400">
        역할: {role === "counselor" ? "상담사" : "내담자"} • 로컬 저장됨
      </footer>

      {showWeekSetup && (
        <WeekSetup initialWeeks={Math.max(1, program.weeks.length || 4)} onConfirm={onConfirmWeeks} onCancel={() => setShowWeekSetup(false)} />
      )}

      <HamburgerMenu
        open={showMenu}
        onClose={() => setShowMenu(false)}
        onOpenProfile={() => setShowProfile(true)}
        onLogout={onLogout}
      />
      <ProfileSheet open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}

/* ========== 최상위 App: 라우팅 구성 ========== */
export default function App() {
  return (
    <UserProvider>
      <Routes>
        {/* 메인 프로그램 */}
        <Route path="/" element={<AppHome />} />
        {/* 허브 및 기능 페이지들 */}
        <Route path="/hub" element={<MainHub />} />
        <Route path="/survey" element={<RuminationSurvey />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/mbi-survey" element={<MBISurvey />} />
        <Route path="/mbi-result" element={<MBIResultPage />} />
        <Route path="/voice-rec" element={<VoiceRec />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/diary-list" element={<DiaryList />} />
        <Route path="/diary-view" element={<DiaryView />} />
        <Route path="/diary-edit" element={<DiaryEdit />} />
        <Route path="/leaf-ship" element={<LeafShip />} />
      </Routes>
    </UserProvider>
  );
}
