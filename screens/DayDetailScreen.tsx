import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";
import { FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import MoodIcon from "../components/MoodIcon";
import EmptyState from "../components/EmptyState";
import { getJournals } from "../lib/storage";
import { resolveImageUri } from "../lib/fileHelper";
import { JournalEntry } from "../types/models";
import MonthSelector from "../components/MonthSelector";
import DayRepresentativeMoodHero from "../components/DayRepresentativeMoodHero";

const { width } = Dimensions.get("window");

const MOOD_LABELS = ["Rất vui", "Hạnh phúc", "Bình thường", "Buồn", "Tức giận"];

export default function DayDetailScreen({
  navigation,
  route,
  onRepresentativeChanged,
  onRepresentativeImageChanged,
}: {
  navigation: any;
  route: any;
  onRepresentativeChanged?: (date: Date, emotionId: number) => void;
  onRepresentativeImageChanged?: (date: Date, imageUri: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors, backgrounds } = useTheme();
  const { emojis, language, t } = useMood();
  const [selectedDate, setSelectedDate] = React.useState(
    route.params?.day && route.params?.month !== undefined && route.params?.year
      ? new Date(route.params.year, route.params.month, route.params.day)
      : new Date(),
  );
  const [journals, setJournals] = React.useState<JournalEntry[]>([]);

  React.useEffect(() => {
    const fetchDayJournals = async () => {
      const all = await getJournals();
      const filtered = all.filter((j) => {
        const d = new Date(j.time);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      });
      setJournals(
        filtered.sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        ),
      );
    };
    fetchDayJournals();
  }, [selectedDate]);

  // Use dynamic colors for PIE_DATA
  // Calculate pieData based on real logs
  const pieData = React.useMemo(() => {
    if (emojis.length === 0 || journals.length === 0) return [];

    const counts = new Array(emojis.length).fill(0);
    journals.forEach((j) => {
      const idx = emojis.findIndex(
        (e) =>
          e.emotion_id === Number(j.typeEmoji) || e.id === Number(j.typeEmoji),
      );
      if (idx >= 0) counts[idx]++;
    });

    return emojis
      .map((e, index) => ({
        percentage: Math.round((counts[index] / journals.length) * 100),
        color: e.emotion_color || colors.primary,
        label: e.emotion_name,
        count: counts[index],
      }))
      .filter((item) => item.count > 0);
  }, [journals, emojis, colors]);
  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };
  const isSelectedDateToday = React.useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  }, [selectedDate]);

  const renderPieChart = () => {
    if (pieData.length === 0) {
      return (
        <View
          style={[
            styles.pieContainer,
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.background.soft,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text style={{ fontSize: 10, color: colors.text.muted }}>
            No data
          </Text>
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
            <Text style={[styles.totalLabel, { color: colors.text.dark }]}>
              Daily Mix
            </Text>
          </View>
        </Svg>
      </View>
    );
  };

  return (
    <ImageBackground source={backgrounds.detail} style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {React.createElement(ArrowLeft as any, {
              size: 28,
              color: colors.text.dark,
            })}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.secondary }]}>
            {t("daily_stats")}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ gap: 10, marginBottom: 20 }}>
            {/* Selector cho Ngày */}
            <MonthSelector
              currentDate={selectedDate}
              showDay={true}
              onChangeMonth={changeDay}
              onCalendarPress={() => {}} // Could open a full calendar modal
            />
          </View>

          <DayRepresentativeMoodHero
            journals={journals}
            emojis={emojis}
            date={selectedDate}
            onRepresentativeChanged={(emotionId) =>
              onRepresentativeChanged?.(selectedDate, emotionId)
            }
            onRepresentativeImageChanged={(imageUri) =>
              onRepresentativeImageChanged?.(selectedDate, imageUri)
            }
          />

          <View style={styles.timelineSection}>
            {journals.length === 0 ? (
              !isSelectedDateToday ? (
                <EmptyState
                  title={
                    language === "vi"
                      ? "Chưa có nhật ký cho ngày này"
                      : "No diary for this day"
                  }
                  description={
                    language === "vi"
                      ? "Bạn chỉ có thể tạo nhật ký cho hôm nay. Hãy quay về ngày hiện tại để viết nhật ký mới."
                      : "You can only create entries for today. Go back to today to write a new entry."
                  }
                  showButton={false}
                />
              ) : (
                <EmptyState
                title={
                  isSelectedDateToday
                    ? undefined
                    : language === "vi"
                      ? "Chưa có nhật ký cho ngày này"
                      : "No diary for this day"
                }
                description={
                  isSelectedDateToday
                    ? undefined
                    : language === "vi"
                      ? "Bạn chỉ có thể tạo nhật ký cho hôm nay. Hãy quay về ngày hiện tại để viết nhật ký mới."
                      : "You can only create entries for today. Go back to today to write a new entry."
                }
                buttonText={
                  isSelectedDateToday
                    ? language === "vi"
                      ? "Viết nhật ký hôm nay"
                      : "Write today's entry"
                    : undefined
                }
                showButton={isSelectedDateToday}
                onPress={
                  isSelectedDateToday
                    ? () => {
                        navigation.goBack();
                        navigation.navigate("AddJournal");
                      }
                    : undefined
                }
              />
              )
            ) : (
              journals.map((item, index) => {
                const d = new Date(item.time);
                const tStr = d.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                console;
                const mood =
                  emojis.find(
                    (e) =>
                      e.emotion_id === Number(item.typeEmoji) ||
                      e.id === Number(item.typeEmoji),
                  ) || null;
                const moodIdx = emojis.findIndex(
                  (e) =>
                    e.emotion_id === Number(item.typeEmoji) ||
                    e.id === Number(item.typeEmoji),
                );
                const lineColor = mood?.emotion_color || colors.primary;
                const timelineTitle = item.description;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={styles.timelineItem}
                    onPress={() =>
                      navigation.navigate("DiaryDetail", {
                        journalIds: journals.map((journal) => journal.id),
                        initialIndex: index,
                      })
                    }
                  >
                    {/* Time Display */}
                    <View style={styles.timeContainer}>
                      <Text
                        style={[styles.timeText, { color: colors.text.dark }]}
                      >
                        {tStr}
                      </Text>
                    </View>

                    {/* Vertical Connector and Icon (Left Side) */}
                    <View style={styles.connectorContainer}>
                      {item.images?.[0] ? (
                        <Image
                          source={{ uri: resolveImageUri(item.images[0]) }}
                          style={[
                            styles.timelineImage,
                            { borderColor: colors.background.white },
                          ]}
                        />
                      ) : null}

                      <View
                        style={[
                          styles.moodIconOnLine,
                          {
                            backgroundColor: colors.background.white,
                            borderColor: lineColor,
                          },
                        ]}
                      >
                        <MoodIcon
                          index={moodIdx}
                          size={54}
                          style={styles.timelineMoodIcon}
                        />
                      </View>
                    </View>

                    {/* Label (Right Side) */}
                    <View style={styles.labelContainer}>
                      <Text
                        style={[styles.moodLabel, { color: colors.text.dark }]}
                      >
                        {timelineTitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Mood Mix Section */}
          {journals.length > 0 && (
            <View style={styles.moodMixSection}>
              <View
                style={[
                  styles.chartWrapper,
                  { backgroundColor: colors.backgroundCard },
                ]}
              >
                {renderPieChart()}
                <View style={styles.legendContainer}>
                  {pieData.map((item, index) => (
                    <View key={index} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text
                        style={[styles.legendText, { color: colors.text.dark }]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.legendPercent,
                          { color: colors.text.dark },
                        ]}
                      >
                        {item.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    position: "relative",
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 92,
  },
  timeContainer: {
    width: 72,
    justifyContent: "center",
  },
  timeText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  connectorContainer: {
    width: 120,
    justifyContent: "center",
    position: "relative",
    height: 92,
  },
  timelineImage: {
    position: "absolute",
    left: 0,
    top: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
    borderWidth: 2,
  },
  noImageCircle: {
    position: "absolute",
    left: 0,
    top: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  moodIconOnLine: {
    position: "absolute",
    left: 62,
    top: "50%",
    marginTop: -18,
    width: 24,
    height: 24,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  timelineMoodIcon: {
    width: 54,
    height: 54,
  },
  timelineLineTop: {
    position: "absolute",
    left: 79,
    top: 0,
    width: 3,
    height: 46,
    borderRadius: 2,
    opacity: 0.75,
  },
  timelineLineBottom: {
    position: "absolute",
    left: 79,
    bottom: 0,
    width: 3,
    height: 46,
    borderRadius: 2,
    opacity: 0.75,
  },
  labelContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  moodLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  moodMixSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.radius.xxl,
    padding: 20,
  },
  pieContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  chartOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
