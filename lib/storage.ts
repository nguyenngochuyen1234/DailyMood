import AsyncStorage from "@react-native-async-storage/async-storage";
import { Journey, JournalEntry } from "../types/models";
import { BackupData } from "./driveService";
import { syncAllToDrive } from "./driveService";

const JOURNEYS_KEY = "@dailymood_journeys";
const JOURNALS_KEY = "@dailymood_journals";
const DAILY_MOODS_KEY = "@dailymood_daily_moods";

export const getJourneys = async (): Promise<Journey[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(JOURNEYS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading journeys from storage", e);
    return [];
  }
};

export const saveJourney = async (journey: Journey): Promise<void> => {
  try {
    const journeys = await getJourneys();
    journeys.push(journey);
    await AsyncStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
  } catch (e) {
    console.error("Error saving journey to storage", e);
    throw e;
  }
};

export const updateJourney = async (journey: Journey): Promise<void> => {
  try {
    let journeys = await getJourneys();
    journeys = journeys.map((j) => (j.id === journey.id ? journey : j));
    await AsyncStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
  } catch (e) {
    console.error("Error updating journey", e);
    throw e;
  }
};

export const deleteJourney = async (id: string): Promise<void> => {
  try {
    let journeys = await getJourneys();
    journeys = journeys.filter((j) => j.id !== id);
    await AsyncStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
  } catch (e) {
    console.error("Error deleting journey", e);
    throw e;
  }
};

export const getJournals = async (): Promise<JournalEntry[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(JOURNALS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading journals from storage", e);
    return [];
  }
};

export const saveJournal = async (journal: JournalEntry): Promise<void> => {
  try {
    const journals = await getJournals();
    journals.push(journal);
    await AsyncStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  } catch (e) {
    console.error("Error saving journal to storage", e);
    throw e;
  }
};

/**
 * HÀM 1: Lưu trữ cho người dùng bình thường (Normal)
 * Chỉ lưu vào bộ nhớ cục bộ, việc đồng bộ sẽ thực hiện thủ công sau.
 */
export const saveWithManualSync = async (
  type: "journal" | "journey",
  data: JournalEntry | Journey,
): Promise<void> => {
  try {
    if (type === "journal") {
      await saveJournal(data as JournalEntry);
    } else {
      await saveJourney(data as Journey);
    }
    console.log(`[Normal] Đã lưu ${type} vào local.`);
  } catch (e) {
    console.error("Lỗi trong saveWithManualSync", e);
    throw e;
  }
};

/**
 * HÀM 2: Lưu trữ cho người dùng Pro (Auto Sync)
 * Lưu vào bộ nhớ cục bộ và tự động đẩy lên Drive ngay lập tức.
 */
export const saveWithAutoSync = async (
  type: "journal" | "journey",
  data: JournalEntry | Journey,
  accessToken: string | null,
): Promise<void> => {
  try {
    // 1. Luôn lưu vào local trước
    if (type === "journal") {
      await saveJournal(data as JournalEntry);
    } else {
      await saveJourney(data as Journey);
    }

    // 2. Tự động đồng bộ toàn bộ dữ liệu lên Drive
    const journeys = await getJourneys();
    const journals = await getJournals();

    // Không await để không chặn UI, nhưng vẫn log lỗi nếu fail
    syncAllToDrive(accessToken, journals, journeys).catch((err) => {
      console.error("Auto-sync failed for Pro user", err);
    });
  } catch (e) {
    console.error("Lỗi trong saveWithAutoSync", e);
    throw e;
  }
};

/**
 * Hàm thực hiện đồng bộ thủ công toàn bộ dữ liệu
 */
export const manualSyncAll = async (
  accessToken: string | null,
): Promise<void> => {
  try {
    const journeys = await getJourneys();
    const journals = await getJournals();
    await syncAllToDrive(accessToken, journals, journeys);
  } catch (e) {
    console.error("Lỗi khi đồng bộ thủ công", e);
    throw e;
  }
};

export const saveJournalWithSync = async (
  journal: JournalEntry,
  isPro: boolean = false,
  accessToken: string | null = null,
): Promise<void> => {
  try {
    if (isPro) {
      await saveWithAutoSync("journal", journal, accessToken);
    } else {
      await saveWithManualSync("journal", journal);
    }
  } catch (e) {
    console.error("Error in saveJournalWithSync", e);
    throw e;
  }
};

export const updateJournal = async (journal: JournalEntry): Promise<void> => {
  try {
    let journals = await getJournals();
    journals = journals.map((j) => (j.id === journal.id ? journal : j));
    await AsyncStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  } catch (e) {
    console.error("Error updating journal to storage", e);
    throw e;
  }
};

export const deleteJournal = async (id: string): Promise<void> => {
  try {
    let journals = await getJournals();
    journals = journals.filter((j) => j.id !== id);
    await AsyncStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  } catch (e) {
    console.error("Error deleting journal", e);
    throw e;
  }
};

export const deleteAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(JOURNEYS_KEY);
    await AsyncStorage.removeItem(JOURNALS_KEY);
  } catch (e) {
    console.error("Error deleting data", e);
  }
};

export const restoreBackupData = async (backup: BackupData): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      JOURNEYS_KEY,
      JSON.stringify(backup.data.journeys),
    );
    await AsyncStorage.setItem(
      JOURNALS_KEY,
      JSON.stringify(backup.data.journals),
    );
  } catch (e) {
    console.error("Error restoring backup data", e);
    throw e;
  }
};

export const getDailyMoods = async (): Promise<Record<string, number>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(DAILY_MOODS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    return {};
  }
};

export const saveDailyMood = async (
  dateStr: string,
  emotionId: number,
): Promise<void> => {
  try {
    const moods = await getDailyMoods();
    moods[dateStr] = emotionId;
    await AsyncStorage.setItem(DAILY_MOODS_KEY, JSON.stringify(moods));
  } catch (e) {
    console.error("Error saving daily mood", e);
  }
};
