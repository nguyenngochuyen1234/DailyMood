import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, LayoutChangeEvent } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import MoodIcon from "./MoodIcon";
// import { MOOD_ICONS } from "../constants/moods"; // Không dùng nữa

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CalendarItem {
  day: number;
  moodIndex: number;
}

interface CalendarGridProps {
  calendarData: CalendarItem[];
  displayMode: "icon" | "image";
  onDayPress?: (day: number) => void;
  mockGallery?: { image: string }[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarData,
  displayMode,
  onDayPress,
  mockGallery,
}) => {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // 7 days in a row
  const gapSize = 7; // SIZES.spacing.s
  const paddingSize = 24; // padding: 8 on each side
  const itemWidth = containerWidth > 0 
    ? (containerWidth - paddingSize - (gapSize * 6)) / 7 
    : (SCREEN_WIDTH - 64) / 7;

  return (
    <View 
      style={[styles.calendarCard]}
      onLayout={onLayout}
    >
      {calendarData.map((item) => (
        <TouchableOpacity
          key={item.day}
          style={[
            styles.dayCell, 
            { 
              backgroundColor: colors.background.soft,
              width: itemWidth,
              padding: displayMode === "icon" ? 0 : 4,
            }
          ]}
          onPress={() => onDayPress && onDayPress(item.day)}
        >
          <Text style={[styles.dayNumber, { color: colors.text.dark }]}>{item.day}</Text>
          <View style={styles.iconContainer}>
            {displayMode === "icon" ? (
                <MoodIcon index={item.moodIndex} size={undefined} style={styles.moodIcon} />
            ) : (
              item.moodIndex >= 0 && mockGallery && mockGallery.length > 0 ? (
                <Image
                  source={{
                    uri: mockGallery[item.moodIndex % mockGallery.length]?.image,
                  }}
                  style={styles.image}
                />
              ) : null
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Using a fixed gap for precise calculation
    marginBottom: SIZES.spacing.xxl,
    padding: 8,
  },
  dayCell: {
    aspectRatio: 1,
    borderRadius: SIZES.radius.medium,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayNumber: {
    position: "absolute",
    top: -4,
    left: -4,
    fontSize: 10,
    fontFamily: FONTS.bold,
    zIndex: 1,
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    
  },
  moodIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  }
});

export default CalendarGrid;
