import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';

interface MonthSelectorProps {
  currentDate: Date;
  activeTab: string;
  currentViewTime?: string | null;
  onChangeMonth: (offset: number) => void;
  onCalendarPress?: () => void;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentDate,
  activeTab,
  currentViewTime,
  onChangeMonth,
  onCalendarPress,
}) => {
  return (
    <View style={styles.monthSelector}>
      <View style={styles.dateInfo}>
        <Text style={styles.dateText}>
          {activeTab === 'Friends' ? `${currentViewTime ? currentViewTime + ' - ' : ''}${currentDate.getDate()} ` : ''}
          {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
        </Text>
      </View>
      <View style={styles.selectorActions}>
        <TouchableOpacity onPress={() => onChangeMonth(-1)} style={styles.arrowButton}>
          {React.createElement(ChevronLeft as any, { size: 24, color: COLORS.text.dark })}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onChangeMonth(1)} style={styles.arrowButton}>
          {React.createElement(ChevronRight as any, { size: 24, color: COLORS.text.dark })}
        </TouchableOpacity>
        <TouchableOpacity onPress={onCalendarPress} style={styles.calendarIcon}>
          {React.createElement(Calendar as any, { size: 20, color: COLORS.primary })}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MonthSelector;

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    marginHorizontal: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text.dark,
  },
  selectorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.m,
  },
  arrowButton: {
    padding: SIZES.spacing.xs,
  },
  calendarIcon: {
    padding: SIZES.spacing.xs,
  },
});
