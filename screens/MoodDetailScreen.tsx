import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { FONTS, SIZES } from "../constants/theme";
import PostCard from "../components/PostCard";
import EmptyState from "../components/EmptyState";
import { ChevronLeft } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import CalendarGrid from "../components/CalendarGrid";
import MonthSelector from "../components/MonthSelector";
import { getJournals } from "../lib/storage";
import { JournalEntry } from "../types/models";

const { width } = Dimensions.get("window");

const MOOD_QUOTES: Record<number, string> = {
  0: "Hay mim cuoi voi doi, doi se mim cuoi voi ban.",
  1: "Cho phep ban than duoc buon, vi sau con mua troi lai sang.",
  2: "Binh yen that gian don la khi tam tri khong phien nao.",
  3: "San sang don nhan nhung dieu tuyet voi nhat va trai nghiem moi!",
  4: "Hay nghi ngoi neu ban can, nhung dung bao gio tu bo.",
};

export default function MoodDetailScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { moodId = 4 } = route.params || {};
  const { colors, backgrounds } = useTheme();
  const { emojis, language } = useMood();
  const [allJournals, setAllJournals] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const mood = useMemo(() => {
    const numericMoodId = Number(moodId);
    return (
      emojis.find((emoji) => emoji.emotion_id === numericMoodId) ||
      emojis.find((emoji) => emoji.id === numericMoodId) ||
      emojis[0]
    );
  }, [emojis, moodId]);

  const selectedEmotionId = mood?.emotion_id ?? Number(moodId);

  const quote =
    mood?.emotion_description?.[language] ||
    MOOD_QUOTES[selectedEmotionId] ||
    MOOD_QUOTES[0];

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        const journals = await getJournals();
        if (isActive) {
          setAllJournals(journals);
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const moodJournals = useMemo(() => {
    return allJournals.filter((journal) => {
      const journalMoodValue = Number(journal.typeEmoji);
      if (journalMoodValue === selectedEmotionId) {
        return true;
      }

      return emojis.some(
        (emoji) =>
          emoji.emotion_id === selectedEmotionId && emoji.id === journalMoodValue,
      );
    });
  }, [allJournals, emojis, selectedEmotionId]);

  const filteredJournals = useMemo(() => {
    return moodJournals
      .filter((journal) => {
        const date = new Date(journal.time);
        return (
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
        );
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [moodJournals, currentDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const lineChartData = useMemo(() => {
    const counts = [0, 0, 0, 0];

    filteredJournals.forEach((journal) => {
      const date = new Date(journal.time);
      const week = Math.floor((date.getDate() - 1) / 7);
      if (week < 4) counts[week]++;
      else counts[3]++;
    });

    return {
      labels: ["Tuan 1", "Tuan 2", "Tuan 3", "Tuan 4"],
      datasets: [
        {
          data: counts,
          color: () => mood?.emotion_color || colors.primary,
          strokeWidth: 3,
        },
      ],
    };
  }, [filteredJournals, mood?.emotion_color, colors.primary]);

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    const moodIndexInEmojis = emojis.findIndex(
      (emoji) => emoji.emotion_id === selectedEmotionId,
    );

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const hasThisMood = filteredJournals.some((journal) => {
        const date = new Date(journal.time);
        return date.getDate() === day;
      });

      return {
        day,
        moodIndex: hasThisMood ? moodIndexInEmojis : -1,
      };
    });
  }, [currentDate, filteredJournals, emojis, selectedEmotionId]);

  const moodPosts = useMemo(() => {
    return filteredJournals.map((journal) => {
      const date = new Date(journal.time);
      return {
        id: journal.id,
        date: `${date.getDate()} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        moodIcon: mood?.image ? { uri: mood.image } : null,
        text: journal.description || "No description",
        image: journal.images?.length ? journal.images[0] : null,
      };
    });
  }, [filteredJournals, mood?.image]);

  if (!mood) return null;

  return (
    <ImageBackground
      source={backgrounds.home}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={colors.text.dark} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.text.dark }]}>
            {language === "vi" ? "Chi tiet cam xuc" : "Mood Details"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
                shadowColor: colors.border,
              },
            ]}
          >
            <Image source={{ uri: mood.image }} style={styles.largeIcon} />
            <Text style={[styles.moodName, { color: colors.text.dark }]}>
              {mood.emotion_name}
            </Text>
            <Text style={[styles.quoteText, { color: colors.text.muted }]}>
              "{quote}"
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <MonthSelector currentDate={currentDate} onChangeMonth={changeMonth} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.dark }]}>
              {language === "vi" ? "Tan suat trong thang" : "Monthly Frequency"}
            </Text>
            <View
              style={[
                styles.chartContainer,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.border,
                  shadowColor: colors.border,
                },
              ]}
            >
              <LineChart
                data={lineChartData}
                width={width - 50}
                height={220}
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: colors.backgroundCard,
                  backgroundGradientTo: colors.backgroundCard,
                  decimalPlaces: 0,
                  color: () => mood.emotion_color || colors.primary,
                  labelColor: () => colors.text.muted,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: colors.border,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.dark }]}>
              {language === "vi"
                ? `Ngay mang cam xuc ${(mood.emotion_name || "").toLowerCase()}`
                : `Days with ${(mood.emotion_name || "").toLowerCase()}`}
            </Text>
            <CalendarGrid calendarData={calendarData} displayMode="icon" />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.dark }]}>
              {language === "vi" ? "Nhat ky lien quan" : "Related Logs"}
            </Text>
            {moodPosts.length === 0 ? (
              <EmptyState
                title={language === "vi" ? "Chua co nhat ky" : "No journal yet"}
                description={
                  language === "vi"
                    ? `Khong co bai viet nao gan cam xuc ${(mood.emotion_name || "").toLowerCase()} trong thang nay.`
                    : `No entries with ${(mood.emotion_name || "").toLowerCase()} in this month.`
                }
                onPress={() => navigation.navigate("Add")}
              />
            ) : (
              moodPosts.map((post) => <PostCard key={post.id} item={post} />)
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.m,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.s,
  },
  summaryCard: {
    alignItems: "center",
    padding: SIZES.spacing.xxl,
    borderRadius: SIZES.radius.xxxl,
    borderWidth: 1,
    marginBottom: SIZES.spacing.xxl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  largeIcon: {
    width: 100,
    height: 100,
    marginBottom: SIZES.spacing.l,
    resizeMode: "contain",
  },
  moodName: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    marginBottom: SIZES.spacing.s,
  },
  quoteText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: SIZES.spacing.m,
  },
  sectionContainer: {
    marginBottom: SIZES.spacing.xxl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: SIZES.spacing.l,
  },
  chartContainer: {
    borderRadius: SIZES.radius.xxl,
    paddingVertical: SIZES.spacing.l,
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
