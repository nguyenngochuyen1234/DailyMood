import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface Emoji {
  id: number;
  image: string;
  emotion_name: string;
}

interface MoodSelectorProps {
  emojis: Emoji[];
  loading: boolean;
  selectedMoodId: number | null;
  onMoodChange: (moodId: number) => void;
  containerStyle?: ViewStyle;
  horizontal?: boolean;
}

export default function MoodSelector({
  emojis,
  loading,
  selectedMoodId,
  onMoodChange,
  containerStyle,
  horizontal = true,
}: MoodSelectorProps) {
  const { colors, backgrounds } = useTheme();
  const renderMoodItems = () => {
    if (loading) {
      return <ActivityIndicator color="#506F3F" style={{ padding: 20 }} />;
    }

    return emojis.map((emoji) => (
      <TouchableOpacity
        key={emoji.id}
        onPress={() => onMoodChange(emoji.id)}
        style={[
          styles.moodItem,
          selectedMoodId === emoji.id && [
            styles.moodItemSelected,
            { borderColor: colors.primary },
          ],
        ]}
      >
        <Image source={{ uri: emoji.image }} style={styles.moodIcon} />
        <Text
          style={[
            styles.moodLabel,
            { color: colors.primary },
            selectedMoodId === emoji.id && { color: colors.primary },
          ]}
        >
          {emoji.emotion_name || "Đang tải..."}
        </Text>
      </TouchableOpacity>
    ));
  };

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.moodContainer, containerStyle]}
      >
        {renderMoodItems()}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.moodGridContainer, containerStyle]}>
      {renderMoodItems()}
    </View>
  );
}

const styles = StyleSheet.create({
  moodContainer: {
    paddingVertical: SIZES.spacing.s,
    gap: SIZES.spacing.m,
    paddingHorizontal: SIZES.spacing.s,
  },
  moodGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.spacing.m,
    padding: SIZES.spacing.m,
  },
  moodItem: {
    paddingHorizontal: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: SIZES.spacing.s,
    minWidth: 100,
  },
  moodItemSelected: {
    backgroundColor: "#ffffff",
  },
  moodIcon: {
    width: 48,
    height: 48,
    marginBottom: SIZES.spacing.xs,
  },
  moodLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    textAlign: "center",
  },
});
