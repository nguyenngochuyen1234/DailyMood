import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  Alert,
} from "react-native";
import {
  Calendar,
  ArrowLeft,
  LayoutGrid,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { FONTS, SIZES } from "../constants/theme";
// import { MOOD_ICONS } from "../constants/moods"; // Không dùng nữa
import PostCard from "../components/PostCard";
import MonthSelector from "../components/MonthSelector";
import MonthlyInsights from "../components/MonthlyInsights";
import CalendarGrid from "../components/CalendarGrid";
import SortSelector, { SortOrder } from "../components/SortSelector";
import { getJournals, deleteJourney, deleteJournal } from "../lib/storage";
import { JournalEntry } from "../types/models";

const { width } = Dimensions.get("window");

export default function JourneyDetailScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { colors, backgrounds } = useTheme();
  const { emojis } = useMood();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "journey">("calendar");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Because we can edit journey here, we need it in state!
  const [currentJourney, setCurrentJourney] = useState(route.params?.journey || {});
  
  React.useEffect(() => {
    // If the params journey gets updated from the edit screen, it will reflect here
    if (route.params?.journey) {
      setCurrentJourney(route.params.journey);
    }
  }, [route.params?.journey]);

  React.useEffect(() => {
    const fetchJournals = async () => {
      const dbJournals = await getJournals();
      setJournals(dbJournals.filter((j) => j.journeyId === currentJourney.id));
    };
    fetchJournals();
    const unsubscribe = navigation.addListener("focus", fetchJournals);
    return unsubscribe;
  }, [navigation, currentJourney.id]);

  const handleEditJourney = () => {
    navigation.navigate("CreateJourney", { journey: currentJourney });
  };

  const handleDeleteJourney = () => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa vĩnh viễn hành trình "${currentJourney.name || currentJourney.title}" không? Khuyến nghị: Các nhật ký thuộc hành trình này sẽ không còn nằm trong mục Hành trình nhưng vẫn xem được bên ngoài màn Nhật Ký chung.`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => {
         try {
           await deleteJourney(currentJourney.id);
           navigation.goBack();
         } catch(e) {
           Alert.alert("Lỗi", "Không thể xóa hành trình");
         }
      }}
    ]);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const jForDay = journals.find((j) => {
        const jd = new Date(j.time);
        return (
          jd.getDate() === day &&
          jd.getMonth() === currentDate.getMonth() &&
          jd.getFullYear() === currentDate.getFullYear()
        );
      });
      return {
        day,
        moodIndex: jForDay ? emojis.findIndex((e) => e.id === jForDay.typeEmoji) : -1,
      };
    });
  }, [currentDate, journals, emojis]);

  const stats = useMemo(() => {
    if (emojis.length === 0) return [];
    const counts = new Array(emojis.length).fill(0);
    journals.forEach((item) => {
      const d = new Date(item.time);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const idx = emojis.findIndex((e) => e.id === item.typeEmoji);
        if (idx >= 0) counts[idx]++;
      }
    });
    return counts;
  }, [journals, emojis, currentDate]);

  const statsTotal = useMemo(() => stats, [stats]);

  const totalEntries = useMemo(() => {
    return statsTotal.reduce((sum, count) => sum + count, 0);
  }, [statsTotal]);

  const mockPosts = useMemo(
    () => journals.map((j) => {
      const d = new Date(j.time);
      const emojiObj = emojis.find((e) => e.id === j.typeEmoji);
      return {
        id: j.id,
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
        date: `${d.getDate()} ${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`,
        moodIcon: emojiObj ? { uri: emojiObj.image } : null,
        text: j.description || j.title,
        image: j.images?.length ? j.images[0] : null,
        timestamp: d.getTime(),
      };
    }),
    [journals, emojis],
  );

  const sortedPosts = useMemo(() => {
    let posts = [...mockPosts];
    posts.sort((a, b) => {
      return sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });
    return posts;
  }, [mockPosts, sortOrder]);

  const renderContent = () => {
    if (activeTab === "calendar") {
      return (
        <View style={[styles.calendarContainer]}>
          <MonthSelector
            currentDate={currentDate}
            activeTab="Mine"
            onChangeMonth={changeMonth}
          />
          
          <View style={styles.weekdayRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={[styles.weekdayText, { color: colors.text.dark }]}>
                {day}
              </Text>
            ))}
          </View>

          <CalendarGrid
            calendarData={calendarData}
            displayMode="icon"
          />
          <MonthlyInsights
            statsByDay={stats}
            statsTotal={statsTotal}
            totalDays={calendarData.length}
            totalEntries={totalEntries}
          />        
        </View>
      );
    } else {
      return (
        <View style={styles.journeyFeed}>
          <SortSelector value={sortOrder} onValueChange={setSortOrder} />
          {sortedPosts.map((item) => (
            <View key={item.id} style={styles.postWrapper}>
              <View style={styles.dateHeader}>
                 <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                 <Text style={[styles.dateText, { color: colors.primary }]}>{item.date}</Text>
              </View>
              <PostCard item={item} />
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <ImageBackground source={backgrounds.detail} style={[styles.container, { backgroundColor: colors.background.main }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            {React.createElement(ArrowLeft as any, { size: 28, color: colors.text.dark })}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.dark }]}>Nhật ký Hành trình</Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity onPress={handleEditJourney}>
              {React.createElement(Pencil as any, { size: 24, color: colors.text.dark })}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteJourney}>
              {React.createElement(Trash2 as any, { size: 24, color: colors.error })}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.journeyInfoCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Text style={[styles.journeyTitle, { color: colors.text.dark }]}>{currentJourney.name || currentJourney.title}</Text>
            <Text style={[styles.journeyDesc, { color: colors.text.dark }]}>{currentJourney.description || "Hãy tiếp tục viết nên câu chuyện của bạn mỗi ngày."}</Text>
          </View>

          

          <View style={[styles.tabContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "calendar" && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab("calendar")}
            >
              <Calendar size={18} color={activeTab === "calendar" ? colors.text.textOnDark : colors.primary} />
              <Text style={[styles.tabText, { color: activeTab === "calendar" ? colors.text.textOnDark : colors.primary }]}>Lịch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "journey" && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab("journey")}
            >
              <LayoutGrid size={18} color={activeTab === "journey" ? colors.text.textOnDark : colors.primary} />
              <Text style={[styles.tabText, { color: activeTab === "journey" ? colors.text.textOnDark : colors.primary }]}>Hành trình</Text>
            </TouchableOpacity>
          </View>

          {renderContent()}
          <View style={{ height: 100 }} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.s,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 20 },
  scrollContent: { paddingHorizontal: SIZES.spacing.xl, paddingTop: SIZES.spacing.m },
  journeyInfoCard: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.l,
    marginBottom: SIZES.spacing.xl,
    borderWidth: 1,
  },
  journeyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    marginBottom: SIZES.spacing.s,
  },
  journeyDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: SIZES.radius.xl,
    padding: 6,
    marginBottom: SIZES.spacing.l,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: SIZES.radius.large,
    gap: 8,
  },
  tabText: { fontFamily: FONTS.bold, fontSize: 15 },
  calendarContainer: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.m,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SIZES.spacing.s,
    marginTop: SIZES.spacing.s,
  },
  weekdayText: {
    width: (width - 80) / 7,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  postWrapper: { marginBottom: SIZES.spacing.xl },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.s,
    marginLeft: SIZES.spacing.s,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dateText: { fontFamily: FONTS.bold, fontSize: 16 },
  journeyFeed: {},
});
