import React, { useState } from 'react';
import { X, Copy, Check, Code, FileText, User } from 'lucide-react';
import { Submission } from '../types';

interface CodeViewerModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ submission, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!submission) return null;

  const codeContent = submission.codePreview || `// Tệp này chưa có bản xem trước trực tiếp (${submission.fileName})\n// Vui lòng bấm 'Tải về' để mở trên IDE (CodeBlocks, VS Code, Dev-C++...)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeContent.split('\n');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{submission.fileName}</span>
                <span className="text-[11px] font-normal text-slate-500 font-sans">
                  ({submission.exerciseName})
                </span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3 text-slate-400" />
                Học sinh: <strong className="text-slate-700">{submission.studentName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao chép code</span>
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

        {/* Code View with Line Numbers */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 text-xs font-mono text-slate-200">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/80">
                  <td className="w-10 pr-4 text-right text-slate-600 select-none align-top font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre font-mono leading-relaxed pl-2 text-slate-200 border-l border-slate-800">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số dòng: {lines.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition cursor-pointer"
          >
            Đóng lại
          </button>
        </div>

      </div>
    </div>
  );
};
