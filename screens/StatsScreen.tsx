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
  Modal,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import DayDetailScreen from "./DayDetailScreen";
import MonthSelector from "../components/MonthSelector";
import MonthlyInsights from "../components/MonthlyInsights";
import CalendarGrid from "../components/CalendarGrid";
import { useMood } from "../context/MoodContext";
import MoodIcon from "../components/MoodIcon";
import PostCard from "../components/PostCard";
import SortSelector, { SortOrder } from "../components/SortSelector";
import { getJournals } from "../lib/storage";
import { JournalEntry } from "../types/models";
import EmptyState from "../components/EmptyState";

const { width } = Dimensions.get("window");

export default function StatsScreen({ navigation }: any) {
  const { colors, backgrounds } = useTheme();
  const { emojis, loading, language, t } = useMood();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [activeTab] = useState<"Mine" | "Friends">("Mine");
  const [displayMode, setDisplayMode] = useState<"icon" | "image">("icon");
  const [mainTab, setMainTab] = useState<"Lịch" | "Hành trình">("Lịch");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  React.useEffect(() => {
    const fetchJournals = async () => {
      const dbJournals = await getJournals();
      setJournals(dbJournals);
    };
    const unsubscribe = navigation.addListener("focus", fetchJournals);
    return unsubscribe;
  }, [navigation]);

  const journalSections = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    journals.forEach((j) => {
      const d = new Date(j.time);
      const dateStr = `${d.getDate()} ${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;

      if (!grouped[dateStr]) grouped[dateStr] = [];
      const emojiObj = emojis.find((e) => e.emotion_id === Number(j.typeEmoji)) ||
        emojis.find((e) => e.id === Number(j.typeEmoji));

      grouped[dateStr].push({
        id: j.id,
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
        moodIcon: emojiObj ? { uri: emojiObj.image } : null,
        text: j.description,
        image: j.images?.length ? j.images[0] : null,
        timestamp: d.getTime(),
      });
    });

    return Object.keys(grouped).map((k) => ({
      title: k,
      data: grouped[k].sort((a, b) => b.timestamp - a.timestamp),
    }));
  }, [journals, emojis]);

  const sortedSections = useMemo(() => {
    let sections = [...journalSections];
    if (sortOrder === "newest") {
      sections.sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());
    } else {
      sections.sort((a, b) => new Date(a.title).getTime() - new Date(b.title).getTime());
    }
    return sections;
  }, [journalSections, sortOrder]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const mockGallery = useMemo(() => {
    const imagesArray: any[] = [];
    journals.forEach((j) => {
      if (j.images && j.images.length > 0) {
        const d = new Date(j.time);
        const emojiObj = emojis.find((e) => e.emotion_id === Number(j.typeEmoji)) ||
          emojis.find((e) => e.id === Number(j.typeEmoji));
        imagesArray.push({
          id: j.id,
          date: `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`,
          moodIcon: emojiObj ? { uri: emojiObj.image } : null,
          image: j.images[0],
          timestamp: d.getTime(),
        });
      }
    });
    return imagesArray.sort((a, b) => b.timestamp - a.timestamp);
  }, [journals, emojis]);

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
        moodIndex: jForDay ? emojis.findIndex((e) => e.emotion_id === Number(jForDay.typeEmoji) || e.id === Number(jForDay.typeEmoji)) : -1,
      };
    });
  }, [currentDate, journals, emojis]);

  const stats = useMemo(() => {
    if (emojis.length === 0) return [];
    const counts = new Array(emojis.length).fill(0);
    journals.forEach((item) => {
      const d = new Date(item.time);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const idx = emojis.findIndex((e) => e.emotion_id === Number(item.typeEmoji) || e.id === Number(item.typeEmoji));
        if (idx >= 0) counts[idx]++;
      }
    });
    return counts;
  }, [journals, emojis, currentDate]);

  const statsTotal = useMemo(() => stats, [stats]);

  const totalEntries = useMemo(() => {
    return statsTotal.reduce((sum, count) => sum + count, 0);
  }, [statsTotal]);

  return (
    <ImageBackground source={backgrounds.stats} style={[styles.container, { backgroundColor: colors.background.main }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.text.dark }]}>{t('stats_title')}</Text>
        </View>

        <View style={[styles.mainTabContainer, { borderColor: colors.border, backgroundColor: colors.background.soft }]}>
          <TouchableOpacity
            style={[styles.mainTabBtn, mainTab === "Lịch" && { backgroundColor: colors.primary }]}
            onPress={() => setMainTab("Lịch")}
          >
            <Text style={[styles.mainTabText, { color: mainTab === "Lịch" ? colors.text.textOnDark : colors.primary }]}>
              {language === 'vi' ? "Lịch" : "Calendar"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTabBtn, mainTab === "Hành trình" && { backgroundColor: colors.primary }]}
            onPress={() => setMainTab("Hành trình")}
          >
            <Text style={[styles.mainTabText, { color: mainTab === "Hành trình" ? colors.text.textOnDark : colors.primary }]}>
              {t('journeys')}
            </Text>
          </TouchableOpacity>
        </View>

        {mainTab === "Lịch" ? (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

              <View style={{ zIndex: 5 }}>
                <View style={{ marginBottom: SIZES.spacing.s, zIndex: 10, flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={{ flex: 1 }}>

                    <MonthSelector
                      currentDate={currentDate}
                      activeTab={activeTab}
                      onChangeMonth={changeMonth}
                      showDay={false}
                    />
                  </View>
                  <View style={[styles.viewModeContainer, { backgroundColor: colors.background.soft }]}>
                    {
                      displayMode === "icon" ? <TouchableOpacity
                        style={[
                          styles.viewModeBtn,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => setDisplayMode("image")}
                      >
                        <Text style={[styles.viewModeText, { color: colors.text.textOnDark }]}>
                          {language === 'vi' ? "Cảm xúc" : "Mood"}
                        </Text>
                      </TouchableOpacity> : <TouchableOpacity
                        style={[
                          styles.viewModeBtn,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => setDisplayMode("icon")}
                      >
                        <Text style={[styles.viewModeText, { color: colors.text.textOnDark }]}>
                          {language === 'vi' ? "Hình ảnh" : "Gallery"}
                        </Text>
                      </TouchableOpacity>
                    }
                  </View>
                </View>

              </View>

              <View style={styles.weekdayRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <Text key={day} style={[styles.weekdayText, { color: colors.text.dark }]}>
                    {day}
                  </Text>
                ))}
              </View>

              <CalendarGrid
                calendarData={calendarData}
                displayMode={displayMode}
                onDayPress={(day) => {
                  setSelectedDay(day);
                  setIsDetailVisible(true);
                }}
                mockGallery={mockGallery}
              />

              <MonthlyInsights
                statsByDay={stats}
                statsTotal={statsTotal}
                totalDays={calendarData.length}
                totalEntries={totalEntries}
              />

              <View style={styles.gallerySection}>
                <View style={styles.galleryHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: colors.text.dark, marginBottom: 0 }]}>{t('images')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Gallery")}>
                    <Text style={{ fontFamily: FONTS.bold, color: colors.text.dark }}>{t('view_all')}</Text>
                  </TouchableOpacity>
                </View>
                {mockGallery.length === 0 ? (
                  <EmptyState
                    title={t('no_data')}
                    description={t('no_image_desc')}
                    showButton={false}
                  />
                ) : (<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                  {mockGallery.map((item) => (
                    <View key={item.id} style={styles.galleryItem}>
                      <Image source={{ uri: item.image }} style={styles.galleryImage} />
                      <View style={styles.galleryInfo}>
                        <Text style={[styles.galleryDate, { color: colors.text.dark }]}>{item.date}</Text>
                        {item.moodIcon && <Image source={{ uri: item.moodIcon.uri }} style={styles.galleryIcon} />}
                      </View>
                    </View>
                  ))}
                </ScrollView>)}
              </View>
              <View style={{ height: 100 }} />
            </ScrollView>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            {sortedSections.length === 0 ? (
              <EmptyState
                title={t('no_data')}
                description={t('empty_desc')}
                onPress={() => navigation.navigate("Add")}
                showButton={true}
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.journalListContent}>
                <View style={styles.sortContainer}>
                  <SortSelector value={sortOrder} onValueChange={setSortOrder} />
                </View>
                {sortedSections.map((section, index) => (
                  <View key={index}>
                    <View style={{ paddingHorizontal: SIZES.spacing.xl, paddingVertical: SIZES.spacing.s, marginTop: SIZES.spacing.s }}>
                      <Text style={{ fontFamily: FONTS.bold, fontSize: 16, color: colors.text.dark }}>{section.title}</Text>
                    </View>
                    {section.data.map((item) => (
                      <View key={item.id} style={styles.journalItemContainer}>
                        <PostCard item={item} />
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <Modal visible={isDetailVisible} animationType="slide" onRequestClose={() => setIsDetailVisible(false)}>
          <DayDetailScreen
            navigation={{ ...navigation, goBack: () => setIsDetailVisible(false) }}
            route={{
              params: {
                day: selectedDay,
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
              },
            }}
          />
        </Modal>
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
  screenTitle: { fontFamily: FONTS.bold, fontSize: 22 },
  scrollContent: { paddingHorizontal: SIZES.spacing.xl, paddingTop: SIZES.spacing.s },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.spacing.s,
  },
  weekdayText: {
    width: (width - 40 - 48) / 7,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    padding: 4,
  },
  moodIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    marginBottom: SIZES.spacing.l,
  },
  galleryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacing.s,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  galleryDate: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  galleryIcon: {
    width: 34,
    height: 34,
  },
  viewModeContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 4,
    alignSelf: "center",
  },
  viewModeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  viewModeText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  mainTabContainer: {
    flexDirection: "row",
    marginHorizontal: SIZES.spacing.xl,
    borderRadius: SIZES.radius.xl,
    padding: 4,
    marginBottom: SIZES.spacing.l,
    borderWidth: 1,
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: SIZES.radius.medium,
  },
  mainTabText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  journalListContent: {
    paddingBottom: 100,
  },
  journalItemContainer: {
    paddingHorizontal: SIZES.spacing.xl,
  },
  sortContainer: {
    paddingHorizontal: SIZES.spacing.xl,
    marginTop: SIZES.spacing.s,
    marginBottom: SIZES.spacing.s,
    zIndex: 20,
  },
});
