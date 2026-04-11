import { JournalEntry } from '../types/models';

/**
 * Mẫu JSON gửi lên driver:
 * {
 *   "version": "1.0",
 *   "timestamp": 1712863920000,
 *   "data": {
 *     "journals": [
 *       {
 *         "id": "12345",
 *         "typeEmoji": 1,
 *         "time": "2024-04-11T14:00:00.000Z",
 *         "journeyId": null,
 *         "title": "Ngay tuyet voi",
 *         "description": "Hom nay toi rat vui",
 *         "images": ["url1", "url2"]
 *       }
 *     ]
 *   }
 * }
 */

export const syncJournalToDrive = async (journal: JournalEntry): Promise<void> => {
  console.log("Đang đồng bộ nhật ký lên Drive...");
  
  const payload = {
    version: "1.0",
    timestamp: Date.now(),
    data: {
      journals: [journal]
    }
  };

  console.log("Payload JSON cho 1 nhật ký:", JSON.stringify(payload, null, 2));

  // Giả lập gọi API lên Google Drive hoặc Server
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Đồng bộ lên Drive thành công!");
      resolve();
    }, 1000);
  });
};

export const syncAllToDrive = async (journals: JournalEntry[]): Promise<void> => {
    console.log("Đang sao lưu toàn bộ dữ liệu lên Drive...");

    const payload = {
        version: "1.0",
        timestamp: Date.now(),
        data: {
            journals: journals
        }
    };
  
    console.log("Payload JSON sao lưu tất cả:", JSON.stringify(payload, null, 2));
  
    // Giả lập gọi API sao lưu
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Sao lưu toàn bộ thành công!");
            resolve();
        }, 1500);
    });
};
