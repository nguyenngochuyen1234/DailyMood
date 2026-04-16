import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Pencil } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { FONTS, SIZES } from "../constants/theme";
import EmptyState from "../components/EmptyState";
import MoodIcon from "../components/MoodIcon";
import { resolveImageUri } from "../lib/fileHelper";
import { getJournals } from "../lib/storage";
import { JournalEntry } from "../types/models";

const { width } = Dimensions.get("window");

function DiaryPage({
  journal,
  onEdit,
  navigation,
}: {
  journal: JournalEntry;
  onEdit: () => void;
  navigation: any;
}) {
  const { colors } = useTheme();
  const { emojis, language } = useMood();
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const mood = React.useMemo(() => {
    return (
      emojis.find((emoji) => emoji.emotion_id === Number(journal.typeEmoji)) ||
      emojis.find((emoji) => emoji.id === Number(journal.typeEmoji)) ||
      null
    );
  }, [emojis, journal.typeEmoji]);

  const diaryDate = React.useMemo(() => new Date(journal.time), [journal.time]);
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const formattedDate = diaryDate.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = diaryDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const hasImages = journal.images?.length > 0;
  const selectedImageUri = hasImages
    ? resolveImageUri(journal.images[selectedImageIndex] || journal.images[0])
    : "";

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        activeOpacity={hasImages ? 0.92 : 1}
        onPress={() => {
          if (!hasImages) return;
          navigation.navigate("ImageViewer", {
            images: journal.images,
            journalIds: journal.images.map(() => journal.id),
            initialIndex: selectedImageIndex,
          });
        }}
      >
        {hasImages ? (
          <Image source={{ uri: selectedImageUri }} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroFallback,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
              },
            ]}
          >
            {mood ? <MoodIcon url={mood.image} size={125} /> : null}
            <Text
              style={[styles.heroFallbackTitle, { color: colors.secondary }]}
            >
              {mood?.emotion_name || "Diary"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.metaSection}>
        {hasImages && mood ? (
          <View style={[styles.moodBadge]}>
            <MoodIcon url={mood.image} size={46} />
          </View>
        ) : null}
        <Text style={[styles.metaDate, { color: colors.secondary }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.metaTime, { color: colors.text.muted }]}>
          {formattedTime}
        </Text>
      </View>

      <View
        style={[
          styles.contentCard,
          {
            backgroundColor: colors.backgroundCard,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.contentText, { color: colors.text.dark }]}>
          {journal.description ||
            (language === "vi" ? "Chưa có nội dung." : "No content yet.")}
        </Text>
      </View>

      {hasImages ? (
        <View style={styles.gallerySection}>
          <Text style={[styles.galleryTitle, { color: colors.secondary }]}>
            {language === "vi" ? "Ảnh trong nhật ký" : "Diary Images"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {journal.images.map((imageUri, index) => {
              const isActive = index === selectedImageIndex;
              return (
                <TouchableOpacity
                  key={`${journal.id}-${index}`}
                  activeOpacity={0.9}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={{ uri: resolveImageUri(imageUri) }}
                    style={[
                      styles.thumbnail,
                      {
                        borderColor: isActive ? colors.primary : colors.border,
                        opacity: isActive ? 1 : 0.75,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

export default function DiaryDetailScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { colors, backgrounds } = useTheme();
  const { language } = useMood();
  const routeJournalIds: string[] = route.params?.journalIds || [];
  const routeInitialIndex = route.params?.initialIndex || 0;
  const [journals, setJournals] = React.useState<JournalEntry[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(routeInitialIndex);
  const flatListRef = React.useRef<FlatList<JournalEntry>>(null);
  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 });

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadJournals = async () => {
        const allJournals = await getJournals();
        const journalMap = new Map(
          allJournals.map((journal) => [journal.id, journal]),
        );
        const orderedJournals = routeJournalIds.length
          ? (routeJournalIds
              .map((journalId) => journalMap.get(journalId))
              .filter(Boolean) as JournalEntry[])
          : [...allJournals].sort(
              (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
            );

        if (!isActive) return;

        setJournals(orderedJournals);
        setCurrentIndex((prev: number) => {
          if (orderedJournals.length === 0) return 0;
          return Math.max(0, Math.min(prev, orderedJournals.length - 1));
        });
      };

      loadJournals();

      return () => {
        isActive = false;
      };
    }, [routeInitialIndex, routeJournalIds]),
  );

  React.useEffect(() => {
    if (!journals.length) return;
    const safeIndex = Math.min(currentIndex, journals.length - 1);
    flatListRef.current?.scrollToIndex({
      index: safeIndex,
      animated: false,
    });
  }, [currentIndex, journals]);

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken<JournalEntry>[] }) => {
      const firstVisible = viewableItems[0];
      if (typeof firstVisible?.index === "number") {
        setCurrentIndex(firstVisible.index);
      }
    },
  );

  if (!journals.length) {
    return (
      <ImageBackground
        source={backgrounds.detail}
        style={[styles.container, { backgroundColor: colors.background.main }]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={28} color={colors.text.dark} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.secondary }]}>
              {language === "vi" ? "Chi tiết nhật ký" : "Diary Detail"}
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <EmptyState
            title={language === "vi" ? "Không có nhật ký" : "No diary found"}
            description={
              language === "vi"
                ? "Nhật ký này không còn tồn tại hoặc đã bị xóa."
                : "This diary no longer exists or has been removed."
            }
            buttonText={language === "vi" ? "Quay lại" : "Go Back"}
            onPress={() => navigation.goBack()}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const safeIndex = Math.min(currentIndex, journals.length - 1);

  return (
    <ImageBackground
      source={backgrounds.detail}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={28} color={colors.text.dark} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.secondary }]}>
            {safeIndex + 1}/{journals.length}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditEntry", {
                journalId: journals[safeIndex]?.id,
              })
            }
          >
            <Pencil size={22} color={colors.text.dark} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={journals}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={safeIndex}
          keyExtractor={(item) => item.id}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => (
            <DiaryPage
              journal={item}
              navigation={navigation}
              onEdit={() =>
                navigation.navigate("EditEntry", {
                  journalId: item.id,
                })
              }
            />
          )}
        />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.s,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  page: {
    width,
  },
  pageContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: 80,
  },
  heroImage: {
    width: "100%",
    height: width - 40,
    borderRadius: SIZES.radius.xxxl,
  },
  heroFallback: {
    width: "100%",
    height: width - 40,
    borderRadius: SIZES.radius.xxxl,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SIZES.spacing.l,
  },
  heroFallbackTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  moodBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },
  metaSection: {
    marginTop: SIZES.spacing.l,
    marginBottom: SIZES.spacing.l,
    gap: 4,
  },
  metaDate: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    textTransform: "capitalize",
  },
  metaTime: {
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  contentCard: {
    borderRadius: SIZES.radius.medium,
    padding: SIZES.spacing.xl,
    borderWidth: 1,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacing.m,
    gap: SIZES.spacing.m,
  },
  contentTitle: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SIZES.radius.large,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  editButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  contentText: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    lineHeight: 28,
  },
  gallerySection: {
    marginTop: SIZES.spacing.xl,
  },
  galleryTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: SIZES.spacing.m,
  },
  thumbnailRow: {
    gap: SIZES.spacing.s,
    paddingRight: SIZES.spacing.xl,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: SIZES.radius.large,
    borderWidth: 2,
  },
  swipeHint: {
    marginTop: SIZES.spacing.xl,
    textAlign: "center",
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
});
