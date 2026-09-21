import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Database, HardDrive, Globe, AlertCircle, Terminal } from 'lucide-react';
import { STANDALONE_FIREBASE_RULES } from '../data/standaloneTemplate';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'firestore' | 'storage' | 'cors'>('firestore');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5 text-indigo-600">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hướng Dẫn Cấu Hình Firebase Rules &amp; CORS
              </h3>
              <p className="text-xs text-slate-500">
                Giải quyết lỗi phân quyền (Permission Denied) và chặn tên miền (CORS) khi học sinh nộp bài
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

        {/* Tab Selection */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('firestore')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'firestore'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Firestore Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>2. Storage Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('cors')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cors'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. Cấu hình CORS</span>
          </button>
        </div>

        {/* Content theo từng Tab */}
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed flex-1">
          
          {/* TAB 1: FIRESTORE RULES */}
          {activeTab === 'firestore' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-indigo-900">Mục đích quy tắc Firestore:</h4>
                  <p className="text-[11px] mt-0.5">
                    Cho phép bất kỳ học sinh nào trong đội tuyển nộp bài giải mới (<code className="font-mono font-semibold">create</code>) và xem danh sách bài đã nộp (<code className="font-mono font-semibold">read</code>), nhưng <strong>ngăn chặn chỉnh sửa hoặc xóa</strong> (<code className="font-mono font-semibold">update, delete = false</code>) để đảm bảo tính minh bạch và tránh việc học sinh khác sửa bài của bạn.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Nội dung dán vào tab <em>Firestore Database &gt; Rules</em>:
                  </span>
                  <button
                    onClick={() => handleCopy(STANDALONE_FIREBASE_RULES.firestoreRules, 'firestore')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'firestore' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép quy tắc</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{STANDALONE_FIREBASE_RULES.firestoreRules}</code>
                </pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
                <p className="font-semibold text-slate-800">Các bước thực hiện trên Firebase Console:</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  <li>Vào <strong>Firebase Console</strong> và chọn dự án của bạn.</li>
                  <li>Chọn menu <strong>Build &gt; Firestore Database</strong>.</li>
                  <li>Nếu chưa tạo, bấm <strong>Create database</strong> (chọn vị trí gần VN như <code className="font-mono">asia-southeast1</code>).</li>
                  <li>Chuyển qua tab <strong>Rules</strong>, xóa toàn bộ nội dung cũ và dán đoạn code phía trên vào.</li>
                  <li>Bấm <strong>Publish</strong> để kích hoạt.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: STORAGE RULES */}
          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-emerald-900">Mục đích quy tắc Storage:</h4>
                  <p className="text-[11px] mt-0.5">
                    Cho phép học sinh tải tệp mã nguồn lên thư mục <code className="font-mono font-semibold">submissions/</code> với điều kiện dung lượng tệp <strong>dưới 10MB</strong>. Ngăn chặn việc tải lên các tệp quá lớn gây tốn băng thông hoặc sửa đè tệp của thí sinh khác.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Nội dung dán vào tab <em>Storage &gt; Rules</em>:
                  </span>
                  <button
                    onClick={() => handleCopy(STANDALONE_FIREBASE_RULES.storageRules, 'storage')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'storage' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép quy tắc</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{STANDALONE_FIREBASE_RULES.storageRules}</code>
                </pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
                <p className="font-semibold text-slate-800">Các bước thực hiện:</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  <li>Vào <strong>Firebase Console &gt; Storage</strong>.</li>
                  <li>Nếu chưa bật, chọn <strong>Get Started</strong> để kích hoạt Cloud Storage Bucket.</li>
                  <li>Chuyển sang tab <strong>Rules</strong>, dán đoạn quy tắc trên và bấm <strong>Publish</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: CORS STORAGE */}
          {activeTab === 'cors' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-amber-900">Tại sao cần cấu hình CORS cho Storage?</h4>
                  <p className="text-[11px] mt-0.5 text-amber-800">
                    Khi học sinh mở file <code className="font-mono">index.html</code> trực tiếp từ máy (file://, localhost hoặc tên miền web trường học), trình duyệt sẽ gửi yêu cầu pre-flight HTTP OPTIONS. Nếu Storage chưa cấp quyền CORS, trình duyệt sẽ chặn với lỗi <strong className="font-mono">"No 'Access-Control-Allow-Origin' header"</strong>.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Bước 1: Tạo file <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">cors.json</code>:
                  </span>
                  <button
                    onClick={() => handleCopy(STANDALONE_FIREBASE_RULES.corsJson, 'corsJson')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'corsJson' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép file cors.json</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{STANDALONE_FIREBASE_RULES.corsJson}</code>
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    Bước 2: Chạy lệnh gsutil trong Google Cloud Shell:
                  </span>
                  <button
                    onClick={() => handleCopy(STANDALONE_FIREBASE_RULES.corsCommand, 'corsCmd')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'corsCmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép lệnh</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép lệnh</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{STANDALONE_FIREBASE_RULES.corsCommand}</code>
                </pre>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Gợi ý: Truy cập <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">console.cloud.google.com</a>, bấm biểu tượng Terminal (Cloud Shell) ở góc trên bên phải, tạo file <code className="font-mono">nano cors.json</code> rồi dán và chạy lệnh trên.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition cursor-pointer"
          >
            Đã hiểu, đóng lại
          </button>
        </div>

      </div>
    </div>
  );
};
