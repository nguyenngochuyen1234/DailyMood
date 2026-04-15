import * as FileSystem from "expo-file-system/legacy";

const DRIVE_IMAGE_FOLDER_NAME = "DailyMoodImages";

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

const listDriveFiles = async (
  accessToken: string,
  query: string,
  fields = "files(id,name)",
) => {
  const encodedQuery = encodeURIComponent(query);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&spaces=drive&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  return checkResponse(res);
};

export async function deleteDriveFile(accessToken: string, fileId: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 204) {
    return;
  }

  throw await parseDriveError(res);
}

export async function deleteDriveFilesByName(
  accessToken: string,
  fileName: string,
  parent = "root",
) {
  const query = `name='${fileName}' and '${parent}' in parents and trashed=false`;
  const searchData = await listDriveFiles(accessToken, query);
  const files = searchData.files || [];

  await Promise.all(
    files.map((file: { id: string }) => deleteDriveFile(accessToken, file.id)),
  );
}

export async function deleteDriveFoldersByName(
  accessToken: string,
  folderName: string,
  parent = "root",
) {
  const query =
    `name='${folderName}' and mimeType='application/vnd.google-apps.folder' ` +
    `and '${parent}' in parents and trashed=false`;
  const searchData = await listDriveFiles(accessToken, query);
  const folders = searchData.files || [];

  await Promise.all(
    folders.map((folder: { id: string }) =>
      deleteDriveFile(accessToken, folder.id),
    ),
  );
}

export async function backupToDrive(
  accessToken: string,
  data: object,
  fileName = "dailymoodbackup.json",
) {
  try {
    const searchData = await listDriveFiles(
      accessToken,
      `name='${fileName}' and 'root' in parents and trashed=false`,
    );
    const existingFile =
      searchData.files && searchData.files.length > 0
        ? searchData.files[0]
        : null;

    let fileId = existingFile?.id;

    if (!existingFile) {
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
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
      });
      const createdFile = await checkResponse(createRes);
      fileId = createdFile.id;
    }

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

    return await checkResponse(uploadRes);
  } catch (error) {
    console.error("Backup to drive error:", error);
    throw error;
  }
}

export async function getOrCreateDriveFolder(
  accessToken: string,
  folderName = DRIVE_IMAGE_FOLDER_NAME,
  parent = "root",
) {
  try {
    const searchData = await listDriveFiles(
      accessToken,
      `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parent}' in parents and trashed=false`,
    );
    const existingFolder =
      searchData.files && searchData.files.length > 0
        ? searchData.files[0]
        : null;

    if (existingFolder) {
      return existingFolder.id;
    }

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parent],
      }),
    });

    const createdFolder = await checkResponse(createRes);
    return createdFolder.id;
  } catch (error) {
    console.error("Error creating Drive folder:", error);
    throw error;
  }
}

export async function findFileInFolder(
  accessToken: string,
  fileName: string,
  folderId: string,
) {
  try {
    const searchData = await listDriveFiles(
      accessToken,
      `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    );
    return searchData.files && searchData.files.length > 0
      ? searchData.files[0]
      : null;
  } catch (error) {
    console.error("Error searching file in Drive folder:", error);
    throw error;
  }
}

export async function uploadFileToDrive(
  accessToken: string,
  fileUri: string,
  fileName: string,
  mimeType = "application/octet-stream",
  parents: string[] = ["root"],
) {
  try {
    const metadata = {
      name: fileName,
      mimeType,
      parents,
    };

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    const createdFile = await checkResponse(createRes);
    return await updateDriveFileContent(
      accessToken,
      createdFile.id,
      fileUri,
      mimeType,
    );
  } catch (error) {
    console.error("Upload file to drive error:", error);
    throw error;
  }
}

export async function updateDriveFileContent(
  accessToken: string,
  fileId: string,
  fileUri: string,
  mimeType = "application/octet-stream",
) {
  try {
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: "PATCH",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      mimeType,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (uploadResult.status >= 200 && uploadResult.status < 300) {
      return JSON.parse(uploadResult.body);
    }

    throw new Error(
      `Drive file update failed: ${uploadResult.status} ${uploadResult.body}`,
    );
  } catch (error) {
    console.error("Update Drive file content error:", error);
    throw error;
  }
}

export async function downloadDriveFileToLocal(
  accessToken: string,
  fileId: string,
  localUri: string,
) {
  try {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    return await FileSystem.downloadAsync(downloadUrl, localUri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error("Download Drive file error:", error);
    throw error;
  }
}

export async function getDriveFileDownloadUrl(
  accessToken: string,
  fileId: string,
) {
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
}

export async function getDriveImageLink(
  accessToken: string,
  fileName: string,
  folderName = DRIVE_IMAGE_FOLDER_NAME,
) {
  const folderId = await getOrCreateDriveFolder(accessToken, folderName);
  const fileInfo = await findFileInFolder(accessToken, fileName, folderId);

  if (!fileInfo) {
    throw new Error(`Khong tim thay anh tren Drive: ${fileName}`);
  }

  return getDriveFileDownloadUrl(accessToken, fileInfo.id);
}

export async function downloadImageFromDrive(
  accessToken: string,
  fileName: string,
  localUri: string,
  folderName = DRIVE_IMAGE_FOLDER_NAME,
) {
  try {
    const folderId = await getOrCreateDriveFolder(accessToken, folderName);
    const fileInfo = await findFileInFolder(accessToken, fileName, folderId);

    if (!fileInfo) {
      throw new Error(`Khong tim thay anh tren Drive: ${fileName}`);
    }

    return await downloadDriveFileToLocal(accessToken, fileInfo.id, localUri);
  } catch (error) {
    console.error("Download image from drive error:", error);
    throw error;
  }
}

export async function restoreFromDrive(
  accessToken: string,
  fileName = "dailymoodbackup.json",
) {
  try {
    const searchData = await listDriveFiles(
      accessToken,
      `name='${fileName}' and 'root' in parents and trashed=false`,
    );

    if (!searchData.files || searchData.files.length === 0) {
      throw new Error("Khong tim thay file backup nao tren Drive");
    }

    const fileId = searchData.files[0].id;
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
