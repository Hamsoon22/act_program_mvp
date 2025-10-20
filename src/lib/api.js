// 전체 파일은 기존과 동일하나 아래에 deleteRecord 함수를 추가했습니다.
// (생략 없이 전체 파일을 붙여야 한다면 알려주세요; 아래는 수정된 전체 파일 내용입니다)

const API_URL = import.meta.env.VITE_API_URL || 'https://ewha-des-api.nivecodes.com';

/** 공통 fetch 래퍼 */
async function request(path, opts = {}) {
  const alreadyRetried = Boolean(opts._retry);
  const token = localStorage.getItem('accessToken');
  const defaultHeaders = opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  const headers = {
    ...defaultHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };
  const fetchOpts = {
    credentials: opts.credentials ?? 'include',
    ...opts,
    headers,
  };

  let res = await fetch(`${API_URL}${path}`, fetchOpts);

  if (res.status === 401 && !alreadyRetried) {
    console.warn('API returned 401 for', path);
    try { const text = await res.text().catch(() => ''); console.warn('401 response body:', text); } catch (_) {}

    const tryRefresh = async () => {
      try {
        const r1 = await fetch(`${API_URL}/api/open/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (r1.ok) {
          const j1 = await r1.json().catch(() => null);
          if (j1 && j1.data && j1.data.accessToken) {
            localStorage.setItem('accessToken', j1.data.accessToken);
            if (j1.data.refreshToken) localStorage.setItem('refreshToken', j1.data.refreshToken);
            return true;
          }
        }
      } catch (e) { console.warn('cookie refresh failed', e); }

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const r2 = await fetch(`${API_URL}/api/open/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (r2.ok) {
            const j2 = await r2.json().catch(() => null);
            if (j2 && j2.data && j2.data.accessToken) {
              localStorage.setItem('accessToken', j2.data.accessToken);
              if (j2.data.refreshToken) localStorage.setItem('refreshToken', j2.data.refreshToken);
              return true;
            }
          } else {
            const t = await r2.text().catch(() => '');
            console.warn('refresh (body) failed:', r2.status, t);
          }
        }
      } catch (e) { console.warn('body refresh failed', e); }
      return false;
    };

    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = localStorage.getItem('accessToken');
      const retryHeaders = {
        ...defaultHeaders,
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        ...(opts.headers || {}),
      };
      const retryOpts = {
        ...fetchOpts,
        headers: retryHeaders,
        _retry: true,
      };
      res = await fetch(`${API_URL}${path}`, retryOpts);
    }
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    console.error(`API ${res.status} ${path} -> ${msg}`);
    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      try { if (typeof window !== 'undefined') window.location.href = '/login'; } catch (_) {}
    }
    throw new Error(`API ${res.status} ${msg}`);
  }

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('application/json')) {
    return res.json();
  }
  if (ct.startsWith('audio/') || ct.includes('application/octet-stream') || ct.startsWith('image/')) {
    return res.blob();
  }
  return res.text();
}

const unwrap = (resp) => (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp);

export const api = {
  /* ---------- Auth ---------- */
  login(loginId, password) {
    return request('/api/open/v1/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
      credentials: 'include',
    }).then((resp) => {
      const data = unwrap(resp);
      if (data && typeof data === 'object') {
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    });
  },
  adminLogin(loginId, password) {
    return request('/api/open/v1/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
      credentials: 'include',
    }).then((resp) => {
      const data = unwrap(resp);
      if (data && typeof data === 'object') {
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    });
  },
  refreshToken(refreshToken) {
    return request('/api/open/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    }).then(unwrap);
  },
  getUserProfile() {
    return request('/api/user/v1/mypage').then(unwrap);
  },
  updateUserProfile(profileData) {
    return request('/api/user/v1/mypage', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }).then(unwrap);
  },
  changePassword({ oldPassword, newPassword }) {
    const params = new URLSearchParams({ oldPassword, newPassword }).toString();
    return request(`/api/user/v1/mypage/password?${params}`, {
      method: 'PUT'
    }).then(unwrap);
  },
  changeFirstPassword({ newPassword }) {
    const params = new URLSearchParams({ newPassword }).toString();
    return request(`/api/user/v1/mypage/password-first?${params}`, {
      method: 'PUT'
    }).then(unwrap);
  },

  /* Diary (omitted earlier for brevity) */
  listDiaries() {
    return request('/api/user/v1/diary/list/all').then(unwrap);
  },
  getDiary(id) {
    return request(`/api/user/v1/diary/${id}`).then(unwrap);
  },
  createDiary({ programId, diaryDate, diaryTitle, diaryContent, colorCode }) {
    return request('/api/user/v1/diary', {
      method: 'POST',
      body: JSON.stringify({ programId, diaryDate, diaryTitle, diaryContent, colorCode }),
    }).then(unwrap);
  },
  updateDiary(id, { programId, diaryDate, diaryTitle, diaryContent, colorCode }) {
    return request(`/api/user/v1/diary/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ programId, diaryDate, diaryTitle, diaryContent, colorCode }),
    }).then(unwrap);
  },
  deleteDiary(id) {
    return request(`/api/user/v1/diary/${id}`, { method: 'DELETE' }).then(unwrap);
  },

  /* Record (녹음) */
  uploadRecord(programId, file) {
    const fd = new FormData();
    fd.append('programId', programId);
    fd.append('file', file);
    return request('/api/user/v1/record/upload', {
      method: 'POST',
      body: fd,
    }).then(unwrap);
  },

  async listRecords(search = {}) {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    const qs = params.toString();
    const getPath = `/api/user/v1/record/list${qs ? `?${qs}` : ''}`;

    try {
      console.debug('listRecords: attempting GET', getPath, 'search:', search);
      const getResp = await request(getPath);
      const data = unwrap(getResp);
      if (Array.isArray(data) ? data.length > 0 : (data && (Array.isArray(data.list) ? data.list.length > 0 : true))) {
        console.debug('listRecords: GET returned data', data);
        return data;
      }
      console.debug('listRecords: GET returned empty result, will try POST fallback');
    } catch (getErr) {
      console.warn('listRecords: GET failed, will try POST fallback', getErr);
    }

    try {
      console.debug('listRecords: attempting POST /api/user/v1/record/list with body', search);
      const postResp = await request('/api/user/v1/record/list', {
        method: 'POST',
        body: JSON.stringify(search),
      });
      const pdata = unwrap(postResp);
      console.debug('listRecords: POST returned data', pdata);
      return pdata;
    } catch (postErr) {
      console.error('listRecords: POST failed', postErr);
      throw postErr;
    }
  },

  getRecord(id) {
    if (id === undefined || id === null) return Promise.reject(new Error('getRecord: id is required'));
    return request(`/api/user/v1/record/${id}`).then(unwrap);
  },

  // <<< 추가된 함수: 녹음 삭제 (서버)
  deleteRecord(id) {
    if (id === undefined || id === null) return Promise.reject(new Error('deleteRecord: id is required'));
    return request(`/api/user/v1/record/${id}`, { method: 'DELETE' }).then(unwrap);
  },

  /* Admin / Program helpers omitted (unchanged) */
  listProgramMasters() { return request('/api/admin/v1/program-master/list').then(unwrap); },
  listProgramWeeks(masterId) { return request(`/api/admin/v1/program-week/program-master/${masterId}/weeks`).then(unwrap); },
  listPrograms(weekId) { return request(`/api/admin/v1/program/program-week/${weekId}/programs`).then(unwrap); },

  createProgramWeek({ programMasterId, programWeekName, programWeekDate }) {
    return request('/api/admin/v1/program-week', {
      method: 'POST',
      body: JSON.stringify({ programMasterId, programWeekName, programWeekDate }),
    }).then(unwrap);
  },
  getProgramWeek(id) { return request(`/api/admin/v1/program-week/${id}`).then(unwrap); },
  updateProgramWeek(id, { programMasterId, programWeekName, programWeekDate }) {
    return request(`/api/admin/v1/program-week/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ programMasterId, programWeekName, programWeekDate }),
    }).then(unwrap);
  },
  deleteProgramWeek(id) {
    return request(`/api/admin/v1/program-week/${id}`, {
      method: 'DELETE',
    }).then(unwrap);
  },
};