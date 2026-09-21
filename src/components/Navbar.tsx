import React, { useState } from 'react';
import { 
  Code2, 
  Settings, 
  ShieldCheck, 
  FileCode, 
  Share2, 
  Check, 
  Send, 
  History,
  MoreVertical
} from 'lucide-react';

interface NavbarProps {
  isLive: boolean;
  activeTab: 'submit' | 'list';
  onChangeTab: (tab: 'submit' | 'list') => void;
  submissionCount: number;
  onOpenConfig: () => void;
  onOpenRules: () => void;
  onOpenExport: () => void;
  onCopyShareLink: () => void;
  copiedShareLink: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLive,
  activeTab,
  onChangeTab,
  submissionCount,
  onOpenConfig,
  onOpenRules,
  onOpenExport,
  onCopyShareLink,
  copiedShareLink
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 1. Logo & Tiêu đề hệ thống (Đúng như ảnh người dùng) */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                Cổng Nộp Bài Đội Tuyển HSG
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                Chuyên Tin Học
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống thu thập &amp; quản lý bài tập lập trình thi đấu
            </p>
          </div>
        </div>

        {/* 2. Thanh điều hướng tab & Nút sao chép link */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Tab Nộp bài & Bài đã nộp */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => onChangeTab('submit')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>

            <button
              onClick={() => onChangeTab('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Bài đã nộp</span>
              {submissionCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                  {submissionCount}
                </span>
              )}
            </button>
          </div>

          {/* Nút Sao chép Link Gửi Cho Học Sinh */}
          <button
            onClick={onCopyShareLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              copiedShareLink 
                ? 'bg-emerald-600 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title="Nhấp để sao chép đường link gửi cho học sinh"
          >
            {copiedShareLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Đã chép link gửi HS!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Sao chép link nộp bài</span>
              </>
            )}
          </button>

          {/* Menu Giáo Viên (Cấu hình Firebase, Rules, File độc lập) */}
          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
              title="Công cụ Giáo viên (Cấu hình & Tải file)"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showAdminMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowAdminMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Dành cho Giáo viên
                  </div>

                  <button
                    onClick={() => { setShowAdminMenu(false); onOpenConfig(); }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Cấu hình Firebase</span>
                    <span className={`ml-auto w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </button>

                  <button
                    onClick={() => { setShowAdminMenu(false); onOpenRules(); }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Hướng dẫn Rules &amp; CORS</span>
                  </button>

                  <button
                    onClick={() => { setShowAdminMenu(false); onOpenExport(); }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 text-indigo-600 font-medium flex items-center gap-2 cursor-pointer border-t border-slate-100"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Tải file index.html độc lập</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
