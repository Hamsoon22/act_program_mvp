import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);


const LS_KEY = "program_user_profile_v1";


export function UserProvider({ children }) {
const [user, setUser] = useState(() => {
try {
const raw = localStorage.getItem(LS_KEY);
return raw ? JSON.parse(raw) : {
id: "guest",
userName: "Guest",
loginId: "로그인되지 않음",
email: "",
avatarUrl: "",
bio: "",
language: "ko",
timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul",
};
} catch {
return {
id: "guest",
userName: "Guest", 
loginId: "로그인되지 않음",
email: "",
avatarUrl: "",
bio: "",
language: "ko",
timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul",
};
}
});


useEffect(() => {
try { localStorage.setItem(LS_KEY, JSON.stringify(user)); } catch {}
}, [user]);


const value = useMemo(() => ({ user, setUser }), [user]);
return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

