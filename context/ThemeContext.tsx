import React, { createContext, useContext, useState, ReactNode } from "react";
import { COLORS } from "../constants/colors";
import { BACKGROUNDS } from "../constants/images";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchThemesFromSupabase, getCachedThemes, ParsedTheme } from "../lib/themeService";

const SELECTED_THEME_KEY = '@dailymood_selected_theme_id';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    main: string;
    tabBar: string ;
    overlay: string;
    soft: string;
    white: string;
    cream: string;
  };
  text: {
    dark: string;
    muted: string;
    white: string;
    slate: string;
    textOnDark: string;
  };
  moods: string[];
  border: string;
  divider: string;
  backgroundCard: string;
  error: string;
  success: string;
}

export interface ThemeBackgrounds {
  home: any;
  stats: any;
  add: any;
  journeys: any;
  auth: any;
  detail: any;
}

interface ThemeContextType {
  colors: ThemeColors;
  backgrounds: ThemeBackgrounds;
  availableThemes: ParsedTheme[];
  isLoadingThemes: boolean;
  selectedThemeId: string | null;
  changeTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [colors, setColors] = useState<ThemeColors>(COLORS as any);
  const [backgrounds, setBackgrounds] = useState<ThemeBackgrounds>(
    BACKGROUNDS as any,
  );
  const [availableThemes, setAvailableThemes] = useState<ParsedTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  React.useEffect(() => {
    // Initialization: load cache then fetch
    const initThemes = async () => {
      let themesToUse: ParsedTheme[] = [];
      try {
        const cachedThemes = await getCachedThemes();
        if (cachedThemes && cachedThemes.length > 0) {
          setAvailableThemes(cachedThemes);
          themesToUse = cachedThemes;
        }

        // Apply saved user theme preference immediately if possible
        const userSavedThemeId = await AsyncStorage.getItem(SELECTED_THEME_KEY);
        if (userSavedThemeId && themesToUse.length > 0) {
          const match = themesToUse.find(t => t.id === userSavedThemeId);
          if (match) {
            setSelectedThemeId(match.id);
            setColors(match.fullTheme.colors);
            setBackgrounds(match.fullTheme.backgrounds);
          }
        }

        // Fetch fresh from Supabase
        const remoteThemes = await fetchThemesFromSupabase();
        if (remoteThemes && remoteThemes.length > 0) {
          setAvailableThemes(remoteThemes);
          // Re-apply in case it was updated on the server
          const currentId = userSavedThemeId || remoteThemes[0].id;
          const match = remoteThemes.find(t => t.id === currentId) || remoteThemes[0];
          setSelectedThemeId(match.id);
          setColors(match.fullTheme.colors);
          setBackgrounds(match.fullTheme.backgrounds);
          if (!userSavedThemeId) {
             AsyncStorage.setItem(SELECTED_THEME_KEY, match.id);
          }
        }
      } catch (e) {
        console.error("Theme init error", e);
      } finally {
        setIsLoadingThemes(false);
      }
    };
    initThemes();
  }, []);

  const changeTheme = async (themeId: string) => {
    const match = availableThemes.find(t => t.id === themeId);
    if (match) {
      setSelectedThemeId(match.id);
      setColors(match.fullTheme.colors);
      setBackgrounds(match.fullTheme.backgrounds);
      await AsyncStorage.setItem(SELECTED_THEME_KEY, match.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, backgrounds, availableThemes, isLoadingThemes, selectedThemeId, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
