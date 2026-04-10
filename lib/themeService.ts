import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeBackgrounds } from '../context/ThemeContext';
import { COLORS } from '../constants/colors';
import { BACKGROUNDS } from '../constants/images';

const THEMES_CACHE_KEY = '@dailymood_themes';

export interface SupabaseTheme {
  id: string;
  name: string;
  colors_json: any;
  created_at: string;
  theme_images: SupabaseBackground[];
}

export interface SupabaseBackground {
  id: string;
  theme_id: string;
  type: string; // 'home', 'stats', 'add', 'detail'
  image_url: string;
  created_at: string;
}

export interface ParsedTheme {
  id: string;
  name: string;
  fullTheme: {
    colors: ThemeColors;
    backgrounds: ThemeBackgrounds;
  };
}

export const fetchThemesFromSupabase = async (): Promise<ParsedTheme[]> => {
  try {
    // 1. Tải danh sách themes
    const { data: themesData, error: themesError } = await supabase
      .from('themes')
      .select('*');

    if (themesError) throw themesError;

    // 2. Tải danh sách backgrounds
    const { data: bgData, error: bgError } = await supabase
      .from('theme_images')
      .select('*');

    if (bgError) {
      console.warn("Could not fetch backgrounds, using default colors only:", bgError);
    }

    if (!themesData || themesData.length === 0) {
      return [];
    }

    const parsedThemes: ParsedTheme[] = themesData.map((theme: any) => {
      // Lọc các background thuộc về theme này
      const relatedBackgrounds = bgData ? bgData.filter((bg: any) => bg.theme_id === theme.id) : [];
      
      // Setup colors fallback
      const colorsJson = theme.colors_json || {};
      // Helper function to apply opacity to hex colors
      const applyOpacity = (color: string, opacity: number) => {
        if (!color || typeof color !== 'string') return color;
        if (color.startsWith('#')) {
          const hex = color.length === 4 ? 
            `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : 
            color;
          const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
          return `${hex.slice(0, 7)}${alpha}`;
        }
        return color;
      };

      const parsedColors: ThemeColors = {
        ...COLORS,
        ...colorsJson,
        background: {
          ...COLORS.background,
          tabBar:typeof colorsJson.tabBar === 'string' ? colorsJson.tabBar : COLORS.background.tabBar,
          main: typeof colorsJson.background === 'string' ? colorsJson.background : COLORS.background.main,
          ...(typeof colorsJson.background === 'object' ? colorsJson.background : {}),
        },
        text: {
          ...COLORS.text,
          ...(typeof colorsJson.text === 'object' ? colorsJson.text : {}),
          dark: (colorsJson.text && colorsJson.text.dark) ? colorsJson.text : (colorsJson.text || COLORS.text.dark),
          muted: (colorsJson.text && colorsJson.muted) ? colorsJson.muted : (colorsJson.muted || COLORS.text.muted),
          textOnDark: (colorsJson.text && colorsJson.textOnDark) ? colorsJson.textOnDark : (colorsJson.textOnDark || COLORS.text.textOnDark),
        },
        backgroundCard: applyOpacity(
          colorsJson.backgroundCard || colorsJson.background || COLORS.backgroundCard,
          0.75
        ),
      };
      // Set up backgrounds fallback and mapping
      let bgMap: any = { ...BACKGROUNDS };
      if (relatedBackgrounds.length > 0) {
        const getBgUrl = (typeStr: string) => {
           const match = relatedBackgrounds.find((b: any) => b.type === typeStr);
           return match && match.image_url ? { uri: match.image_url } : null;
        }

        const homeBg = getBgUrl('home') || BACKGROUNDS.home;
        const statsBg = getBgUrl('stats') || BACKGROUNDS.stats;
        const addBg = getBgUrl('add') || BACKGROUNDS.add;
        const detailBg = getBgUrl('detail') || BACKGROUNDS.detail;
        const journeyBg = getBgUrl('journeys') || homeBg;
        const authBg = getBgUrl('auth') || addBg;

        bgMap = {
          home: homeBg,
          stats: statsBg,
          add: addBg,
          detail: detailBg,
          journeys: journeyBg,
          auth: authBg, 
        };
      }

      return {
        id: String(theme.id), // UUID is string anyways
        name: theme.name || 'Unnamed Theme',
        fullTheme: {
          colors: parsedColors,
          backgrounds: bgMap,
        }
      };
    });

    // Save to cache
    await AsyncStorage.setItem(THEMES_CACHE_KEY, JSON.stringify(parsedThemes));
    return parsedThemes;
  } catch (e) {
    console.error("fetchThemesFromSupabase exception: ", e);
    return [];
  }
};

export const getCachedThemes = async (): Promise<ParsedTheme[] | null> => {
  try {
    const cached = await AsyncStorage.getItem(THEMES_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Could not read themes cache", e);
  }
  return null;
};
