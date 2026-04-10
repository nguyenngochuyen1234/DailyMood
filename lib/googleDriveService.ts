/**
 * Tải JSON lên Google Drive (App Data).
 * Dùng phương pháp 2 bước (Metadata -> Content) để tương thích tốt nhất với React Native.
 */
export async function backupToDrive(accessToken: string, data: object, fileName = 'dailymood_backup.json') {
  try {
    // 1. Tìm nếu file đã tồn tại
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and spaces='drive'`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

    let fileId = existingFile?.id;

    // 2. Nếu file chưa có, tạo metadata rỗng trước để lấy File ID
    if (!existingFile) {
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: fileName, mimeType: 'application/json' })
      });
      const createdFile = await createRes.json();
      fileId = createdFile.id;
    }

    // 3. Cập nhật dữ liệu vào file
    const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });

    if (!uploadRes.ok) {
        const error = await uploadRes.text();
        throw new Error(error);
    }

    return await uploadRes.json();
  } catch (error) {
    console.error("Backup to drive error:", error);
    throw error;
  }
}

/**
 * Phục hồi dữ liệu JSON từ Google Drive
 */
export async function restoreFromDrive(accessToken: string, fileName = 'dailymood_backup.json') {
  try {
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and spaces='drive'`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();

    if (!searchData.files || searchData.files.length === 0) {
      throw new Error("Không tìm thấy file backup nào trên Drive");
    }

    const fileId = searchData.files[0].id;

    // Lấy nội dung file (?alt=media)
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!fileRes.ok) throw new Error("Không tải được nội dung file backup");

    const data = await fileRes.json();
    return data;
  } catch (error) {
    console.error("Restore from drive error:", error);
    throw error;
  }
}
