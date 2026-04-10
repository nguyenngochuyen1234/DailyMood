import AsyncStorage from '@react-native-async-storage/async-storage';
import { Journey, JournalEntry } from '../types/models';

const JOURNEYS_KEY = '@dailymood_journeys';
const JOURNALS_KEY = '@dailymood_journals';

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
    journeys = journeys.map(j => j.id === journey.id ? journey : j);
    await AsyncStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
  } catch (e) {
    console.error("Error updating journey", e);
    throw e;
  }
}

export const deleteJourney = async (id: string): Promise<void> => {
  try {
    let journeys = await getJourneys();
    journeys = journeys.filter(j => j.id !== id);
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

export const updateJournal = async (journal: JournalEntry): Promise<void> => {
    try {
      let journals = await getJournals();
      journals = journals.map(j => j.id === journal.id ? journal : j);
      await AsyncStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    } catch (e) {
      console.error("Error updating journal to storage", e);
      throw e;
    }
  };

export const deleteJournal = async (id: string): Promise<void> => {
  try {
    let journals = await getJournals();
    journals = journals.filter(j => j.id !== id);
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
  } catch(e) {
    console.error("Error deleting data", e);
  }
};
