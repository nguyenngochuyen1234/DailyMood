export const translations = {
  vi: {
    // Navigation
    home: "Trang chủ",
    stats: "Thống kê",
    journeys: "Hành trình",
    settings: "Cài đặt",
    
    // Home
    home_title: "Hôm nay bạn cảm thấy như thế nào?",
    
    // Stats
    stats_title: "Thống kê cảm xúc",
    daily_stats: "Chi tiết ngày",
    mood_mix: "Tỷ lệ cảm xúc",
    no_data: "Không có dữ liệu",
    mood: "Cảm xúc",
    images: "Hình ảnh",
    
    // Mood Names (Fallback)
    very_happy: "Rất vui",
    happy: "Hạnh phúc",
    neutral: "Bình thường",
    sad: "Buồn",
    angry: "Tức giận",
    
    // Empty State
    empty_title: "Bạn chưa có nhật ký nào",
    empty_desc: "Hãy viết những dòng đầu tiên để lưu giữ cảm xúc của bạn mỗi ngày.",
    empty_button: "Viết nhật ký đầu tiên",
    no_image_desc: "Bạn chưa có bài viết nào có ảnh.",
    
    // Settings
    profile: "Hồ sơ",
    notifications: "Thông báo",
    language: "Ngôn ngữ",
    data_sync: "Dữ liệu & Đồng bộ",
    lock_app: "Khóa ứng dụng",
    feedback: "Góp ý",
    rate_app: "Đánh giá ứng dụng",
    privacy: "Chính sách bảo mật",
    logout: "Đăng xuất",
    login_google: "Đăng nhập Google",
    
    // General
    save: "Lưu",
    cancel: "Hủy",
    edit: "Sửa",
    delete: "Xóa",
    back: "Quay lại",
    view_all: "Xem tất cả",
    theme: "Giao diện",
    
    // Month Names
    jan: "Tháng 1", feb: "Tháng 2", mar: "Tháng 3", apr: "Tháng 4", 
    may: "Tháng 5", jun: "Tháng 6", jul: "Tháng 7", aug: "Tháng 8", 
    sep: "Tháng 9", oct: "Tháng 10", nov: "Tháng 11", dec: "Tháng 12"
  },
  en: {
    // Navigation
    home: "Home",
    stats: "Statistics",
    journeys: "Journeys",
    settings: "Settings",
    
    // Home
    home_title: "Today's Peace",
    home_question: "How are you feeling today?",
    
    // Stats
    stats_title: "Mood Statistics",
    daily_stats: "Daily Details",
    mood_mix: "Mood Mix",
    no_data: "No data",
    mood: "Mood",
    images: "Images",
    
    // Mood Names (Fallback)
    very_happy: "Very Happy",
    happy: "Happy",
    neutral: "Neutral",
    sad: "Sad",
    angry: "Angry",
    
    // Empty State
    empty_title: "No journal entries yet",
    empty_desc: "Write your first entry to capture your feelings every day.",
    empty_button: "Write first entry",
    no_image_desc: "You don't have any posts with photos yet.",
    
    // Settings
    profile: "Profile",
    notifications: "Notifications",
    language: "Language",
    data_sync: "Data & Sync",
    lock_app: "Lock App",
    feedback: "Feedback",
    rate_app: "Rate App",
    privacy: "Privacy Policy",
    logout: "Logout",
    login_google: "Login with Google",
    
    // General
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    view_all: "View All",
    theme: "Theme",
    
    // Month Names
    jan: "January", feb: "February", mar: "March", apr: "April", 
    may: "May", jun: "June", jul: "July", aug: "August", 
    sep: "September", oct: "October", nov: "November", dec: "December"
  }
};

export type LanguageCode = keyof typeof translations;
export type TranslationKey = keyof typeof translations['vi'];
