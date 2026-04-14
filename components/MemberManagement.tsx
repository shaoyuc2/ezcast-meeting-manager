
import React, { useState, useMemo } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { TeamMember, AssignmentMap } from '../types';

interface MemberManagementProps {
  members: TeamMember[];
  assignments: AssignmentMap;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ members, assignments, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const memberId of Object.values(assignments)) {
      counts[memberId] = (counts[memberId] ?? 0) + 1;
    }
    return counts;
  }, [assignments]);

  const maxCount = useMemo(
    () => Math.max(...members.map(m => taskCounts[m.id] ?? 0), 1),
    [members, taskCounts]
  );

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  const avatarColors = [
    '#0099e6', '#0077b6', '#00b4d8', '#0066cc', '#005fa3', '#0091ad',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* 新增表單 */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <h2 className="flex items-center gap-2 mb-5" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <UserPlus size={16} style={{ color: '#0099e6' }} />
          新增團隊成員
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="輸入姓名"
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
          />
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#0099e6', color: '#fff', boxShadow: '0 4px 14px rgba(0,153,230,0.25)' }}
          >
            <UserPlus size={16} />
            新增成員
          </button>
        </div>
      </div>

      {/* 成員列表 */}
      {members.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: '1px dashed #e2e8f0' }}>
          <p style={{ color: '#94a3b8', fontWeight: 600 }}>目前尚未建立成員名單</p>
          <p style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: 4 }}>請從上方欄位新增</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {members.map((m, i) => {
            const count = taskCounts[m.id] ?? 0;
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const color = avatarColors[i % avatarColors.length];

            return (
              <div
                key={m.id}
                className="rounded-2xl p-5 flex items-center justify-between group transition-all"
                style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-lg"
                    style={{ background: color }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>

                  {/* 名稱 + 工作量 */}
                  <div className="min-w-0 flex-1">
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }} className="truncate">{m.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* 工作量 bar */}
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: '#f1f5f9' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                        {count} 場
                      </span>
                    </div>
                  </div>
                </div>

                {/* 刪除 */}
                <button
                  onClick={() => onDelete(m.id)}
                  className="ml-3 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50"
                  title="刪除成員"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
