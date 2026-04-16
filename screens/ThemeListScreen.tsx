import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import { ArrowLeft } from "lucide-react-native";

const { width } = Dimensions.get("window");
// Calculate card width for 3 items per row with gap
const CARD_WIDTH = (width - SIZES.spacing.xl * 2 - SIZES.spacing.m * 2) / 3 - 2;

export default function ThemeListScreen({ navigation }: any) {
  const { colors, backgrounds, availableThemes, changeTheme } = useTheme();

  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={backgrounds.home}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text.dark} size={24} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.secondary }]}>
            Tất cả giao diện
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {availableThemes.map((theme) => {
              const primaryColor = theme.fullTheme.colors.primary;
              const cardColor = "#fff";
              const textColor = theme.fullTheme.colors.text.dark;

              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard, 
                    { 
                      backgroundColor: cardColor, 
                      borderColor: colors.border,
                      shadowColor: colors.border
                    }
                  ]}
                  onPress={() => handleThemeChange(theme.id)}
                >
                  <View
                    style={[
                      styles.themeTopBar,
                      { backgroundColor: primaryColor },
                    ]}
                  />
                  <View style={styles.themeContent}>
                    <View
                      style={[
                        styles.themeLine,
                        { backgroundColor: primaryColor, width: "60%" },
                      ]}
                    />
                    <View
                      style={[
                        styles.themeLine,
                        {
                          backgroundColor: textColor,
                          width: "80%",
                          opacity: 0.3,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.themeLine,
                        {
                          backgroundColor: primaryColor,
                          width: "40%",
                          opacity: 0.4,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.themeName, { color: primaryColor }]}
                    numberOfLines={1}
                  >
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.m,
    marginBottom: SIZES.spacing.m,
  },
  screenTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.spacing.m,
  },
  themeCard: {
    width: CARD_WIDTH,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: SIZES.spacing.xs,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeTopBar: { height: 24 },
  themeContent: {
    flex: 1,
    padding: 8,
    gap: 6,
    justifyContent: "center",
  },
  themeLine: { height: 6, borderRadius: 3 },
  themeName: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    textAlign: "center",
    paddingBottom: 8,
  },
});
