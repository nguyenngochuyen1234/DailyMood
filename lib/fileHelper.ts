import * as FileSystem from "expo-file-system/legacy";

const IMAGE_DIR = `${FileSystem.documentDirectory}images/`;

/**
 * Đảm bảo thư mục tồn tại
 */
export const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
};

export const getFileNameFromUri = (uri: string): string => {
  return uri.split("/").pop() || `image_${Date.now()}.jpg`;
};

export const getLocalImagePath = (fileName: string): string => {
  return `${IMAGE_DIR}${fileName}`;
};

export const resolveImageUri = (uri: string): string => {
  if (!uri) return uri;
  if (
    uri.startsWith("file://") ||
    uri.startsWith("http://") ||
    uri.startsWith("https://")
  ) {
    return uri;
  }
  return getLocalImagePath(uri);
};

/**
 * Lưu ảnh vào bộ nhớ local nội bộ của ứng dụng để tránh bị mất khi xóa cache
 * @param uri URI của ảnh từ camera hoặc thư viện
 * @returns URI mới của ảnh đã được lưu
 */
export const saveImageLocally = async (uri: string): Promise<string> => {
  try {
    await ensureDirExists();

    // Tạo tên file duy nhất dựa trên timestamp
    const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;
    const newUri = `${IMAGE_DIR}${Date.now()}_${fileName}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });

    return newUri;
  } catch (error) {
    console.error("Lỗi khi lưu ảnh local:", error);
    return uri; // Trả về uri gốc nếu lỗi
  }
};
