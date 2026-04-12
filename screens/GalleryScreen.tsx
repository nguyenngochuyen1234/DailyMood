import React, { useState, useEffect } from "react";
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
      setGalleryItems(items.sort((a, b) => b.date.getTime() - a.date.getTime()));
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

  const handleItemPress = (item: GalleryItem) => {
    navigation.navigate("MoodDetail", { moodId: item.moodId });
    // Or navigate to DayDetail if preferred. User plan said DayDetail.
    // Let's use DayDetail as per plan.
    const d = item.date;
    navigation.navigate("MainTabs", {
      screen: "Stats", // DayDetail is usually reached via Stats or specific date
    });
    // Wait, let's navigate to DayDetailScreen directly since it's in RootStack.
    navigation.navigate("DayDetail", {
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  };

  const renderItem = ({ item }: { item: GalleryItem }) => {
    const moodIdx = emojis.findIndex((e) => e.id === item.moodId);

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleItemPress(item)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.overlayInfo}>
          <MoodIcon index={moodIdx} size={20} style={styles.miniMoodIcon} />
        </View>
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
          <Text style={[styles.screenTitle, { color: colors.text.dark }]}>
            {t("images") || "Bộ sưu tập"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading || moodLoading ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: colors.text.muted }}>Đang tải...</Text>
          </View>
        ) : galleryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Chưa có hình ảnh"
              description="Hãy viết nhật ký và kèm thêm hình ảnh để xây dựng bộ sưu tập của riêng bạn."
              onPress={() => navigation.navigate("Add")}
            />
          </View>
        ) : (
          <FlatList
            data={galleryItems}
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
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  miniMoodIcon: {
    width: 20,
    height: 20,
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
