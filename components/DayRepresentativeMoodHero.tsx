import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import type { Emoji } from "../context/MoodContext";
import {
  getDailyImages,
  getDailyMoods,
  getLocalDateKey,
  saveDailyImage,
  saveDailyMood,
} from "../lib/storage";
import type { JournalEntry } from "../types/models";

interface MoodDataItem {
  emotionId: number;
  percentage: number;
  count: number;
  emoji?: Emoji;
}

interface DayImageItem {
  uri: string;
  journalId: string;
  journalTime: string;
}

interface DayRepresentativeMoodHeroProps {
  journals: JournalEntry[];
  emojis: Emoji[];
  date: Date;
  onRepresentativeChanged?: (emotionId: number) => void;
  onRepresentativeImageChanged?: (imageUri: string) => void;
}

export default function DayRepresentativeMoodHero({
  journals,
  emojis,
  date,
  onRepresentativeChanged,
  onRepresentativeImageChanged,
}: DayRepresentativeMoodHeroProps) {
  const { colors } = useTheme();
  const [representativeId, setRepresentativeId] = useState<number | null>(null);
  const [isManualMood, setIsManualMood] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isManualImage, setIsManualImage] = useState(false);
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const dateKey = getLocalDateKey(date);

  const moodData = useMemo<MoodDataItem[]>(() => {
    if (journals.length === 0 || emojis.length === 0) return [];

    const counts: Record<number, number> = {};

    journals.forEach((journal) => {
      const match = emojis.find(
        (emoji) =>
          emoji.emotion_id === Number(journal.typeEmoji) ||
          emoji.id === Number(journal.typeEmoji),
      );

      if (!match) return;
      counts[match.emotion_id] = (counts[match.emotion_id] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([emotionId, count]) => {
        const numericEmotionId = Number(emotionId);
        return {
          emotionId: numericEmotionId,
          count,
          percentage: Math.round((count / journals.length) * 100),
          emoji: emojis.find((emoji) => emoji.emotion_id === numericEmotionId),
        };
      })
      .sort((a, b) => b.count - a.count || b.percentage - a.percentage);
  }, [emojis, journals]);

  const dayImages = useMemo<DayImageItem[]>(() => {
    const seen = new Set<string>();
    const images: DayImageItem[] = [];

    journals.forEach((journal) => {
      if (!journal.images?.length) return;

      journal.images.forEach((imageUri) => {
        if (!imageUri || seen.has(imageUri)) return;
        seen.add(imageUri);
        images.push({
          uri: imageUri,
          journalId: journal.id,
          journalTime: journal.time,
        });
      });
    });

    return images.sort(
      (a, b) =>
        new Date(b.journalTime).getTime() - new Date(a.journalTime).getTime(),
    );
  }, [journals]);

  useEffect(() => {
    const loadRepresentativeMood = async () => {
      const stored = await getDailyMoods();
      const storedEmotionId = stored[dateKey];

      if (storedEmotionId !== undefined) {
        setRepresentativeId(storedEmotionId);
        setIsManualMood(true);
        return;
      }

      if (moodData.length > 0) {
        setRepresentativeId(moodData[0].emotionId);
        setIsManualMood(false);
      } else {
        setRepresentativeId(null);
        setIsManualMood(false);
      }
    };

    loadRepresentativeMood();
  }, [dateKey, moodData]);

  useEffect(() => {
    const loadRepresentativeImage = async () => {
      const stored = await getDailyImages();
      const storedImageUri = stored[dateKey];
      const imageExists = dayImages.some((item) => item.uri === storedImageUri);

      if (storedImageUri && imageExists) {
        setSelectedImageUri(storedImageUri);
        setIsManualImage(true);
        return;
      }

      if (dayImages.length > 0) {
        setSelectedImageUri(dayImages[0].uri);
        setIsManualImage(false);
      } else {
        setSelectedImageUri(null);
        setIsManualImage(false);
      }
    };

    loadRepresentativeImage();
  }, [dateKey, dayImages]);

  const handleSelectMood = async (emotionId: number) => {
    await saveDailyMood(dateKey, emotionId);
    setRepresentativeId(emotionId);
    setIsManualMood(true);
    setMoodModalVisible(false);
    onRepresentativeChanged?.(emotionId);
  };

  const handleSelectImage = async (imageUri: string) => {
    await saveDailyImage(dateKey, imageUri);
    setSelectedImageUri(imageUri);
    setIsManualImage(true);
    setImageModalVisible(false);
    onRepresentativeImageChanged?.(imageUri);
  };

  const representative = emojis.find(
    (emoji) => emoji.emotion_id === representativeId,
  );

  if (!representative || moodData.length === 0) {
    return null;
  }

  return (
    <>
      <View
        style={[
          styles.cardShell,
          {
            backgroundColor: colors.backgroundCard,
            borderColor: colors.border,
          },
        ]}
      >
        {selectedImageUri ? (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setImageModalVisible(true)}
          >
            <ImageBackground
              source={{ uri: selectedImageUri }}
              imageStyle={styles.heroImage}
              style={styles.heroBody}
            >
              <View style={styles.heroOverlay} />
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.heroBody,
              styles.heroFallback,
              { backgroundColor: colors.background.soft },
            ]}
          >
            <Text style={[styles.heroEyebrow, { color: colors.text.dark }]}>
              Cảm xúc đại diện
            </Text>
            <Text
              style={[styles.heroFallbackTitle, { color: colors.secondary }]}
            >
              {representative.emotion_name || "Mood of the day"}
            </Text>
            <Text
              style={[styles.heroFallbackText, { color: colors.text.muted }]}
            >
              Ngày này chưa có ảnh. Emoji được hiển thị trên lịch icon.
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setMoodModalVisible(true)}
          style={[
            styles.floatingEmojiButton,
            {
              backgroundColor: colors.background.white,
              borderColor: colors.border,
              shadowColor: "#000",
            },
          ]}
        >
          <Image
            source={{ uri: representative.image }}
            style={styles.floatingEmojiImage}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={moodModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMoodModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMoodModalVisible(false)}
        />
        <View
          style={[styles.sheet, { backgroundColor: colors.backgroundCard }]}
        >
          <View
            style={[styles.sheetHandle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.sheetTitle, { color: colors.secondary }]}>
            Chọn emoji đại diện trong ngày
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.text.muted }]}>
            Danh sách này được tính từ tất cả nhật ký của ngày đã chọn.
          </Text>

          <FlatList
            data={moodData}
            keyExtractor={(item) => String(item.emotionId)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = representativeId === item.emotionId;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSelectMood(item.emotionId)}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected
                        ? `${colors.primary}16`
                        : colors.background.soft,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.emoji?.image }}
                    style={styles.optionEmoji}
                  />
                  <View style={styles.optionContent}>
                    <View style={styles.optionHeader}>
                      <Text
                        style={[styles.optionName, { color: colors.text.dark }]}
                      >
                        {item.emoji?.emotion_name ||
                          `Emotion ${item.emotionId}`}
                      </Text>
                      <Text
                        style={[
                          styles.optionPercent,
                          {
                            color: isSelected
                              ? colors.primary
                              : colors.text.dark,
                          },
                        ]}
                      >
                        {item.percentage}%
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.progressTrack,
                        { backgroundColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.text.dark,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.optionMeta, { color: colors.text.muted }]}
                    >
                      {item.count} nhật ký
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.selectionCircle,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    {isSelected ? (
                      <Check size={12} color={colors.text.textOnDark} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={imageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setImageModalVisible(false)}
        />
        <View
          style={[styles.sheet, { backgroundColor: colors.backgroundCard }]}
        >
          <View
            style={[styles.sheetHandle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.sheetTitle, { color: colors.secondary }]}>
            Chọn ảnh đại diện trong ngày
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.text.muted }]}>
            Ảnh được chọn sẽ hiển thị trong lịch khi bạn chuyển sang chế độ ảnh.
          </Text>

          <FlatList
            data={dayImages}
            keyExtractor={(item) => item.uri}
            numColumns={2}
            columnWrapperStyle={styles.imageGridRow}
            renderItem={({ item }) => {
              const isSelected = selectedImageUri === item.uri;

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleSelectImage(item.uri)}
                  style={[
                    styles.imageOptionCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.imageOptionImage}
                  />
                  <View
                    style={[
                      styles.imageSelectionBadge,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : "rgba(255,255,255,0.92)",
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    {isSelected ? (
                      <Check size={12} color={colors.text.textOnDark} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    marginBottom: SIZES.spacing.xl,
    borderRadius: 28,
    borderWidth: 1,
    padding: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  heroBody: {
    minHeight: 250,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,16,32,0.18)",
  },
  heroInfo: {
    padding: 18,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  heroFallback: {
    padding: 22,
    justifyContent: "flex-end",
  },
  heroFallbackTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    marginTop: 8,
  },
  heroFallbackText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  floatingEmojiButton: {
    position: "absolute",
    top: -10,
    right: -2,
    width: 58,
    height: 58,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingEmojiImage: {
    width: 42,
    height: 42,
  },
  dropdownBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    maxHeight: "72%",
    borderTopLeftRadius: SIZES.radius.xxxl,
    borderTopRightRadius: SIZES.radius.xxxl,
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.l,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: SIZES.spacing.l,
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    textAlign: "center",
  },
  sheetSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: SIZES.spacing.l,
    lineHeight: 18,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.m,
    marginBottom: SIZES.spacing.s,
    gap: SIZES.spacing.m,
  },
  optionEmoji: {
    width: 46,
    height: 46,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    flex: 1,
  },
  optionPercent: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginLeft: 10,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  optionMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 8,
  },
  selectionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  imageGridRow: {
    gap: SIZES.spacing.m,
    marginBottom: SIZES.spacing.m,
  },
  imageOptionCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: SIZES.radius.xl,
    overflow: "hidden",
    aspectRatio: 0.95,
    position: "relative",
  },
  imageOptionImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageSelectionBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
