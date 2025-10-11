import React from "react";

export default function HeaderEditable({ program, setProgram, clientMode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold">{program.title}</h2>
      {/* 추가로 필요하면 수정/입력 폼 등 구현 */}
    </div>
  );
}