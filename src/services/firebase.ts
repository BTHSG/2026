import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  type Firestore
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage
} from 'firebase/storage';
import { FirebaseConfig, Submission } from '../types';

// Cấu hình Firebase mặc định (người dùng có thể thay đổi trong giao diện hoặc dán trực tiếp vào đây)
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyD-YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

const STORAGE_KEY_CONFIG = 'hsg_submission_firebase_config';
const STORAGE_KEY_LOCAL_SUBMISSIONS = 'hsg_submission_local_data';

// Kiểm tra xem cấu hình có phải là thông tin thật hay là placeholder
export function isConfigured(config: FirebaseConfig): boolean {
  if (!config || !config.apiKey || !config.projectId) return false;
  return (
    !config.apiKey.includes('YOUR_FIREBASE_API_KEY') &&
    !config.projectId.includes('your-project-id') &&
    config.apiKey.length > 10 &&
    config.projectId.length > 2
  );
}

export function getStoredFirebaseConfig(): FirebaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Lỗi khi đọc cấu hình từ localStorage:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

// Khởi tạo các dịch vụ Firebase một cách an toàn
let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export function initFirebaseService(config: FirebaseConfig) {
  if (!isConfigured(config)) {
    return { app: null, db: null, storage: null, isLive: false };
  }

  try {
    if (getApps().length === 0) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    firestoreInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    return { app: appInstance, db: firestoreInstance, storage: storageInstance, isLive: true };
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase SDK:", error);
    return { app: null, db: null, storage: null, isLive: false, error };
  }
}

// Lưu trữ danh sách bài nộp nội bộ khi ở chế độ Demo/Offline
export function getLocalSubmissions(): Submission[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOCAL_SUBMISSIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Lỗi đọc local submissions:", e);
  }

  // Dữ liệu mẫu ban đầu sinh động cho đội tuyển HSG
  const initialDemos: Submission[] = [
    {
      id: 'demo-1',
      studentName: 'Nguyễn Văn An - THPT Chuyên',
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      exerciseName: 'Bài 1: Tổng đoạn con lớn nhất (Max Subarray Sum)',
      fileUrl: '#',
      fileName: 'max_subarray.cpp',
      fileSize: 1542,
      fileExt: '.cpp',
      language: 'C++',
      codePreview: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i = 0; i < n; i++) cin >> a[i];
    
    long long max_so_far = a[0], curr_max = a[0];
    for (int i = 1; i < n; i++) {
        curr_max = max(a[i], curr_max + a[i]);
        max_so_far = max(max_so_far, curr_max);
    }
    cout << max_so_far << "\\n";
    return 0;
}`
    },
    {
      id: 'demo-2',
      studentName: 'Trần Thị Mai - Lớp 11 Tin',
      submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      exerciseName: 'Bài 2: Tìm đường đi ngắn nhất (Dijkstra / BFS)',
      fileUrl: '#',
      fileName: 'dijkstra_shortest_path.py',
      fileSize: 2130,
      fileExt: '.py',
      language: 'Python',
      codePreview: `import heapq
import sys

def dijkstra(n, adj, start):
    dist = [float('inf')] * (n + 1)
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`
    },
    {
      id: 'demo-3',
      studentName: 'Lê Hoàng Minh - Đội tuyển QG',
      submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      exerciseName: 'Bài 3: Quy hoạch động Cái túi (0/1 Knapsack)',
      fileUrl: '#',
      fileName: 'knapsack_dp.pas',
      fileSize: 1850,
      fileExt: '.pas',
      language: 'Pascal',
      codePreview: `Program Knapsack;
uses math;
var
  n, w, i, j: integer;
  weight, val: array[1..1000] of integer;
  dp: array[0..1000, 0..1000] of integer;
begin
  // Doc du lieu va giai thuat quy hoach dong
end.`
    }
  ];

  localStorage.setItem(STORAGE_KEY_LOCAL_SUBMISSIONS, JSON.stringify(initialDemos));
  return initialDemos;
}

export function saveLocalSubmission(sub: Submission): void {
  const list = getLocalSubmissions();
  list.unshift(sub);
  localStorage.setItem(STORAGE_KEY_LOCAL_SUBMISSIONS, JSON.stringify(list));
}

export function deleteLocalSubmission(id: string): void {
  const list = getLocalSubmissions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_LOCAL_SUBMISSIONS, JSON.stringify(list));
}

