import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";

interface MonthSelectorProps {
  currentDate: Date;
  activeTab?: string;
  currentViewTime?: string | null;
  onChangeMonth: (offset: number) => void;
  onCalendarPress?: () => void;
  showDay?: boolean;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentDate,
  activeTab,
  currentViewTime,
  onChangeMonth,
  onCalendarPress,
  showDay = false,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.monthSelector, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
  
      <View style={styles.selectorActions}>
        <TouchableOpacity onPress={() => onChangeMonth(-1)} style={styles.arrowButton}>
          {React.createElement(ChevronLeft as any, { size: 24, color: colors.text.dark })}
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.dateText, { color: colors.text.dark }]}>
            {(showDay || activeTab === "Friends")
              ? `${currentDate.getDate()} `
              : ""}
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </Text>
          {currentViewTime && activeTab === "Friends" && (
            <Text style={{ fontSize: 12, color: colors.text.muted, marginTop: -2 }}>{currentViewTime}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => onChangeMonth(1)} style={styles.arrowButton}>
          {React.createElement(ChevronRight as any, { size: 24, color: colors.text.dark })}
        </TouchableOpacity>
      </View>
      {onCalendarPress && (
        <TouchableOpacity onPress={onCalendarPress} style={styles.calendarIcon}>
          {React.createElement(Calendar as any, { size: 20, color: colors.primary })}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MonthSelector;

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    borderWidth: 1,
  },
  dateText: { fontFamily: FONTS.bold, fontSize: 18 },
  selectorActions: {
    flexDirection: "row",
    alignItems: "center",
    // gap: SIZES.spacing.m,
    justifyContent: "space-between",
    flex: 1,
  },
  arrowButton: { padding: SIZES.spacing.xs },
  calendarIcon: { padding: SIZES.spacing.xs },
});
