/**
 * Tải JSON lên Google Drive (App Data).
 * Dùng phương pháp 2 bước (Metadata -> Content) để tương thích tốt nhất với React Native.
 */
const parseDriveError = async (res: Response) => {
  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  const message =
    data?.error?.message || data?.message || text || res.statusText;
  const error = new Error(message);
  (error as any).status = res.status;
  (error as any).driveError = data?.error || null;
  return error;
};

const checkResponse = async (res: Response) => {
  if (res.ok) {
    return res.json();
  }
  throw await parseDriveError(res);
};

export async function backupToDrive(
  accessToken: string,
  data: object,
  fileName = "dailymoodbackup.json",
) {
  try {
    // 1. Tìm nếu file đã tồn tại
    const query = encodeURIComponent(`name='${fileName}'`);
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const searchData = await checkResponse(searchRes);
    const existingFile =
      searchData.files && searchData.files.length > 0
        ? searchData.files[0]
        : null;

    let fileId = existingFile?.id;
    console.log("Drive backup - existing file:", existingFile);
    // 2. Nếu file chưa có, tạo metadata rỗng trước để lấy File ID
    if (!existingFile) {
      const createRes = await fetch(
        "https://www.googleapis.com/drive/v3/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileName,
            mimeType: "application/json",
            parents: ["root"],
          }),
        },
      );
      const createdFile = await checkResponse(createRes);
      fileId = createdFile.id;
    }

    // 3. Cập nhật dữ liệu vào file
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const uploadResult = await checkResponse(uploadRes);
    console.log("Drive backup saved to fileId", fileId, uploadResult);
    return uploadResult;
  } catch (error) {
    console.error("Backup to drive error:", error);
    throw error;
  }
}

/**
 * Phục hồi dữ liệu JSON từ Google Drive
 */
export async function restoreFromDrive(
  accessToken: string,
  fileName = "dailymoodbackup.json",
) {
  try {
    const query = encodeURIComponent(`name='${fileName}'`);
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const searchData = await checkResponse(searchRes);

    if (!searchData.files || searchData.files.length === 0) {
      throw new Error("Không tìm thấy file backup nào trên Drive");
    }

    const fileId = searchData.files[0].id;

    // Lấy nội dung file (?alt=media)
    const fileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return await checkResponse(fileRes);
  } catch (error) {
    console.error("Restore from drive error:", error);
    throw error;
  }
}
