const API_URL = import.meta.env.VITE_API_URL || 'https://yonsei-des-api.nivecodes.com';

/** 공통 fetch 래퍼 */
async function request(path, opts = {}) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}${path}`, {
    credentials: opts.credentials ?? 'include', // refresh 쿠키 대비
    ...opts,
    headers: {
      // FormData가 아닌 경우에만 JSON 헤더 유지
      ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${msg}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

/** 서버 응답이 { code, msg, data } 형태일 때 data만 꺼내주는 헬퍼 */
const unwrap = (resp) => (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp);

export const api = {
  /* ---------- Auth ---------- */

  // ✅ 사용자 로그인 (/api/open/v1/auth/user/login)
  login(loginId, password) {
    return request('/api/open/v1/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
      credentials: 'include',
    }).then(unwrap);
  },

  // ✅ 관리자 로그인 (/api/open/v1/auth/admin/login)
  adminLogin(loginId, password) {
    return request('/api/open/v1/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
      credentials: 'include',
    }).then(unwrap);
  },

  // ✅ 액세스 토큰 재발급
  refreshToken(refreshToken) {
    return request('/api/open/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    }).then(unwrap);
  },

  /* ---------- User Diary ---------- */

  listDiaries() {
    return request('/api/user/v1/diary/list').then(unwrap);
  },

  createDiary(programId, content) {
    return request('/api/user/v1/diary', {
      method: 'POST',
      body: JSON.stringify({ programId, content }),
    }).then(unwrap);
  },

  updateDiary(id, content) {
    return request(`/api/user/v1/diary/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }).then(unwrap);
  },

  deleteDiary(id) {
    return request(`/api/user/v1/diary/${id}`, { method: 'DELETE' }).then(unwrap);
  },

  // ✅ 녹음 업로드 (multipart) — Content-Type 자동 설정 금지
  uploadRecord(programId, file) {
    const fd = new FormData();
    fd.append('programId', programId);
    fd.append('file', file);
    return request('/api/user/v1/record', {
      method: 'POST',
      body: fd, // FormData면 request가 헤더 자동 처리
    }).then(unwrap);
  },

  /* ---------- Admin (Program Tree) ---------- */

  listProgramMasters() {
    return request('/api/admin/v1/program-master/list').then(unwrap);
  },
  listProgramWeeks(masterId) {
    return request(`/api/admin/v1/program-week/program-master/${masterId}/weeks`).then(unwrap);
  },
  listPrograms(weekId) {
    return request(`/api/admin/v1/program/program-week/${weekId}/programs`).then(unwrap);
  },

  /* ---------- Admin: Program Week 관리 ---------- */

  // ✅ 프로그램 주차 생성 (DB 저장)
  createProgramWeek({ programMasterId, programWeekName, programWeekDate }) {
    return request('/api/admin/v1/program-week', {
      method: 'POST',
      body: JSON.stringify({ programMasterId, programWeekName, programWeekDate }),
    }).then(unwrap);
  },

  // ✅ 프로그램 주차 조회
  getProgramWeek(id) {
    return request(`/api/admin/v1/program-week/${id}`).then(unwrap);
  },

  // ✅ 프로그램 주차 수정
  updateProgramWeek(id, { programMasterId, programWeekName, programWeekDate }) {
    return request(`/api/admin/v1/program-week/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ programMasterId, programWeekName, programWeekDate }),
    }).then(unwrap);
  },

  // ✅ 프로그램 주차 삭제
  deleteProgramWeek(id) {
    return request(`/api/admin/v1/program-week/${id}`, {
      method: 'DELETE',
    }).then(unwrap);
  },
};