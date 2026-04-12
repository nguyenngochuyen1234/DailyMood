export interface Journey {
  id: string;
  name: string; // Tên hành trình
  description: string; // Mô tả
}

export interface JournalEntry {
  id: string;
  typeEmoji: number | string;
  time: string; // Định dạng ISO ngày tháng năm - giờ phút
  journeyId: string | null; // ID hành trình (trống nếu không chọn)
  description: string;
  images: string[]; // Chứa URI đường dẫn ảnh (Tối đa 3 ảnh)
}
