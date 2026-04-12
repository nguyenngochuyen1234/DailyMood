import { JournalEntry, Journey } from '../types/models';
import { backupToDrive } from './googleDriveService';

export interface BackupData {
  version: string;
  timestamp: number;
  data: {
    journals: JournalEntry[];
    journeys: Journey[];
  };
}

/**
 * Hàm đồng bộ dữ liệu tổng hợp lên Google Drive.
 * Nếu có accessToken, sẽ gọi API thực tế. Nếu không, sẽ log ra console (giả lập).
 */
export const syncAllToDrive = async (
  accessToken: string | null,
  journals: JournalEntry[],
  journeys: Journey[]
): Promise<void> => {
  console.log("Đang bắt đầu quá trình sao lưu lên Drive...");

  const payload: BackupData = {
    version: "1.0",
    timestamp: Date.now(),
    data: {
      journals: journals,
      journeys: journeys
    }
  };

  if (accessToken) {
    try {
      await backupToDrive(accessToken, payload);
      console.log("✅ Sao lưu lên Google Drive thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi gọi Google Drive API:", error);
      throw error;
    }
  } else {
    // Chế độ giả lập nếu chưa có token
    console.log("⚠️ Không có Access Token. Đang chạy ở chế độ giả lập.");
    console.log("Payload JSON dự kiến:", JSON.stringify(payload, null, 2));
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [Giả lập] Sao lưu thành công!");
        resolve();
      }, 1500);
    });
  }
};

/**
 * Hàm tiện ích để đồng bộ nhanh một bản ghi duy nhất (thường dùng cho Pro)
 * Thực tế vẫn nên gửi toàn bộ state để đảm bảo đồng bộ nhất quán.
 */
export const syncJournalToDrive = async (
    accessToken: string | null,
    journal: JournalEntry,
    allJournals: JournalEntry[],
    allJourneys: Journey[]
): Promise<void> => {
    // Ghép journal mới vào danh sách hiện tại (nếu chưa có) và đồng bộ tất cả
    const journals = allJournals.find(j => j.id === journal.id) 
        ? allJournals 
        : [...allJournals, journal];
        
    return syncAllToDrive(accessToken, journals, allJourneys);
};
