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
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { FONTS, SIZES } from "../constants/theme";
import PostCard from "../components/PostCard";
import EmptyState from "../components/EmptyState";
import { ChevronLeft } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import CalendarGrid from "../components/CalendarGrid";
import { getJournals } from "../lib/storage";
import { JournalEntry } from "../types/models";

const { width } = Dimensions.get("window");

const MOOD_QUOTES: Record<number, string> = {
  0: "Hãy mỉm cười với đời, đời sẽ mỉm cười với bạn.",
  1: "Cho phép bản thân được buồn, vì sau cơn mưa trời lại sáng.",
  2: "Bình yên thật giản đơn là khi tâm trí không phiền não.",
  3: "Sẵn sàng đón nhận những điều tuyệt vời nhất và trải nghiệm mới!",
  4: "Hãy nghỉ ngơi nếu bạn cần, nhưng đừng bao giờ từ bỏ.",
};

export default function MoodDetailScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { moodId = 4 } = route.params || {}; // Assuming moodId is number, fallback to something
  const { colors, backgrounds } = useTheme();
  const { emojis, t, language } = useMood();
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  const mood = emojis.find((m) => m.id === moodId) || emojis[0];
  const quote = MOOD_QUOTES[mood?.emotion_id || 0] || MOOD_QUOTES[0];

  React.useEffect(() => {
    const fetchData = async () => {
      const all = await getJournals();
      const filtered = all.filter(j => Number(j.typeEmoji) === moodId);
      setJournals(filtered.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
    };
    fetchData();
  }, [moodId]);

  if (!mood) return null;

  // Dummy data for Line Chart (Tần suất xuất hiện theo tuần)
  // Real data for Line Chart (Tần suất xuất hiện theo tuần trong tháng hiện tại)
  const lineChartData = useMemo(() => {
    const counts = [0, 0, 0, 0]; // 4 weeks
    const now = new Date();
    journals.forEach(j => {
      const d = new Date(j.time);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const week = Math.floor((d.getDate() - 1) / 7);
        if (week < 4) counts[week]++;
        else counts[3]++;
      }
    });

    const moodIndex = emojis.findIndex(e => e.id === mood.id);

    return {
      labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
      datasets: [
        {
          data: counts,
          color: (opacity = 1) => colors.moods[moodIndex] || colors.primary,
          strokeWidth: 3,
        },
      ],
    };
  }, [journals, colors, mood.id, emojis]);

  // Real data for Calendar
  const calendarData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const moodIndexInEmojis = emojis.findIndex((e) => e.id === mood.id);
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const hasThisMood = journals.some((j) => {
        const d = new Date(j.time);
        return (
          d.getDate() === day &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
      return {
        day,
        moodIndex: hasThisMood ? moodIndexInEmojis : -1,
      };
    });
  }, [journals, mood.id, emojis]);

  // Real List of Posts for this mood
  const moodPosts = useMemo(() => {
    return journals.map(j => {
      const d = new Date(j.time);
      return {
        id: j.id,
        date: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`,
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        moodIcon: { uri: mood.image },
        text: j.description || j.title || "No description",
        image: j.images?.length ? j.images[0] : null
      };
    });
  }, [journals, mood.image]);

  return (
    <ImageBackground source={backgrounds.home} style={[styles.container, { backgroundColor: colors.background.main }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={colors.text.dark} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.text.dark }]}>
            {language === 'vi' ? 'Chi tiết cảm xúc' : 'Mood Details'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Mood Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border, shadowColor: colors.border }]}>
            <Image source={{ uri: mood.image }} style={styles.largeIcon} />
            <Text style={[styles.moodName, { color: colors.text.dark }]}>{mood.emotion_name}</Text>
            <Text style={[styles.quoteText, { color: colors.text.muted }]}>"{quote}"</Text>
          </View>

          {/* Line Chart */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.dark }]}>{language === 'vi' ? 'Tần suất trong tháng' : 'Monthly Frequency'}</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border, shadowColor: colors.border }]}>
              <LineChart
                data={lineChartData}
                width={width - 50}
                height={220}
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: colors.backgroundCard,
                  backgroundGradientTo: colors.backgroundCard,
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.text.dark,
                  labelColor: (opacity = 1) => colors.text.muted,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: colors.border
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
          </View>

          {/* Calendar Highlight */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.dark }]}>Ngày mang cảm xúc {(mood.emotion_name || '').toLowerCase()}</Text>
            <CalendarGrid
              calendarData={calendarData}
              displayMode="icon"
            />
          </View>

          {/* Post List */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.dark }]}>{language === 'vi' ? 'Nhật ký liên quan' : 'Related Logs'}</Text>
            {moodPosts.length === 0 ? (
              <EmptyState
                title="Chưa có nhật ký"
                description={`Bạn chưa có bài viết nào gắn cảm xúc ${(mood.emotion_name || '').toLowerCase()}.`}
                onPress={() => navigation.navigate("Add")}
              />
            ) : (
              moodPosts.map(post => (
                <PostCard key={post.id} item={post} />
              ))
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
});
