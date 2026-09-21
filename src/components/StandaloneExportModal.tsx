import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, FileCode, Sparkles, ExternalLink } from 'lucide-react';
import { fetchStandaloneHtml } from '../data/standaloneTemplate';

interface StandaloneExportModalProps {
  onClose: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({ onClose }) => {
  const [code, setCode] = useState<string>('Đang nạp mã nguồn file index.html...');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandaloneHtml().then((content) => {
      setCode(content);
      setLoading(false);
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const fileSizeKb = Math.round((new Blob([code]).size) / 1024);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Mã Nguồn File Độc Lập (index.html)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  Single-File SPA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chứa đầy đủ HTML, CDN Tailwind CSS, Lucide Icons và Firebase Modular SDK v10
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Nút Tải file index.html */}
            <a
              href="/index-standalone.html"
              download="index.html"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file index.html</span>
            </a>

            {/* Nút Sao chép */}
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép toàn bộ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hướng dẫn sử dụng nhanh */}
        <div className="p-3 bg-amber-50/80 border-b border-amber-100 text-[11px] text-amber-900 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Cách triển khai:</strong> Tải tệp <code className="font-mono font-bold">index.html</code> về máy, mở bằng trình duyệt bất kỳ hoặc đưa lên GitHub Pages / Vercel / Netlify / Firebase Hosting là có thể dùng được ngay lập tức!
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">
            {lineCount} dòng • {fileSizeKb} KB
          </span>
        </div>

        {/* Khung hiển thị code với line numbers */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 text-[11px] font-mono text-slate-200">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            {code}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tất cả thư viện sử dụng CDN chính thức (Tailwind, Lucide, Google Firebase SDK)</span>
          <div className="flex items-center gap-2">
            <a
              href="/index-standalone.html"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 font-medium inline-flex items-center gap-1 hover:bg-slate-200/60 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở trang độc lập trong tab mới</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
