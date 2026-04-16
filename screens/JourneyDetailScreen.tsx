import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  LayoutGrid,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarGrid from "../components/CalendarGrid";
import MonthSelector from "../components/MonthSelector";
import MonthlyInsights from "../components/MonthlyInsights";
import PostCard from "../components/PostCard";
import SortSelector, { SortOrder } from "../components/SortSelector";
import { FONTS, SIZES } from "../constants/theme";
import { useMood } from "../context/MoodContext";
import { useTheme } from "../context/ThemeContext";
import { deleteJourney, getJournals, getJourneys } from "../lib/storage";
import { JournalEntry, Journey } from "../types/models";

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
  const [activeTab, setActiveTab] = useState<"calendar" | "journey">(
    "calendar",
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentJourney, setCurrentJourney] = useState<Journey>(
    route.params?.journey || { id: "", name: "", description: "" },
  );

  React.useEffect(() => {
    if (route.params?.journey) {
      setCurrentJourney(route.params.journey);
    }
  }, [route.params?.journey]);

  React.useEffect(() => {
    const refreshData = async () => {
      const journeyData = await getJourneys();
      const updatedJourney = journeyData.find(
        (journey: Journey) => journey.id === currentJourney.id,
      );
      if (updatedJourney) {
        setCurrentJourney(updatedJourney);
      }

      const dbJournals = await getJournals();
      setJournals(
        dbJournals.filter((journal) => journal.journeyId === currentJourney.id),
      );
    };

    refreshData();
    const unsubscribe = navigation.addListener("focus", refreshData);
    return unsubscribe;
  }, [navigation, currentJourney.id]);

  const handleEditJourney = () => {
    navigation.navigate("CreateJourney", { journey: currentJourney });
  };

  const handleWriteJournal = () => {
    navigation.navigate("AddJournal", {
      initialJourneyId: currentJourney.id,
    });
  };

  const handleDeleteJourney = () => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa vĩnh viễn hành trình "${currentJourney.name}" không? Các nhật ký thuộc hành trình này sẽ không còn nằm trong mục Hành trình nhưng vẫn xem được ở màn Nhật ký chung.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteJourney(currentJourney.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa hành trình");
            }
          },
        },
      ],
    );
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const journalForDay = journals.find((journal) => {
        const journalDate = new Date(journal.time);
        return (
          journalDate.getDate() === day &&
          journalDate.getMonth() === currentDate.getMonth() &&
          journalDate.getFullYear() === currentDate.getFullYear()
        );
      });

      return {
        day,
        moodIndex: journalForDay
          ? emojis.findIndex(
              (emoji) =>
                emoji.emotion_id === Number(journalForDay.typeEmoji) ||
                emoji.id === Number(journalForDay.typeEmoji),
            )
          : -1,
      };
    });
  }, [currentDate, journals, emojis]);

  const stats = useMemo(() => {
    if (emojis.length === 0) return [];

    const counts = new Array(emojis.length).fill(0);
    journals.forEach((journal) => {
      const journalDate = new Date(journal.time);
      if (
        journalDate.getMonth() === currentDate.getMonth() &&
        journalDate.getFullYear() === currentDate.getFullYear()
      ) {
        const moodIndex = emojis.findIndex(
          (emoji) =>
            emoji.emotion_id === Number(journal.typeEmoji) ||
            emoji.id === Number(journal.typeEmoji),
        );
        if (moodIndex >= 0) counts[moodIndex]++;
      }
    });

    return counts;
  }, [journals, emojis, currentDate]);

  const totalEntries = useMemo(() => {
    return stats.reduce((sum, count) => sum + count, 0);
  }, [stats]);

  const posts = useMemo(
    () =>
      journals.map((journal) => {
        const journalDate = new Date(journal.time);
        const emojiObj =
          emojis.find(
            (emoji) => emoji.emotion_id === Number(journal.typeEmoji),
          ) ||
          emojis.find((emoji) => emoji.id === Number(journal.typeEmoji));

        return {
          id: journal.id,
          time: journalDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          date: `${journalDate.getDate()} ${journalDate.toLocaleString(
            "default",
            { month: "long" },
          )} ${journalDate.getFullYear()}`,
          moodIcon: emojiObj ? { uri: emojiObj.image } : null,
          text: journal.description,
          image: journal.images?.length ? journal.images[0] : null,
          timestamp: journalDate.getTime(),
        };
      }),
    [journals, emojis],
  );

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) =>
      sortOrder === "newest"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp,
    );
  }, [posts, sortOrder]);

  const sortedPostIds = useMemo(
    () => sortedPosts.map((item) => item.id),
    [sortedPosts],
  );

  const renderContent = () => {
    if (activeTab === "calendar") {
      return (
        <View style={styles.calendarContainer}>
          <MonthSelector
            currentDate={currentDate}
            activeTab="Mine"
            onChangeMonth={changeMonth}
          />

          <View style={styles.weekdayRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text
                key={day}
                style={[styles.weekdayText, { color: colors.text.dark }]}
              >
                {day}
              </Text>
            ))}
          </View>

          <CalendarGrid calendarData={calendarData} displayMode="icon" />
          <MonthlyInsights
            statsByDay={stats}
            statsTotal={stats}
            totalDays={calendarData.length}
            totalEntries={totalEntries}
          />
        </View>
      );
    }

    return (
      <View style={styles.journeyFeed}>
        <SortSelector value={sortOrder} onValueChange={setSortOrder} />
        {sortedPosts.map((item) => (
          <View key={item.id} style={styles.postWrapper}>
            <View style={styles.dateHeader}>
              <View
                style={[styles.dot, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.dateText, { color: colors.primary }]}>
                {item.date}
              </Text>
            </View>
            <PostCard
              item={item}
              journalIds={sortedPostIds}
              initialIndex={sortedPostIds.indexOf(item.id)}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      source={backgrounds.detail}
      style={[
        styles.container,
        { backgroundColor: colors.background.main },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            {React.createElement(ArrowLeft as any, {
              size: 28,
              color: colors.text.dark,
            })}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.secondary }]}>
            Nhật ký Hành trình
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditJourney}>
              {React.createElement(Pencil as any, {
                size: 24,
                color: colors.text.dark,
              })}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteJourney}>
              {React.createElement(Trash2 as any, {
                size: 24,
                color: colors.error,
              })}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.journeyInfoCard,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
                shadowColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.journeyTitle, { color: colors.text.dark }]}>
              {currentJourney.name}
            </Text>
            <Text style={[styles.journeyDesc, { color: colors.text.dark }]}>
              {currentJourney.description ||
                "Hãy tiếp tục viết nên câu chuyện của bạn mỗi ngày."}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleWriteJournal}
              style={[styles.writeButton, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.writeButtonText,
                  { color: colors.text.textOnDark },
                ]}
              >
                Viết nhật ký
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.tabContainer,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "calendar" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab("calendar")}
            >
              <Calendar
                size={18}
                color={
                  activeTab === "calendar"
                    ? colors.text.textOnDark
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "calendar"
                        ? colors.text.textOnDark
                        : colors.primary,
                  },
                ]}
              >
                Lịch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "journey" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab("journey")}
            >
              <LayoutGrid
                size={18}
                color={
                  activeTab === "journey"
                    ? colors.text.textOnDark
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "journey"
                        ? colors.text.textOnDark
                        : colors.primary,
                  },
                ]}
              >
                Hành trình
              </Text>
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
  headerActions: {
    flexDirection: "row",
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.m,
  },
  journeyInfoCard: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.l,
    marginBottom: SIZES.spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
  writeButton: {
    marginTop: SIZES.spacing.l,
    alignSelf: "flex-start",
    paddingHorizontal: SIZES.spacing.l,
    paddingVertical: 12,
    borderRadius: SIZES.radius.large,
  },
  writeButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
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
  tabText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
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
  postWrapper: {
    marginBottom: SIZES.spacing.xl,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.spacing.s,
    marginLeft: SIZES.spacing.s,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  journeyFeed: {},
});
