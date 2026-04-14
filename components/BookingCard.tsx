
import React from 'react';
import { Mail, Clock } from 'lucide-react';
import { Booking, TeamMember, Participant } from '../types';
import { TIMEZONE, LOCALE } from '../constants';

interface BookingCardProps {
  booking: Booking;
  displayGuest: Participant;
  members: TeamMember[];
  assignedId?: string;
  onAssign: (assignmentKey: string, memberId: string) => void;
  assignmentKey: string;
  bgColorClass: string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  displayGuest,
  members,
  assignedId,
  onAssign,
  assignmentKey,
}) => {
  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString(LOCALE, {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const assignedMember = members.find(m => m.id === assignedId);
  const isAssigned = !!assignedId;

  return (
    <div
      className="rounded-2xl flex flex-col md:flex-row items-stretch overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        background: '#ffffff',
        border: isAssigned ? '1px solid rgba(0,153,230,0.2)' : '1px solid rgba(239,68,68,0.2)',
        boxShadow: isAssigned
          ? '0 1px 12px rgba(0,153,230,0.06)'
          : '0 1px 12px rgba(239,68,68,0.06)',
      }}
    >
      {/* 左側：指派狀態色條 */}
      <div
        className="w-full md:w-1 md:min-h-full shrink-0 h-1"
        style={{ background: isAssigned ? '#0099e6' : '#ef4444' }}
      />

      {/* 時間區塊 */}
      <div
        className="w-full md:w-36 flex flex-row md:flex-col items-center justify-center px-5 py-3 md:py-5 gap-3 md:gap-1 shrink-0"
        style={{ borderRight: '1px solid #f1f5f9', background: '#fafcff' }}
      >
        <Clock size={13} className="text-slate-300 hidden md:block mb-1" />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.25rem', fontWeight: 500, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {formatTime(booking.startTime)}
        </span>
        <div className="flex md:flex-col items-center gap-1">
          <div className="w-4 h-px md:w-px md:h-3 bg-slate-200" />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
            {formatTime(booking.endTime)}
          </span>
        </div>
      </div>

      {/* 資訊區塊 */}
      <div className="flex-1 px-6 py-5 flex flex-col justify-center min-w-0">
        <h3
          className="truncate mb-1.5"
          style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}
        >
          {displayGuest.name || 'Anonymous Guest'}
        </h3>
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <span className="truncate" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>
            {displayGuest.email}
          </span>
        </div>
      </div>

      {/* 指派區塊 */}
      <div
        className="w-full md:w-60 px-5 py-4 flex flex-col justify-center shrink-0"
        style={{ borderLeft: '1px solid #f1f5f9', background: isAssigned ? 'rgba(0,153,230,0.03)' : 'rgba(239,68,68,0.02)' }}
      >
        <label
          className="block mb-2"
          style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}
        >
          負責接待成員
        </label>
        <div className="relative">
          <select
            value={assignedId || ''}
            onChange={e => onAssign(assignmentKey, e.target.value)}
            className="w-full appearance-none rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none transition-all cursor-pointer pr-8"
            style={isAssigned
              ? { background: 'rgba(0,153,230,0.08)', border: '1px solid rgba(0,153,230,0.25)', color: '#0066aa' }
              : { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }
            }
          >
            <option value="">⚠ 待指派</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {assignedMember && (
          <p className="mt-1.5 text-xs font-medium" style={{ color: '#0099e6' }}>
            ✓ {assignedMember.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
