
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import BookingCard from './components/BookingCard';
import MemberManagement from './components/MemberManagement';
import { ViewType, Booking, TeamMember, AssignmentMap, Participant } from './types';
import { fetchBookings } from './services/calService';
import { 
  subscribeToMembers, 
  subscribeToAssignments, 
  addMember, 
  removeMember, 
  updateAssignment 
} from './services/firebaseService';
import { RefreshCw, Wifi, AlertCircle, CalendarCheck, UserCheck } from 'lucide-react';
import { TIMEZONE, LOCALE, APP_EVENT_NAME, APP_YEAR } from './constants';

interface FlattenedBooking extends Booking {
  displayGuest: Participant;
  uniqueAssignmentKey: string;
}

// 優化色譜：改用極低飽和度的專業配色，避免螢光感
const TIME_SLOT_COLORS = [
  "bg-white border-slate-200",
  "bg-slate-50 border-slate-200",
  "bg-blue-50/60 border-blue-100",
  "bg-indigo-50/60 border-indigo-100",
  "bg-zinc-50 border-zinc-200",
  "bg-slate-100/40 border-slate-200",
  "bg-sky-50/50 border-sky-100",
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>(ViewType.BOOKINGS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  
  const [loading, setLoading] = useState(true);
  const [calSyncing, setCalSyncing] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    const loadCalData = async () => {
      setCalSyncing(true);
      const data = await fetchBookings();
      setBookings(data);
      setCalSyncing(false);
      setLoading(false);
    };
    loadCalData();

    const unsubscribeMembers = subscribeToMembers((updatedMembers) => {
      setMembers(updatedMembers);
      setFirebaseConnected(true);
    });

    const unsubscribeAssignments = subscribeToAssignments((updatedAssignments) => {
      setAssignments(updatedAssignments);
      setFirebaseConnected(true);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeAssignments();
    };
  }, []);

  const handleRefreshCal = async () => {
    setCalSyncing(true);
    const data = await fetchBookings();
    setBookings(data);
    setCalSyncing(false);
  };

  const flattenedList: FlattenedBooking[] = useMemo(() => {
    return bookings
      .flatMap(b => {
        const guests = b.attendees.filter(a => a.email !== b.host.email);
        if (guests.length === 0) {
          const displayGuest = { name: 'Internal Meeting', email: b.host.email };
          return [{ 
            ...b, 
            displayGuest, 
            uniqueAssignmentKey: `${b.id}_${displayGuest.email}` 
          }];
        }
        return guests.map(g => ({
          ...b,
          displayGuest: g,
          uniqueAssignmentKey: `${b.id}_${g.email}`
        }));
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings]);

  const groupedBookings = useMemo(() => {
    return flattenedList.reduce((acc, b) => {
      const dateStr = new Date(b.startTime).toLocaleDateString(LOCALE, {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(b);
      return acc;
    }, {} as { [date: string]: FlattenedBooking[] });
  }, [flattenedList]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedBookings).sort((a, b) => {
      const dateA = new Date(groupedBookings[a][0].startTime).getTime();
      const dateB = new Date(groupedBookings[b][0].startTime).getTime();
      return dateA - dateB;
    });
  }, [groupedBookings]);

  const unassignedCount = useMemo(
    () => flattenedList.filter(b => !assignments[b.uniqueAssignmentKey]).length,
    [flattenedList, assignments]
  );

  const getSlotColor = (dateKey: string, startTime: string) => {
    const dayBookings = groupedBookings[dateKey];
    const uniqueTimes = Array.from(new Set(dayBookings.map(b => b.startTime))).sort();
    const index = uniqueTimes.indexOf(startTime);
    return TIME_SLOT_COLORS[index % TIME_SLOT_COLORS.length];
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0">
      <Sidebar currentView={view} onViewChange={setView} />
      
      <main className="flex-1 md:ml-64 p-5 md:p-12">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                  {view === ViewType.BOOKINGS ? `${APP_EVENT_NAME} ${APP_YEAR} 會議清單` : '團隊成員管理'}
                </h1>
                {firebaseConnected ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(0,153,230,0.08)', color: '#0099e6', border: '1px solid rgba(0,153,230,0.2)' }}>
                    <Wifi size={11} className="animate-pulse" />
                    即時同步
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <RefreshCw size={11} className="animate-spin" />
                    連接中
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>
                TZ: {TIMEZONE}
              </p>
            </div>

            <button
              onClick={handleRefreshCal}
              disabled={calSyncing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 active:scale-95 w-full lg:w-auto"
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <RefreshCw size={15} className={calSyncing ? 'animate-spin' : ''} />
              刷新資料
            </button>
          </div>

          {/* 統計卡片 — 只在會議清單頁顯示 */}
          {view === ViewType.BOOKINGS && !loading && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="rounded-2xl px-5 py-4" style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck size={14} style={{ color: '#0099e6' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    總會議數
                  </span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', fontFamily: "'DM Mono', monospace" }}>
                  {flattenedList.length}
                </p>
              </div>
              <div className="rounded-2xl px-5 py-4" style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck size={14} style={{ color: unassignedCount === 0 ? '#22c55e' : '#ef4444' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    待指派
                  </span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'DM Mono', monospace",
                  color: unassignedCount > 0 ? '#ef4444' : '#22c55e' }}>
                  {unassignedCount}
                </p>
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm font-medium">載入中...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {view === ViewType.BOOKINGS ? (
              <div className="space-y-6 md:space-y-8">
                {sortedDates.length > 0 ? (
                  sortedDates.map((date) => (
                    <section key={date} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-[10px] md:text-xs font-black text-slate-500 bg-white px-3 md:px-4 py-1.5 rounded-lg uppercase tracking-wider border border-slate-200 shrink-0 shadow-sm">
                          {date}
                        </h2>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {groupedBookings[date].map(b => (
                          <BookingCard
                            key={b.uniqueAssignmentKey}
                            booking={b}
                            displayGuest={b.displayGuest}
                            members={members}
                            assignedId={assignments[b.uniqueAssignmentKey]}
                            onAssign={(id, mid) => updateAssignment(id, mid)}
                            assignmentKey={b.uniqueAssignmentKey}
                            bgColorClass={getSlotColor(date, b.startTime)}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner px-6">
                    <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-lg">{`目前尚無 ${APP_YEAR} 年預約`}</p>
                    <p className="text-slate-400 text-sm mt-1 font-medium">請確認 API 設定或等待新預約</p>
                  </div>
                )}
              </div>
            ) : (
              <MemberManagement
                members={members}
                assignments={assignments}
                onAdd={addMember}
                onDelete={removeMember}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
