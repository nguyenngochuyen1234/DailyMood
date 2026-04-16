import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import { ChevronLeft } from "lucide-react-native";
import { useMood } from "../context/MoodContext";
import MoodIcon from "../components/MoodIcon";
import { getJournals } from "../lib/storage";
import EmptyState from "../components/EmptyState";
import MonthSelector from "../components/MonthSelector";

const { width } = Dimensions.get("window");
const numColumns = 3;
const itemMargin = 2;
const itemWidth =
  (width - SIZES.spacing.xl * 2 - itemMargin * (numColumns * 2)) / numColumns;

interface GalleryItem {
  id: string; // Combination of journalId and imageIndex
  journalId: string;
  image: string;
  moodId: number | string;
  date: Date;
}

export default function GalleryScreen({ navigation }: { navigation: any }) {
  const { colors, backgrounds } = useTheme();
  const { emojis, loading: moodLoading, t } = useMood();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const allJournals = await getJournals();
      const items: GalleryItem[] = [];

      allJournals.forEach((journal) => {
        if (journal.images && journal.images.length > 0) {
          journal.images.forEach((img, index) => {
            items.push({
              id: `${journal.id}-${index}`,
              journalId: journal.id,
              image: img,
              moodId: journal.typeEmoji,
              date: new Date(journal.time),
            });
          });
        }
      });

      // Sort by date descending
      setGalleryItems(
        items.sort((a, b) => b.date.getTime() - a.date.getTime()),
      );
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchGalleryData();
    });
    fetchGalleryData();
    return unsubscribe;
  }, [navigation]);

  const filteredGalleryItems = useMemo(() => {
    return galleryItems.filter(
      (item) =>
        item.date.getMonth() === currentDate.getMonth() &&
        item.date.getFullYear() === currentDate.getFullYear(),
    );
  }, [currentDate, galleryItems]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleItemPress = (index: number) => {
    navigation.navigate("ImageViewer", {
      images: filteredGalleryItems.map((galleryItem) => galleryItem.image),
      journalIds: filteredGalleryItems.map((galleryItem) => galleryItem.journalId),
      initialIndex: index,
    });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: GalleryItem;
    index: number;
  }) => {
    const moodIdx = emojis.findIndex(
      (e) =>
        e.emotion_id === Number(item.moodId) || e.id === Number(item.moodId),
    );

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleItemPress(index)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        {moodIdx >= 0 ? (
          <View style={styles.overlayInfo}>
            <MoodIcon index={moodIdx} size={36} style={styles.miniMoodIcon} />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={backgrounds.home}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={colors.text.dark} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.secondary }]}>
            {t("images") || "Bộ sưu tập"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.monthSelectorContainer}>
          <MonthSelector
            currentDate={currentDate}
            onChangeMonth={changeMonth}
            showDay={false}
          />
        </View>

        {loading || moodLoading ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: colors.text.muted }}>Đang tải...</Text>
          </View>
        ) : filteredGalleryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Chưa có hình ảnh"
              description="Hãy viết nhật ký và kèm thêm hình ảnh để xây dựng bộ sưu tập của riêng bạn."
              onPress={() => navigation.navigate("Add")}
            />
          </View>
        ) : (
          <FlatList
            data={filteredGalleryItems}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
          />
        )}
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
    paddingVertical: SIZES.spacing.m,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  screenTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  monthSelectorContainer: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.m,
  },
  listContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: 100,
    paddingTop: SIZES.spacing.m,
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth, // Square
    margin: itemMargin,
    borderRadius: SIZES.radius.medium,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlayInfo: {
    position: "absolute",
    bottom: 4,
    right: 4,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  miniMoodIcon: {
    width: 36,
    height: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.xl,
    justifyContent: "center",
  },
});
