import { JournalEntry, Journey } from "../types/models";
import {
  backupToDrive,
  deleteDriveFilesByName,
  deleteDriveFoldersByName,
  downloadImageFromDrive,
  findFileInFolder,
  getOrCreateDriveFolder,
  updateDriveFileContent,
  uploadFileToDrive,
} from "./googleDriveService";
import {
  ensureDirExists,
  getFileNameFromUri,
  getLocalImagePath,
} from "./fileHelper";

export interface BackupData {
  version: string;
  timestamp: number;
  data: {
    journals: JournalEntry[];
    journeys: Journey[];
  };
}

export const syncAllToDrive = async (
  accessToken: string | null,
  journals: JournalEntry[],
  journeys: Journey[],
): Promise<void> => {
  if (accessToken) {
    await deleteDriveFilesByName(accessToken, "dailymoodbackup.json");
    await deleteDriveFoldersByName(accessToken, "DailyMoodImages");
  }

  const prepareBackupJournals = async () => {
    if (!accessToken) {
      return journals;
    }

    const folderId = await getOrCreateDriveFolder(accessToken);

    return Promise.all(
      journals.map(async (journal) => {
        if (!journal.images || journal.images.length === 0) {
          return journal;
        }

        const backupImageNames: string[] = [];

        await Promise.all(
          journal.images.map(async (imageUri, index) => {
            const originalName = getFileNameFromUri(imageUri);
            const imageName = `${journal.id}_${index}_${Date.now()}_${originalName}`;

            const existingFile = await findFileInFolder(
              accessToken,
              imageName,
              folderId,
            );

            if (existingFile) {
              await updateDriveFileContent(
                accessToken,
                existingFile.id,
                imageUri,
              );
            } else {
              await uploadFileToDrive(
                accessToken,
                imageUri,
                imageName,
                "image/jpeg",
                [folderId],
              );
            }

            backupImageNames.push(imageName);
          }),
        );

        return {
          ...journal,
          images: backupImageNames,
        };
      }),
    );
  };

  const backupJournals = await prepareBackupJournals();

  const payload: BackupData = {
    version: "1.0",
    timestamp: Date.now(),
    data: {
      journals: backupJournals,
      journeys,
    },
  };

  if (accessToken) {
    try {
      await backupToDrive(accessToken, payload);
    } catch (error) {
      console.error("Drive sync failed", error);
      throw error;
    }
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};

export const downloadBackupImagesToLocal = async (
  accessToken: string | null,
  backup: BackupData,
) => {
  if (!accessToken) {
    throw new Error("Access token required to download backup images");
  }

  await ensureDirExists();

  const downloads: Array<{
    journalId: string;
    imageName: string;
    localUri: string;
  }> = [];

  for (const journal of backup.data.journals) {
    if (!journal.images || journal.images.length === 0) continue;

    for (const imageName of journal.images) {
      const localUri = getLocalImagePath(imageName);
      await downloadImageFromDrive(accessToken, imageName, localUri);
      downloads.push({ journalId: journal.id, imageName, localUri });
    }
  }

  return downloads;
};

export const restoreBackupWithLocalImages = async (
  accessToken: string | null,
  backup: BackupData,
): Promise<BackupData> => {
  if (!accessToken) {
    throw new Error("Access token required to restore backup images");
  }

  await ensureDirExists();

  const journals = await Promise.all(
    backup.data.journals.map(async (journal) => {
      if (!journal.images || journal.images.length === 0) {
        return journal;
      }

      const localImages = await Promise.all(
        journal.images.map(async (imageName) => {
          const localUri = getLocalImagePath(imageName);
          await downloadImageFromDrive(accessToken, imageName, localUri);
          return localUri;
        }),
      );

      return {
        ...journal,
        images: localImages,
      };
    }),
  );

  return {
    ...backup,
    data: {
      ...backup.data,
      journals,
    },
  };
};

export const syncJournalToDrive = async (
  accessToken: string | null,
  journal: JournalEntry,
  allJournals: JournalEntry[],
  allJourneys: Journey[],
): Promise<void> => {
  const journals = allJournals.find((j) => j.id === journal.id)
    ? allJournals
    : [...allJournals, journal];

  return syncAllToDrive(accessToken, journals, allJourneys);
};
