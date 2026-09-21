import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Code, 
  Clock, 
  FileText, 
  Inbox, 
  ExternalLink,
  CheckCircle,
  Filter,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { Submission } from '../types';

interface RecentSubmissionsProps {
  submissions: Submission[];
  onViewCode: (submission: Submission) => void;
  onDeleteSubmission?: (submission: Submission) => void;
  isLoading: boolean;
}

export const RecentSubmissions: React.FC<RecentSubmissionsProps> = ({
  submissions,
  onViewCode,
  onDeleteSubmission,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    if (!filename) return '';
    const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    return ext;
  };

  const getLanguageBadge = (ext: string): { label: string; bg: string } => {
    switch (ext) {
      case 'cpp':
      case 'c':
        return { label: ext.toUpperCase(), bg: 'bg-blue-600' };
      case 'py':
        return { label: 'PYTHON', bg: 'bg-emerald-600' };
      case 'pas':
        return { label: 'PASCAL', bg: 'bg-amber-600' };
      case 'java':
        return { label: 'JAVA', bg: 'bg-rose-600' };
      case 'zip':
      case 'rar':
        return { label: 'ARCHIVE', bg: 'bg-purple-600' };
      default:
        return { label: (ext || 'CODE').toUpperCase(), bg: 'bg-slate-600' };
    }
  };

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return 'Vừa xong';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString.replace('T', ' ');
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} • ${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (sub.studentName && sub.studentName.toLowerCase().includes(q)) ||
        (sub.exerciseName && sub.exerciseName.toLowerCase().includes(q)) ||
        (sub.fileName && sub.fileName.toLowerCase().includes(q));

      const ext = getFileExtension(sub.fileName);
      let matchFilter = true;
      if (selectedFilter === 'cpp') matchFilter = ext === 'cpp' || ext === 'c';
      else if (selectedFilter === 'py') matchFilter = ext === 'py';
      else if (selectedFilter === 'pas') matchFilter = ext === 'pas';
      else if (selectedFilter === 'java') matchFilter = ext === 'java';
      else if (selectedFilter === 'archive') matchFilter = ext === 'zip' || ext === 'rar';

      return matchQuery && matchFilter;
    });
  }, [submissions, searchQuery, selectedFilter]);

  const filterOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'cpp', label: 'C/C++' },
    { key: 'py', label: 'Python' },
    { key: 'pas', label: 'Pascal' },
    { key: 'java', label: 'Java' },
    { key: 'archive', label: 'File nén' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-full">
      
      {/* Header Danh Sách */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Danh Sách Bài Đã Nộp Gần Đây
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem lịch sử, thông tin tệp và tải lại mã nguồn bài tập
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {filteredSubmissions.length} / {submissions.length} bài
          </span>
        </div>
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="space-y-2.5 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="input-search-submissions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, tên bài tập, tên file..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Lọc:
          </span>
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedFilter(opt.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedFilter === opt.key
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách các bài nộp */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[350px] max-h-[620px] pr-1">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
            <p className="text-xs">Đang đồng bộ danh sách bài nộp...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium text-slate-600">Chưa tìm thấy bài nộp nào</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Các bài nộp của học sinh sẽ hiển thị tại đây'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub, idx) => {
            const ext = getFileExtension(sub.fileName);
            const badge = getLanguageBadge(ext);
            const isTextCode = ['cpp', 'c', 'py', 'pas', 'java'].includes(ext) || Boolean(sub.codePreview);

            return (
              <div
                key={sub.id || idx}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs group"
              >
                {/* Thông tin bài nộp */}
                <div className="flex items-start space-x-3 truncate">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded text-white ${badge.bg} shrink-0 mt-0.5 shadow-2xs`}
                  >
                    {badge.label}
                  </span>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {sub.studentName}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium shrink-0">
                        {formatFileSize(sub.fileSize)}
                      </span>
                    </div>

                    <p className="text-xs text-indigo-600 font-medium truncate mt-0.5">
                      {sub.exerciseName}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-slate-600 truncate max-w-[200px]">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{sub.fileName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        {formatDateDisplay(sub.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Các nút Thao Tác (Xem code, Tải tệp, Xóa bài nộp) */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isTextCode && (
                    <button
                      type="button"
                      onClick={() => onViewCode(sub)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Xem mã nguồn trực tiếp"
                    >
                      <Code className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Xem code</span>
                    </button>
                  )}

                  {sub.fileUrl && sub.fileUrl !== '#' ? (
                    <a
                      href={sub.fileUrl}
                      download={sub.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Tải tệp mã nguồn về máy"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onViewCode(sub)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 font-medium text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Xem nội dung</span>
                    </button>
                  )}

                  {/* Nút Xóa ở cuối mỗi dòng bài nộp */}
                  {onDeleteSubmission && (
                    <button
                      type="button"
                      onClick={() => setSubmissionToDelete(sub)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs transition inline-flex items-center gap-1.5 cursor-pointer border border-rose-200/60"
                      title="Xóa bài nộp này"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden sm:inline">Xóa</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal Xác Nhận Xóa Bài Nộp */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <span>Xác nhận xóa bài nộp?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmissionToDelete(null)}
                  disabled={isDeleting}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bạn có chắc chắn muốn xóa bài nộp này không? Tệp và dữ liệu bài giải sẽ được xóa khỏi hệ thống.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Học sinh:</span>
                    <span className="font-semibold text-slate-900">{submissionToDelete.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bài tập:</span>
                    <span className="font-semibold text-indigo-600">{submissionToDelete.exerciseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tệp:</span>
                    <span className="font-mono text-slate-700">{submissionToDelete.fileName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmissionToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onDeleteSubmission && submissionToDelete) {
                      setIsDeleting(true);
                      await onDeleteSubmission(submissionToDelete);
                      setIsDeleting(false);
                      setSubmissionToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xác nhận xóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
