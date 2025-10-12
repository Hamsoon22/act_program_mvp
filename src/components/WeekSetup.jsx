// src/components/WeekSetup.jsx
import React, { useState } from "react";

function WeekSetup({ initialWeeks, onConfirm, onCancel }) {
  const [count, setCount] = useState(initialWeeks || 4);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-xs w-full text-center">
        <h2 className="text-lg font-bold mb-4">몇 주 프로그램인가요?</h2>
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value))))}
          className="border rounded px-2 py-1 mb-4 w-20 text-center"
        />
        <div className="flex gap-2 justify-center">
          <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-sm" onClick={onCancel}>취소</button>
          <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-black text-white hover:bg-gray-800 text-sm" onClick={() => onConfirm(count)}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default WeekSetup;