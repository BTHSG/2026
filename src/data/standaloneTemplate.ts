export const STANDALONE_FIREBASE_RULES = {
  firestoreRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép học sinh trong đội tuyển nộp bài vào collection 'submissions'
    match /submissions/{submissionId} {
      // Học sinh và giáo viên được phép xem danh sách bài nộp và tạo mới
      allow read, create: if true;
      // Cho phép xóa bài nộp khi cần dọn dẹp hoặc hủy bài
      allow delete: if true;
      // Khóa quyền chỉnh sửa (update) để tránh sửa đổi thời gian/nội dung sau khi nộp
      allow update: if false;
    }
  }
}`,

  storageRules: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Đường dẫn lưu trữ tệp bài giải: submissions/{timestamp}_{fileName}
    match /submissions/{allPaths=**} {
      // Cho phép tải tệp xuống và tải lên nếu tệp < 10MB
      allow read, create: if request.resource.size < 10 * 1024 * 1024;
      // Không cho phép ghi đè hoặc xóa tệp sau khi đã gửi lên Storage
      allow update, delete: if false;
    }
  }
}`,

  corsJson: `[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "x-goog-resumable"
    ]
  }
]`,

  corsCommand: `gsutil cors set cors.json gs://<your-storage-bucket-name>`
};

export async function fetchStandaloneHtml(): Promise<string> {
  try {
    const res = await fetch('/index-standalone.html');
    if (res.ok) {
      return await res.text();
    }
  } catch (e) {
    console.error("Lỗi tải standalone file:", e);
  }
  return `<!-- Vui lòng tải file trực tiếp tại /public/index-standalone.html -->`;
}
