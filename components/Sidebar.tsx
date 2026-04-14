
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { ViewType } from '../types';
import { APP_TITLE } from '../constants';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <>
      {/* 桌面版側邊欄 */}
      <div className="hidden md:flex w-64 h-screen flex-col fixed left-0 top-0 z-20"
        style={{ background: 'linear-gradient(180deg, #0c1a2e 0%, #0f2240 100%)', borderRight: '1px solid rgba(0,153,230,0.15)' }}>

        {/* Logo 區 */}
        <div className="px-7 py-8">
          <img src="logo.png" alt="EZCast Logo" className="h-8 w-auto object-contain brightness-0 invert" />
        </div>

        {/* 分隔線 */}
        <div className="mx-6 mb-6" style={{ height: '1px', background: 'rgba(0,153,230,0.2)' }} />

        {/* 導覽 */}
        <nav className="flex-1 px-4 space-y-1">
          {[
            { view: ViewType.BOOKINGS, icon: Calendar, label: '會議清單' },
            { view: ViewType.MEMBERS, icon: Users, label: '成員管理' },
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
              style={currentView === view
                ? { background: 'rgba(0,153,230,0.15)', color: '#00b4f0', borderLeft: '2px solid #0099e6' }
                : { color: 'rgba(255,255,255,0.45)', borderLeft: '2px solid transparent' }
              }
            >
              <Icon size={17} />
              <span className="font-semibold text-sm tracking-wide">{label}</span>
            </button>
          ))}
        </nav>

        {/* 底部 */}
        <div className="px-7 py-6" style={{ borderTop: '1px solid rgba(0,153,230,0.1)' }}>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {APP_TITLE}
          </p>
        </div>
      </div>

      {/* 手機版底部導覽列 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 px-6 py-3 flex justify-around items-center z-50"
        style={{ background: '#0c1a2e', borderTop: '1px solid rgba(0,153,230,0.2)' }}>
        <button
          onClick={() => onViewChange(ViewType.BOOKINGS)}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{ color: currentView === ViewType.BOOKINGS ? '#0099e6' : 'rgba(255,255,255,0.4)' }}
        >
          <Calendar size={22} />
          <span className="text-[10px] font-bold">預約</span>
        </button>

        <div className="flex items-center justify-center">
          <img src="logo.png" alt="EZCast Logo" className="h-5 w-auto object-contain brightness-0 invert opacity-60" />
        </div>

        <button
          onClick={() => onViewChange(ViewType.MEMBERS)}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{ color: currentView === ViewType.MEMBERS ? '#0099e6' : 'rgba(255,255,255,0.4)' }}
        >
          <Users size={22} />
          <span className="text-[10px] font-bold">成員</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
