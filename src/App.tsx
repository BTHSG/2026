import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SubmissionForm } from './components/SubmissionForm';
import { RecentSubmissions } from './components/RecentSubmissions';
import { CodeViewerModal } from './components/CodeViewerModal';
import { ConfigModal } from './components/ConfigModal';
import { RulesModal } from './components/RulesModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { 
  Submission, 
  FirebaseConfig 
} from './types';
import { 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  initFirebaseService, 
  getLocalSubmissions, 
  saveLocalSubmission,
  deleteLocalSubmission
} from './services/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { 
  Trophy, 
  AlertTriangle, 
  Sparkles, 
  Share2, 
  Check, 
  Globe, 
  CheckCircle,
  History,
  Send,
  FileCode
} from 'lucide-react';

export default function App() {
  // 1. Firebase Config & Services
  const [config, setConfig] = useState<FirebaseConfig>(getStoredFirebaseConfig);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [firebaseServices, setFirebaseServices] = useState<{
    db: any;
    storage: any;
  }>({ db: null, storage: null });

  // 2. Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  // 3. Tab State ('submit' cho học sinh nộp bài chuẩn như trong hình, 'list' để xem danh sách bài đã nộp)
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('submit');

  // 4. Modals State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewingCodeSub, setViewingCodeSub] = useState<Submission | null>(null);

  // 5. Trạng thái sao chép link công khai cho học sinh
  const [copiedLink, setCopiedLink] = useState(false);

  // Khởi tạo Firebase Service khi cấu hình thay đổi
  useEffect(() => {
    const result = initFirebaseService(config);
    if (result.isLive && result.db && result.storage) {
      setIsLive(true);
      setFirebaseServices({ db: result.db, storage: result.storage });

      // Lắng nghe dữ liệu thời gian thực từ Cloud Firestore
      try {
        const q = query(
          collection(result.db, 'submissions'),
          orderBy('submittedAt', 'desc'),
          limit(50)
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list: Submission[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              list.push({
                id: doc.id,
                studentName: data.studentName,
                submittedAt: data.submittedAt,
                exerciseName: data.exerciseName,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileSize: data.fileSize,
                codePreview: data.codePreview
              });
            });
            setSubmissions(list);
            setIsLoadingSubmissions(false);
          },
          (err) => {
            console.warn('Lỗi lắng nghe Firestore, chuyển sang hiển thị dữ liệu cục bộ:', err);
            setSubmissions(getLocalSubmissions());
            setIsLoadingSubmissions(false);
          }
        );

        return () => unsubscribe();
      } catch (e) {
        console.error('Lỗi thiết lập Firestore listener:', e);
        setSubmissions(getLocalSubmissions());
        setIsLoadingSubmissions(false);
      }
    } else {
      setIsLive(false);
      setFirebaseServices({ db: null, storage: null });
      setSubmissions(getLocalSubmissions());
      setIsLoadingSubmissions(false);
    }
  }, [config]);

  // Xử lý nộp bài tập (Upload file lên Storage & Metadata lên Firestore)
  const handleSubmission = async (
    data: {
      studentName: string;
      submittedAt: string;
      exerciseName: string;
      file: File;
      codePreview?: string;
    },
    onProgress: (percent: number) => void
  ) => {
    const { studentName, submittedAt, exerciseName, file, codePreview } = data;
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `submissions/${timestamp}_${safeFileName}`;

    if (isLive && firebaseServices.storage && firebaseServices.db) {
      // --- NỘP THẬT LÊN CLOUD FIREBASE ---
      const storageRef = ref(firebaseServices.storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(progress);
          },
          (error) => {
            console.error('Lỗi Firebase Storage:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

              // Lưu vào Firestore Collection: submissions
              await addDoc(collection(firebaseServices.db, 'submissions'), {
                studentName,
                submittedAt,
                exerciseName,
                fileUrl: downloadUrl,
                fileName: file.name,
                fileSize: file.size,
                storagePath,
                codePreview: codePreview || '',
                createdAt: serverTimestamp()
              });

              resolve();
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } else {
      // --- CHẾ ĐỘ THỬ NGHIỆM NỘI BỘ (DEMO MODE) ---
      for (let p = 15; p <= 100; p += 20) {
        onProgress(p);
        await new Promise((r) => setTimeout(r, 100));
      }

      const blobUrl = URL.createObjectURL(file);
      const newSub: Submission = {
        id: 'local-' + timestamp,
        studentName,
        submittedAt,
        exerciseName,
        fileUrl: blobUrl,
        fileName: file.name,
        fileSize: file.size,
        codePreview
      };

      saveLocalSubmission(newSub);
      setSubmissions((prev) => [newSub, ...prev]);
    }
  };

  const handleSaveConfig = (newConfig: FirebaseConfig) => {
    saveFirebaseConfig(newConfig);
    setConfig(newConfig);
  };

  // Xử lý xóa bài nộp
  const handleDeleteSubmission = async (sub: Submission) => {
    if (!sub.id) return;
    try {
      if (isLive && firebaseServices.db) {
        // Xóa document trên Firestore
        await deleteDoc(doc(firebaseServices.db, 'submissions', sub.id));

        // Thử xóa file đính kèm trên Firebase Storage nếu có
        if (firebaseServices.storage && sub.storagePath) {
          try {
            const fileRef = ref(firebaseServices.storage, sub.storagePath);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.warn('Lưu ý khi xóa file Storage:', storageErr);
          }
        }
      } else {
        // Xóa khỏi bộ nhớ cục bộ
        deleteLocalSubmission(sub.id);
        setSubmissions((prev) => prev.filter((s) => s.id !== sub.id));
      }
    } catch (err) {
      console.error('Lỗi khi xóa bài nộp:', err);
      window.alert('Không thể xóa bài nộp. Hãy kiểm tra Firestore Rules (cần mở quyền: allow delete: if true;)');
    }
  };

  // Lấy URL công khai để gửi cho học sinh
  const publicWebUrl = window.location.origin.includes('localhost') 
    ? 'https://ais-pre-wi77wfmzpiudzrwfazcje7-89029880235.asia-southeast1.run.app'
    : window.location.href.split('?')[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicWebUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* 1. Header & Navigation (Có tiêu đề đúng như trong ảnh) */}
      <Navbar
        isLive={isLive}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        submissionCount={submissions.length}
        onOpenConfig={() => setShowConfigModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onCopyShareLink={handleCopyLink}
        copiedShareLink={copiedLink}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Hộp Thông Báo Đường Link Chia Sẻ Công Khai Cho Học Sinh */}
        <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Đường Link Công Khai Gửi Học Sinh:
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  Không cần đăng nhập / Không cần mã
                </span>
              </div>
              <p className="text-xs text-indigo-600 font-mono mt-0.5 break-all select-all">
                {publicWebUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                copiedLink 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Sao chép link gửi HS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Nội dung theo Tab: TAB 1 LÀ FORM NỘP BÀI TẬP TRUNG ĐÚNG 100% NHƯ TRONG HÌNH */}
        {activeTab === 'submit' ? (
          <div className="max-w-xl mx-auto w-full">
            <SubmissionForm
              onSubmit={handleSubmission}
              isLive={isLive}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveTab('list')}
                className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Xem danh sách bài đã nộp gần đây ({submissions.length} bài)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('submit')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Quay lại biểu mẫu nộp bài</span>
              </button>
            </div>
            <RecentSubmissions
              submissions={submissions}
              onViewCode={(sub) => setViewingCodeSub(sub)}
              onDeleteSubmission={handleDeleteSubmission}
              isLoading={isLoadingSubmissions}
            />
          </div>
        )}

      </main>

      {/* 4. Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Cổng Nộp Bài Đội Tuyển HSG Tin Học • Dành cho giáo viên &amp; học sinh</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowRulesModal(true)}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              Cấu hình Rules &amp; CORS
            </button>
            <span>•</span>
            <button
              onClick={() => setShowExportModal(true)}
              className="hover:text-indigo-600 font-medium text-indigo-600 transition cursor-pointer flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Tải file index.html độc lập</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      {viewingCodeSub && (
        <CodeViewerModal
          submission={viewingCodeSub}
          onClose={() => setViewingCodeSub(null)}
        />
      )}

      {showConfigModal && (
        <ConfigModal
          currentConfig={config}
          onSave={handleSaveConfig}
          onClose={() => setShowConfigModal(false)}
          isLive={isLive}
        />
      )}

      {showRulesModal && (
        <RulesModal
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {showExportModal && (
        <StandaloneExportModal
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
}
