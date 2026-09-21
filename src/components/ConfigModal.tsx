import React, { useState } from 'react';
import { X, Check, Save, RotateCcw, HelpCircle, Key, Database, Sparkles } from 'lucide-react';
import { FirebaseConfig } from '../types';
import { DEFAULT_FIREBASE_CONFIG, isConfigured } from '../services/firebase';

interface ConfigModalProps {
  currentConfig: FirebaseConfig;
  onSave: (config: FirebaseConfig) => void;
  onClose: () => void;
  isLive: boolean;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  currentConfig,
  onSave,
  onClose,
  isLive
}) => {
  const [formData, setFormData] = useState<FirebaseConfig>({ ...currentConfig });
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [parseError, setParseError] = useState('');

  const handleChange = (field: keyof FirebaseConfig, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleJsonPaste = () => {
    try {
      setParseError('');
      // Hỗ trợ cả định dạng JSON chuẩn lẫn cú pháp JavaScript const firebaseConfig = { ... }
      let clean = jsonInput.trim();
      if (clean.includes('{') && clean.includes('}')) {
        clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1);
        // Chuyển đổi key JS không có ngoặc kép sang JSON hợp lệ nếu cần
        clean = clean.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
        // Xóa dấu phẩy thừa trước ngoặc đóng
        clean = clean.replace(/,\s*}/g, '}');
      }
      const parsed = JSON.parse(clean);
      setFormData((prev) => ({
        ...prev,
        apiKey: parsed.apiKey || prev.apiKey,
        authDomain: parsed.authDomain || prev.authDomain,
        projectId: parsed.projectId || prev.projectId,
        storageBucket: parsed.storageBucket || prev.storageBucket,
        messagingSenderId: parsed.messagingSenderId || prev.messagingSenderId,
        appId: parsed.appId || prev.appId
      }));
      setShowJsonMode(false);
      setJsonInput('');
    } catch (e: any) {
      setParseError('Không thể phân tích cú pháp. Vui lòng kiểm tra lại định dạng JSON/JS object.');
    }
  };

  const handleSave = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetToDemo = () => {
    setFormData({ ...DEFAULT_FIREBASE_CONFIG });
    onSave(DEFAULT_FIREBASE_CONFIG);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cấu Hình Kết Nối Firebase
              </h3>
              <p className="text-xs text-slate-500">
                Nhập thông tin Firebase Project để lưu Firestore và Storage thật
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trạng thái hiện tại */}
        <div className={`p-3 rounded-xl mb-4 text-xs flex items-center justify-between border ${
          isConfigured(formData)
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured(formData) ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>
              {isConfigured(formData)
                ? 'Thông số Project ID đã sẵn sàng.'
                : 'Đang dùng cấu hình mẫu (Chế độ Thử nghiệm nội bộ).'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowJsonMode(!showJsonMode)}
            className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            {showJsonMode ? 'Điền từng ô' : 'Dán nhanh mã JS'}
          </button>
        </div>

        {/* Chế độ dán nhanh JSON / JS Code */}
        {showJsonMode ? (
          <div className="space-y-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700">
              Dán toàn bộ khối <code className="font-mono text-indigo-600">const firebaseConfig = &#123; ... &#125;</code>:
            </label>
            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{\n  apiKey: "AIzaSy...",\n  projectId: "hsg-tin-hoc",\n  storageBucket: "hsg-tin-hoc.appspot.com",\n  ...\n}`}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {parseError && <p className="text-[11px] text-rose-600 font-medium">{parseError}</p>}
            <button
              type="button"
              onClick={handleJsonPaste}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Áp dụng thông số
            </button>
          </div>
        ) : (
          /* Form chi tiết từng ô */
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">API Key (apiKey):</label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project ID (projectId):</label>
                <input
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => handleChange('projectId', e.target.value)}
                  placeholder="my-hsg-project"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Auth Domain:</label>
                <input
                  type="text"
                  value={formData.authDomain}
                  onChange={(e) => handleChange('authDomain', e.target.value)}
                  placeholder="project-id.firebaseapp.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Bucket:</label>
                <input
                  type="text"
                  value={formData.storageBucket}
                  onChange={(e) => handleChange('storageBucket', e.target.value)}
                  placeholder="project-id.appspot.com hoặc .firebasestorage.app"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">App ID:</label>
                <input
                  type="text"
                  value={formData.appId}
                  onChange={(e) => handleChange('appId', e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Messaging Sender ID:</label>
              <input
                type="text"
                value={formData.messagingSenderId}
                onChange={(e) => handleChange('messagingSenderId', e.target.value)}
                placeholder="123456789012"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Hướng dẫn lấy config */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Để lấy các thông số trên: Truy cập <strong>Firebase Console</strong> &gt; Cài đặt dự án (Project Settings) &gt; Tab <strong>General</strong> &gt; Kéo xuống mục <strong>Your apps</strong> &gt; Chọn Web App (&lt;/&gt;) để xem cấu hình.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDemo}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Về mặc định</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu &amp; Áp dụng</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
