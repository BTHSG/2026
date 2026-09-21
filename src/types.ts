export interface Submission {
  id?: string;
  studentName: string;
  submittedAt: string; // ISO string or formatted datetime
  exerciseName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  fileExt?: string;
  language?: string;
  storagePath?: string;
  codePreview?: string; // Preview text for text code files
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const DEFAULT_EXERCISES = [
  "Bài tập 1",
  "Bài tập 2",
  "Bài tập 3",
  "Bài 1: Tổng đoạn con lớn nhất (Max Subarray Sum)",
  "Bài 2: Tìm đường đi ngắn nhất (Dijkstra / BFS)",
  "Bài 3: Quy hoạch động Cái túi (0/1 Knapsack)",
  "Bài 4: Xử lý chuỗi Palindrome đối xứng",
  "Bài 5: Phân tích thừa số nguyên tố & Sàng Eratosthenes",
  "Bài 6: Cây phân đoạn (Segment Tree / Fenwick)",
  "Bài 7: Đếm thành phần liên thông trên đồ thị",
  "Bài 8: Xếp balo phân số (Greedy Algorithm)"
];

export const ALLOWED_EXTENSIONS = ['.cpp', '.py', '.pas', '.java', '.c', '.zip', '.rar'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
