import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, TranslationKey, LanguageCode } from '../constants/translations';

// Định nghĩa các Interface dựa trên database của bạn
export interface Emotion {
  id: number;
  name: { [key: string]: string }; // JSONB { "en": "Happy", "vi": "Vui" }
}

export interface TypeEmoji {
  id: number;
  name: { [key: string]: string }; // JSONB { "en": "Watercolor", "vi": "Màu nước" }
  description: { [key: string]: string };
}

export interface Emoji {
  id: number;
  image: string; // URL từ Supabase Storage
  type_id: number;
  emotion_id: number;
  // Metadata join từ bảng emotions
  emotion_name?: string; 
}

interface MoodContextType {
  types: TypeEmoji[];
  emojis: Emoji[];
  selectedTypeId: number | null;
  language: LanguageCode;
  loading: boolean;
  setLanguage: (lang: LanguageCode) => void;
  setSelectedTypeId: (id: number) => void;
  refreshEmojis: () => Promise<void>;
  getEmojiByEmotionId: (id: number) => Emoji | undefined;
  getEmojiByIndex: (index: number) => Emoji | undefined;
  t: (key: TranslationKey) => string;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@dailymood_language';

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [types, setTypes] = useState<TypeEmoji[]>([]);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>('vi');
  const [loading, setLoading] = useState(true);

  // Initialize language from storage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang === 'vi' || savedLang === 'en') {
          setLanguageState(savedLang);
        }
      } catch (e) {
        console.warn("Could not load language", e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not save language", e);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  // 1. Lấy danh sách các bộ Emoji (typeEmoji)
  const fetchTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('typeEmoji')
        .select('*');
      
      if (error) throw error;
      if (data) {
        if (data.length > 0) {
          setTypes(data);
          // Mặc định chọn bộ đầu tiên nếu chưa chọn
          if (!selectedTypeId) setSelectedTypeId(data[0].id);
        }
      }
    } catch (error: any) {
      console.error('❌ [MoodProvider] Lỗi lấy danh mục typeEmoji:', error.message);
    }
  };

  // 2. Lấy danh sách Emoji thuộc bộ đang chọn và join với tên cảm xúc
  const fetchEmojis = async () => {
    if (!selectedTypeId) return;
    
    setLoading(true);
    try {
      // Thực hiện join bảng emojis với bảng emotions để lấy tên cảm xúc
      const { data, error } = await supabase
        .from('emojis')
        .select(`
          id,
          image,
          type_id,
          emotion_id,
          emotions (
            name
          )
        `)
        .eq('type_id', selectedTypeId);

      if (error) throw error;

      if (data) {
        // Ánh xạ dữ liệu để lấy tên theo ngôn ngữ đang chọn
        const formattedEmojis: Emoji[] = data.map((item: any) => ({
          id: item.id,
          image: item.image,
          type_id: item.type_id,
          emotion_id: item.emotion_id,
          emotion_name: item.emotions?.name?.[language] || 'Unknown'
        }));
        setEmojis(formattedEmojis);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Lấy emoji theo emotion_id trong bộ hiện tại
  const getEmojiByEmotionId = (id: number) => {
    return emojis.find(e => e.emotion_id === id);
  };

  // Helper: Lấy emoji theo vị trí trong mảng (dùng cho dữ liệu mẫu cũ)
  const getEmojiByIndex = (index: number) => {
    if (emojis.length === 0) return undefined;
    return emojis[index % emojis.length];
  };

  // Khởi động lấy danh sách bộ khi mount
  useEffect(() => {
    fetchTypes();
  }, []);

  // Lấy lại danh sách emoji khi thay đổi bộ hoặc ngôn ngữ
  useEffect(() => {
    fetchEmojis();
  }, [selectedTypeId, language]);

  return (
    <MoodContext.Provider 
      value={{ 
        types, 
        emojis, 
        selectedTypeId, 
        language, 
        loading, 
        setLanguage, 
        setSelectedTypeId,
        refreshEmojis: fetchEmojis,
        getEmojiByEmotionId,
        getEmojiByIndex,
        t
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

