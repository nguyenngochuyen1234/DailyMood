import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Dimensions, ImageBackground
} from 'react-native';
import {
  ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { FONTS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useMood } from '../context/MoodContext';
import MoodIcon from '../components/MoodIcon';
import EmptyState from '../components/EmptyState';
import { getJournals } from '../lib/storage';
import { JournalEntry } from '../types/models';
import MonthSelector from '../components/MonthSelector';
import RepresentativeMoodCard from '../components/RepresentativeMoodCard';

const { width } = Dimensions.get('window');

const MOOD_LABELS = ['Rất vui', 'Hạnh phúc', 'Bình thường', 'Buồn', 'Tức giận'];

export default function DayDetailScreen({ navigation, route }: { navigation: any, route: any }) {
  const insets = useSafeAreaInsets();
  const { colors, backgrounds } = useTheme();
  const { emojis, t } = useMood();
  const [selectedDate, setSelectedDate] = React.useState(
    route.params?.day && route.params?.month !== undefined && route.params?.year
      ? new Date(route.params.year, route.params.month, route.params.day)
      : new Date()
  );
  const [journals, setJournals] = React.useState<JournalEntry[]>([]);

  React.useEffect(() => {
    const fetchDayJournals = async () => {
      const all = await getJournals();
      const filtered = all.filter(j => {
        const d = new Date(j.time);
        return d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear();
      });
      setJournals(filtered.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
    };
    fetchDayJournals();
  }, [selectedDate]);

  // Use dynamic colors for PIE_DATA
  // Calculate pieData based on real logs
  const pieData = React.useMemo(() => {
    if (emojis.length === 0 || journals.length === 0) return [];

    const counts = new Array(emojis.length).fill(0);
    journals.forEach(j => {
      const idx = emojis.findIndex(e => e.emotion_id === Number(j.typeEmoji) || e.id === Number(j.typeEmoji));
      if (idx >= 0) counts[idx]++;
    });

    return emojis.map((e, index) => ({
      percentage: Math.round((counts[index] / journals.length) * 100),
      color: colors.moods[index] || colors.primary,
      label: e.emotion_name,
      count: counts[index]
    })).filter(item => item.count > 0);
  }, [journals, emojis, colors]);
  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };



  const renderPieChart = () => {
    if (pieData.length === 0) {
      return (
        <View style={[styles.pieContainer, { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.background.soft, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 10, color: colors.text.muted }}>No data</Text>
        </View>
      );
    }
    const size = 120;
    const center = size / 2;
    const radius = 30;
    const strokeWidth = 60;
    const circumference = 2 * Math.PI * radius;
    let startAngle = 0;

    return (
      <View style={styles.pieContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {pieData.map((item: any, index: number) => {
              const dasharray = (item.percentage / 100) * circumference;
              const dashoffset = circumference - dasharray;
              const rotation = (startAngle / 100) * 360;
              startAngle += item.percentage;

              return (
                <Circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dasharray} ${circumference}`}
                  transform={`rotate(${rotation}, ${center}, ${center})`}
                  fill="transparent"
                />
              );
            })}
          </G>
          <View style={styles.chartOverlay}>
            <Text style={[styles.totalLabel, { color: colors.text.dark }]}>Daily Mix</Text>
          </View>
        </Svg>
      </View>
    );
  };

  return (
    <ImageBackground
      source={backgrounds.detail}
      style={styles.container}
    >
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {React.createElement(ArrowLeft as any, { size: 28, color: colors.text.dark })}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.dark }]}>{t('daily_stats')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {/* Selector cho Ngày */}
            <MonthSelector
              currentDate={selectedDate}
              showDay={true}
              onChangeMonth={changeDay}
              onCalendarPress={() => { }} // Could open a full calendar modal
            />
          </View>

          <RepresentativeMoodCard
            journals={journals}
            emojis={emojis}
            date={selectedDate}
          />

          <View style={styles.timelineSection}>
            {journals.length === 0 ? (
              <EmptyState
                onPress={() => {
                  navigation.goBack();
                  navigation.navigate("AddJournal");
                }}
              />
            ) : (
              journals.map((item, index) => {
                const d = new Date(item.time);
                const tStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                const moodIdx = emojis.findIndex(e => e.emotion_id === Number(item.typeEmoji) || e.id === Number(item.typeEmoji));

                return (
                  <View key={item.id} style={styles.timelineItem}>
                    {/* Time Display */}
                    <View style={styles.timeContainer}>
                      <Text style={[styles.timeText, { color: colors.text.dark }]}>{tStr}</Text>
                    </View>

                    {/* Vertical Connector and Icon (Left Side) */}
                    <View style={styles.connectorContainer}>
                      <MoodIcon index={moodIdx} size={60} style={styles.timelineImage} />
                    </View>

                    {/* Label (Right Side) */}
                    <View style={styles.labelContainer}>
                      <Text style={[styles.moodLabel, { color: colors.text.dark }]}>{item.description || "No description"}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Mood Mix Section */}
          {journals.length > 0 && <View style={styles.moodMixSection}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>{t('daily_stats')}</Text>
            <View style={[styles.chartWrapper, { backgroundColor: colors.backgroundCard }]}>
              {renderPieChart()}
              <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                  <View key={index} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: colors.text.dark }]}>{item.label}</Text>
                    <Text style={[styles.legendPercent, { color: colors.text.dark }]}>{item.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.s,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.m,
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    marginBottom: 30,
    borderWidth: 1,
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  timelineSection: {
    marginBottom: 40,
    position: 'relative',
    paddingLeft: 10,
  },
  timelineLine: {
    position: 'absolute',
    left: 110, // Adjusted to align with connectorContainer
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 80,
  },
  timeContainer: {
    width: 70,
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  connectorContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timelineImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
  },
  noImageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
  },
  moodIconOnLine: {
    position: 'absolute',
    right: -10, // Position on the vertical line
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  timelineMoodIcon: {
    width: 24,
    height: 24,
  },
  labelContainer: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  moodLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  moodMixSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.xxl,
    padding: 20,
  },
  pieContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  legendPercent: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginLeft: 8,
  },
});
