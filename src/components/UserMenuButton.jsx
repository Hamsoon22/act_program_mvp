import React from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";


export default function UserMenuButton() {
return (
<Link to="/menu" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 shadow hover:shadow-md transition border border-slate-200 bg-white">
<Menu className="w-5 h-5" />
<span className="text-sm">메뉴</span>
</Link>
);
}