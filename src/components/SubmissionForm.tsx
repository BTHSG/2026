import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  User, 
  Calendar, 
  BookOpen, 
  FileCode2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Send, 
  Loader2,
  Trash2,
  Eye,
  FileCheck
} from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, DEFAULT_EXERCISES, Submission } from '../types';

interface SubmissionFormProps {
  onSubmit: (submissionData: {
    studentName: string;
    submittedAt: string;
    exerciseName: string;
    file: File;
    codePreview?: string;
  }, onProgress: (percent: number) => void) => Promise<void>;
  isLive: boolean;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, isLive }) => {
  // 1. Form state
  const [studentName, setStudentName] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewCode, setFilePreviewCode] = useState<string>('');
  const [showCodePreview, setShowCodePreview] = useState(false);

  // 2. Upload / Progress / Feedback state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tự động gán thời gian hiện tại lúc mở trang theo giờ địa phương
  useEffect(() => {
    const initCurrentDateTime = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
      setSubmittedAt(localISOTime);
    };
    initCurrentDateTime();

    // Khôi phục tên học sinh đã nộp trước đó từ localStorage để tiện cho học sinh
    const savedName = localStorage.getItem('hsg_last_student_name');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    return '.' + ext;
  };

  const getLanguageLabel = (ext: string): { label: string; color: string } => {
    switch (ext) {
      case '.cpp':
        return { label: 'C++', color: 'bg-blue-600' };
      case '.c':
        return { label: 'C', color: 'bg-sky-600' };
      case '.py':
        return { label: 'Python', color: 'bg-emerald-600' };
      case '.pas':
        return { label: 'Pascal', color: 'bg-amber-600' };
      case '.java':
        return { label: 'Java', color: 'bg-rose-600' };
      case '.zip':
      case '.rar':
        return { label: 'Nén (Zip/Rar)', color: 'bg-purple-600' };
      default:
        return { label: 'Code', color: 'bg-slate-600' };
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = getFileExtension(file.name);

    // Kiểm tra định dạng đuôi tệp
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setAlert({
        type: 'error',
        title: 'Định dạng tệp không được hỗ trợ',
        message: `Hệ thống chỉ chấp nhận: ${ALLOWED_EXTENSIONS.join(', ')}. Tệp của bạn là "${ext}".`
      });
      setSelectedFile(null);
      setFilePreviewCode('');
      return;
    }

    // Kiểm tra dung lượng tệp
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setAlert({
        type: 'error',
        title: 'Tệp vượt quá kích thước cho phép',
        message: `Kích thước tệp là ${formatFileSize(file.size)}, vượt quá giới hạn tối đa 10MB.`
      });
      setSelectedFile(null);
      setFilePreviewCode('');
      return;
    }

    // Đọc trước mã nguồn nếu là text file (.cpp, .py, .pas, .java, .c)
    if (['.cpp', '.py', '.pas', '.java', '.c'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFilePreviewCode(content || '');
      };
      reader.readAsText(file);
    } else {
      setFilePreviewCode('');
    }

    setSelectedFile(file);
    setAlert(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFilePreviewCode('');
    setShowCodePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation các trường
    if (!studentName.trim()) {
      setAlert({
        type: 'error',
        title: 'Vui lòng nhập họ và tên',
        message: 'Họ và tên học sinh là thông tin bắt buộc để ghi nhận bài nộp.'
      });
      return;
    }

    if (!selectedFile) {
      setAlert({
        type: 'error',
        title: 'Chưa đính kèm mã nguồn',
        message: 'Vui lòng chọn tệp bài giải (.cpp, .py, .pas, .java, .c, .zip, .rar).'
      });
      return;
    }

    const finalExerciseName = exerciseName.trim();
    if (!finalExerciseName) {
      setAlert({
        type: 'error',
        title: 'Chưa nhập tên bài tập',
        message: 'Vui lòng điền tên bài tập (VD: Bài tập 1, Bài 2,...).'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAlert(null);

    try {
      // Lưu lại tên học sinh để tiện nộp các bài sau
      localStorage.setItem('hsg_last_student_name', studentName.trim());

      await onSubmit(
        {
          studentName: studentName.trim(),
          submittedAt,
          exerciseName: finalExerciseName,
          file: selectedFile,
          codePreview: filePreviewCode.slice(0, 1000)
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setAlert({
        type: 'success',
        title: 'Nộp bài thành công!',
        message: `Bài tập "${finalExerciseName}" (${selectedFile.name}) đã được hệ thống tiếp nhận an toàn.`
      });

      // Dọn dẹp form sau khi nộp
      setSelectedFile(null);
      setFilePreviewCode('');
      setShowCodePreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Lỗi khi nộp bài:', err);
      setAlert({
        type: 'error',
        title: 'Nộp bài thất bại',
        message: err.message || 'Đã có lỗi xảy ra trong quá trình tải tệp hoặc lưu dữ liệu. Vui lòng thử lại.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fileExt = selectedFile ? getFileExtension(selectedFile.name) : '';
  const fileLang = getLanguageLabel(fileExt);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      
      {/* Tiêu đề Box */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            Biểu Mẫu Nộp Bài
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Điền thông tin và tải lên tệp bài giải của bạn
          </p>
        </div>
      </div>

      {/* Alert thông báo kết quả */}
      {alert && (
        <div 
          className={`mb-5 p-4 rounded-xl text-sm border flex items-start gap-3 transition-all ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{alert.title}</h4>
            <p className="text-xs mt-0.5 leading-relaxed opacity-90">{alert.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Nộp Bài */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Trường 1: Họ và tên học sinh */}
        <div>
          <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Họ và tên học sinh <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="student-name"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="VD: Nguyễn Tuấn Anh - THPT Chuyên"
              disabled={isUploading}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Trường 2: Ngày và giờ nộp (mặc định là hiện tại, cho phép sửa) */}
        <div>
          <label htmlFor="submitted-at" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Thời gian nộp bài <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="datetime-local"
              id="submitted-at"
              required
              value={submittedAt}
              onChange={(e) => setSubmittedAt(e.target.value)}
              disabled={isUploading}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-60"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tự động gán thời điểm hiện tại khi mở trang (vẫn có thể điều chỉnh nếu nộp bổ sung).
          </p>
        </div>

        {/* Trường 3: Tên bài tập */}
        <div>
          <label htmlFor="exercise-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tên bài tập <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="exercise-input"
              required
              list="exercise-suggestions"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Nhập tên bài tập (VD: Bài tập 1, Bài 2, Dijkstra, SUM...)"
              disabled={isUploading}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-60"
            />
            <datalist id="exercise-suggestions">
              {DEFAULT_EXERCISES.map((ex, idx) => (
                <option key={idx} value={ex} />
              ))}
            </datalist>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gõ tên bài tập hoặc nhấp chuột để chọn nhanh từ danh sách gợi ý.
          </p>
        </div>

        {/* Trường 4: Tệp mã nguồn (Kéo thả hoặc chọn tệp) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tệp mã nguồn (.cpp, .py, .pas, .java, .c, .zip, .rar) <span className="text-rose-500">*</span>
          </label>

          <div
            id="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/20 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center relative group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".cpp,.py,.pas,.java,.c,.zip,.rar"
              className="hidden"
              disabled={isUploading}
            />

            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileCode2 className="w-5 h-5" />
            </div>

            <p className="text-xs font-medium text-slate-700">
              <span className="text-indigo-600 font-semibold">Bấm chọn tệp</span> hoặc kéo thả file vào đây
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Hỗ trợ: C++, Python, Pascal, Java, C hoặc file nén (.zip, .rar) &lt; 10MB
            </p>
          </div>

          {/* Chi tiết file đã chọn */}
          {selectedFile && (
            <div className="mt-2.5 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 truncate">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white ${fileLang.color}`}>
                  {fileLang.label}
                </span>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {filePreviewCode && (
                  <button
                    type="button"
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="p-1.5 text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    title="Xem trước mã nguồn"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">
                      {showCodePreview ? 'Ẩn' : 'Xem code'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Hủy chọn tệp"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hộp xem trước mã nguồn */}
          {showCodePreview && filePreviewCode && (
            <div className="mt-2 p-3 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 text-[11px] font-mono max-h-48 overflow-y-auto">
              <div className="flex justify-between items-center text-slate-400 pb-1.5 mb-1.5 border-b border-slate-800 text-[10px]">
                <span>Xem trước mã nguồn ({selectedFile?.name})</span>
                <span>{filePreviewCode.split('\n').length} dòng</span>
              </div>
              <pre className="whitespace-pre overflow-x-auto leading-relaxed">
                {filePreviewCode}
              </pre>
            </div>
          )}
        </div>

        {/* Thanh tiến trình Upload */}
        {isUploading && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
              <span>{isLive ? 'Đang truyền tệp lên Firebase...' : 'Đang xử lý bài tập...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Nút Nộp Bài */}
        <button
          type="submit"
          id="btn-submit"
          disabled={isUploading || !selectedFile}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tiến hành nộp bài...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Nộp bài tập</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
