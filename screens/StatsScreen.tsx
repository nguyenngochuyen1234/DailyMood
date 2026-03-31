import React, { useState, useMemo, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Dimensions, ImageBackground, SectionList
} from 'react-native';
import { 
  ChevronLeft, ChevronRight, Calendar, ArrowLeft 
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';
import DayDetailScreen from './DayDetailScreen';
import { Modal } from 'react-native';
import PostCard from '../components/PostCard';
import MonthSelector from '../components/MonthSelector';

const { width } = Dimensions.get('window');

const MOOD_ICONS = [
  require('../assets/icon/icon1.png'),
  require('../assets/icon/icon2.png'),
  require('../assets/icon/icon3.png'),
  require('../assets/icon/icon4.png'),
  require('../assets/icon/icon5.png'),
];

const MOOD_LABELS = ['Rất vui', 'Hạnh phúc', 'Bình thường', 'Buồn', 'Tức giận'];

export default function StatsScreen({ navigation }: { navigation: any }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [currentViewTime, setCurrentViewTime] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<'Mine' | 'Friends'>('Mine');


  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  // Generate fake data for the current month
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      moodIndex: Math.floor(Math.random() * 5)
    }));
  }, [currentDate]);

  const stats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    calendarData.forEach(item => counts[item.moodIndex]++);
    return counts;
  }, [calendarData]);

  const mockGallery = [
    { id: '1', date: 'Jun 2', moodIcon: MOOD_ICONS[0], image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60' },
    { id: '2', date: 'Jun 7', moodIcon: MOOD_ICONS[1], image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60' },
    { id: '3', date: 'Jun 14', moodIcon: MOOD_ICONS[4], image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&auto=format&fit=crop&q=60' },
    { id: '4', date: 'Jun 15', moodIcon: MOOD_ICONS[3], image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60' },
  ];



  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;



  return (
    <ImageBackground 
      source={BACKGROUNDS.stats} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>

          <Text style={styles.headerTitle}>Monthly Mood Insights</Text>

        </View>
        

        <MonthSelector
          currentDate={currentDate}
          activeTab={activeTab}
          currentViewTime={currentViewTime}
          onChangeMonth={changeMonth}
        />
        
 
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Weekday Labels */}
            <View style={styles.weekdayRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarData.map((item) => (
                <TouchableOpacity 
                  key={item.day} 
                  style={styles.dayCell}
                  onPress={() => {
                    setSelectedDay(item.day);
                    setIsDetailVisible(true);
                  }}
                >
                  <Text style={styles.dayNumber}>{item.day}</Text>
                  <View style={styles.iconContainer}>
                    <Image 
                      source={MOOD_ICONS[item.moodIndex]} 
                      style={styles.moodIcon}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Monthly Insights */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Monthly Insights</Text>
              {stats.map((count, index) => (
                <View key={index} style={styles.insightRow}>
                  <Text style={styles.insightLabel}>{MOOD_LABELS[index]}</Text>
                  <View style={styles.progressTrack}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${(count / calendarData.length) * 100}%`,
                          backgroundColor: COLORS.moods[index]
                        }
                      ]} 
                    />
                    <Image source={MOOD_ICONS[index]} style={styles.smallMoodIcon} />
                  </View>
                  <Text style={styles.insightCount}>{count} days</Text>
                </View>
              ))}
            </View>

            {/* Photo Gallery */}
            <View style={styles.gallerySection}>
              <Text style={styles.sectionTitle}>Photo Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                {mockGallery.map((item) => (
                  <View key={item.id} style={styles.galleryItem}>
                    <Image source={{ uri: item.image }} style={styles.galleryImage} />
                    <View style={styles.galleryInfo}>
                      <Text style={styles.galleryDate}>{item.date}</Text>
                      <Image source={item.moodIcon} style={styles.galleryIcon} />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>



        <Modal
          visible={isDetailVisible}
          animationType="slide"
          onRequestClose={() => setIsDetailVisible(false)}
        >
          <DayDetailScreen 
            navigation={{ goBack: () => setIsDetailVisible(false) }} 
            route={{ params: { day: selectedDay, month: currentDate.getMonth(), year: currentDate.getFullYear() } }} 
          />
        </Modal>
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
  },tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xxl,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radius.xl,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.primary,
  },
  activeTabText: {
    color: COLORS.text.white,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text.dark,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.s,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: SIZES.spacing.s,
    gap: SIZES.spacing.s,
  },
  weekdayText: {
    width: (width - 40 - 48) / 7 - 0.2,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  dateInfo: {
    flex: 1,
  },
  selectorActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SIZES.spacing.m,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.s,
    justifyContent: 'flex-start',
    marginBottom: SIZES.spacing.xxl,
  },
  dayCell: {
    width: (width - 40 - 48) / 7 - 0.2,
    aspectRatio: 1,
    borderRadius: SIZES.radius.medium,
    backgroundColor: COLORS.background.soft,
    padding: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    position: 'absolute',
    top: SIZES.spacing.xs,
    left: SIZES.spacing.xs,
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.text.dark,
    zIndex: 1,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    padding: SIZES.spacing.xs,
  },
  moodIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  insightsSection: {
    marginBottom: SIZES.spacing.xxl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.secondary,
    marginBottom: SIZES.spacing.l,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.l,
    gap: SIZES.spacing.m,
  },
  insightLabel: {
    width: 80,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.dark,
  },
  progressTrack: {
    flex: 1,
    height: 14,
    backgroundColor: COLORS.background.overlay,
    borderRadius: 7,
    justifyContent: 'center',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 7,
  },
  smallMoodIcon: {
    position: 'absolute',
    right: -4,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  insightCount: {
    width: 60,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.dark,
    textAlign: 'right',
  },
  gallerySection: {
    marginBottom: SIZES.spacing.xl,
  },
  galleryScroll: {
    marginTop: SIZES.spacing.s,
  },
  galleryItem: {
    marginRight: SIZES.spacing.l,
    width: 140,
  },
  galleryImage: {
    width: 140,
    height: 140,
    borderRadius: SIZES.radius.xl,
    marginBottom: SIZES.spacing.s,
  },
  galleryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xs,
  },
  galleryDate: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text.dark,
  },
  galleryIcon: {
    width: 24,
    height: 24,
  },

  stickyHeader: {
    backgroundColor: COLORS.background.white,
    paddingVertical: SIZES.spacing.s,
    paddingHorizontal: SIZES.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.s,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.m,
  },
  stickyHeaderText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  stickyHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
