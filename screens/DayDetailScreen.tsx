import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Dimensions, ImageBackground 
} from 'react-native';
import { 
  ArrowLeft, ChevronLeft, ChevronRight 
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';

const { width } = Dimensions.get('window');

const MOOD_ICONS = [
  require('../assets/icon/icon1.png'),
  require('../assets/icon/icon2.png'),
  require('../assets/icon/icon3.png'),
  require('../assets/icon/icon4.png'),
  require('../assets/icon/icon5.png'),
];

const MOOD_LABELS = ['Rất vui', 'Hạnh phúc', 'Bình thường', 'Buồn', 'Tức giận'];

// Mock Timeline Data
const MOCK_TIMELINE = [
  {
    id: '1',
    time: '9:00 AM',
    moodIndex: 0,
    label: 'Happy - Morning jog & coffee',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    time: '2:00 PM',
    moodIndex: 4,
    label: 'Stressed - Work deadlines',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    time: '4:30 PM',
    moodIndex: 2,
    label: 'Neutral - Afternoon meeting',
    image: null,
  },
  {
    id: '4',
    time: '6:30 PM',
    moodIndex: 1,
    label: 'Calm - Evening walk',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '5',
    time: '10:00 PM',
    moodIndex: 0,
    label: 'Relaxed - Reading book',
    image: null,
  },
];

// Mock Pie Chart Data
const PIE_DATA = [
  { percentage: 40, color: COLORS.moods[0], label: 'Rất vui' },
  { percentage: 20, color: COLORS.moods[1], label: 'Hạnh phúc' },
  { percentage: 15, color: COLORS.moods[2], label: 'Bình thường' },
  { percentage: 15, color: COLORS.moods[3], label: 'Buồn' },
  { percentage: 10, color: COLORS.moods[4], label: 'Tức giận' },
];

export default function DayDetailScreen({ navigation, route }: { navigation: any, route: any }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const renderPieChart = () => {
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
            {PIE_DATA.map((item, index) => {
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
          {/* Legend percents labels directly on pie slices approximated by text */}
          <View style={styles.chartOverlay}>
             <Text style={styles.totalLabel}>Daily Mix</Text>
          </View>
        </Svg>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={BACKGROUNDS.detail} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {React.createElement(ArrowLeft as any, { size: 28, color: COLORS.text.dark })}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Mood Statistics</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Date Navigation */}
          <View style={styles.datePicker}>
            <TouchableOpacity onPress={() => changeDay(-1)}>
             {React.createElement(ChevronLeft as any, { size: 24, color: COLORS.text.dark })}
          </TouchableOpacity>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity onPress={() => changeDay(1)}>
             {React.createElement(ChevronRight as any, { size: 24, color: COLORS.text.dark })}
          </TouchableOpacity>
          </View>

          {/* Timeline Section */}
          <View style={styles.timelineSection}>
            <View style={styles.timelineLine} />
            {MOCK_TIMELINE.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                {/* Time Display */}
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>

                {/* Vertical Connector and Icon (Left Side) */}
                <View style={styles.connectorContainer}>
                   <Image source={MOOD_ICONS[item.moodIndex]} style={styles.timelineImage} />
                </View>

                {/* Label (Right Side) */}
                <View style={styles.labelContainer}>
                    <Text style={styles.moodLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Mood Mix Section */}
          <View style={styles.moodMixSection}>
             <Text style={styles.sectionTitle}>Mood Mix</Text>
             <View style={styles.chartWrapper}>
                {renderPieChart()}
                <View style={styles.legendContainer}>
                    {PIE_DATA.map((item, index) => (
                        <View key={index} style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>{item.label}</Text>
                            <Text style={styles.legendPercent}>{item.percentage}%</Text>
                        </View>
                    ))}
                </View>
             </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
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
    color: COLORS.text.dark,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.m,
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text.dark,
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
    backgroundColor: COLORS.secondary,
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
    color: COLORS.text.dark,
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
    backgroundColor: COLORS.background.soft,
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
    backgroundColor: COLORS.background.white,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
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
    color: COLORS.text.dark,
    lineHeight: 22,
  },
  moodMixSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.overlay,
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
    color: COLORS.text.dark,
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
    color: COLORS.text.dark,
  },
  legendPercent: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text.dark,
    marginLeft: 8,
  },
});
