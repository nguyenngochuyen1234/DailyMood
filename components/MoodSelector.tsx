import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import { FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface Emoji {
  id: number;
  image: string;
  emotion_id: number;
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

const ITEM_WIDTH = 100;
const GAP = SIZES.spacing.m;

export default function MoodSelector({
  emojis,
  loading,
  selectedMoodId,
  onMoodChange,
  containerStyle,
  horizontal = true,
}: MoodSelectorProps) {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (horizontal && selectedMoodId !== null && emojis.length > 0 && containerWidth > 0) {
      const index = emojis.findIndex((e) => e.emotion_id === selectedMoodId);
      if (index !== -1) {
        const offset = (index * (ITEM_WIDTH + GAP)) - (containerWidth / 2) + (ITEM_WIDTH / 2);
        scrollViewRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
      }
    }
  }, [selectedMoodId, emojis, containerWidth, horizontal]);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const renderMoodItems = () => {
    if (loading) {
      return <ActivityIndicator color="#506F3F" style={{ padding: 20 }} />;
    }

    return emojis.map((emoji) => (
      <TouchableOpacity
        key={emoji.emotion_id}
        onPress={() => onMoodChange(emoji.emotion_id)}
        style={[
          styles.moodItem,
          selectedMoodId === emoji.emotion_id && [
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
            selectedMoodId === emoji.emotion_id && { color: colors.primary },
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
        ref={scrollViewRef}
        onLayout={onLayout}
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
    width: ITEM_WIDTH,
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
