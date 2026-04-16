import React, { useRef } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Download, FileText, X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import AppNoticeModal from "../components/AppNoticeModal";
import { getFileNameFromUri, resolveImageUri } from "../lib/fileHelper";

const { width, height } = Dimensions.get("window");

export default function ImageViewerScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { colors } = useTheme();
  const images: string[] = route.params?.images || [];
  const journalIds: Array<string | null | undefined> =
    route.params?.journalIds || [];
  const initialIndex = route.params?.initialIndex || 0;
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [notice, setNotice] = React.useState<{
    title: string;
    message: string;
  } | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });
  const currentImage = resolveImageUri(images[currentIndex] || "");
  const currentJournalId = journalIds[currentIndex] || null;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
      const firstVisible = viewableItems[0];
      if (typeof firstVisible?.index === "number") {
        setCurrentIndex(firstVisible.index);
      }
    },
  );

  const handleOpenJournal = () => {
    if (!currentJournalId) {
      return;
    }

    navigation.navigate("EditEntry", {
      journalId: currentJournalId,
    });
  };

  const getImageMeta = (uri: string) => {
    const cleanUri = uri.split("?")[0];
    const rawName = getFileNameFromUri(cleanUri).replace(/\.[^.]+$/, "");
    const safeName =
      rawName.replace(/[^a-zA-Z0-9_-]/g, "_") || "dailymood_image";
    const extension = cleanUri.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "png":
        return { fileName: safeName, extension: "png" };
      case "webp":
        return { fileName: safeName, extension: "webp" };
      case "heic":
      case "heif":
        return { fileName: safeName, extension: "heic" };
      default:
        return { fileName: safeName, extension: "jpg" };
    }
  };

  const handleDownloadImage = async () => {
    if (!currentImage) {
      setNotice({
        title: "Thông báo",
        message: "Không tìm thấy ảnh để tải.",
      });
      return;
    }

    setIsDownloading(true);
    let tempUri: string | null = null;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        setNotice({
          title: "Cần quyền truy cập",
          message: "Hãy cấp quyền thư viện ảnh để lưu ảnh xuống thiết bị.",
        });
        return;
      }

      let sourceUri = currentImage;
      const { fileName, extension } = getImageMeta(sourceUri);

      if (sourceUri.startsWith("http://") || sourceUri.startsWith("https://")) {
        const tempFileName = `${fileName}_${Date.now()}.${extension}`;
        tempUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${tempFileName}`;
        const downloadResult = await FileSystem.downloadAsync(sourceUri, tempUri);
        sourceUri = downloadResult.uri;
      }

      const fileInfo = await FileSystem.getInfoAsync(sourceUri);
      if (!fileInfo.exists) {
        throw new Error("Image source not found.");
      }

      await MediaLibrary.saveToLibraryAsync(sourceUri);
      setNotice({
        title: "Thành công",
        message: "Ảnh đã được lưu vào thư viện ảnh.",
      });
    } catch (error) {
      console.error("Save image to library error:", error);
      setNotice({
        title: "Lỗi",
        message: "Không thể lưu ảnh vào thư viện.",
      });
    } finally {
      if (tempUri) {
        await FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(
          () => {},
        );
      }
      setIsDownloading(false);
    }
  };

  if (!images.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: "#fff" }}>Không có ảnh để hiển thị.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{images.length}
          </Text>
          <View style={styles.headerActions}>
            {currentJournalId ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleOpenJournal}
              >
                <FileText size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.iconButton, isDownloading && styles.iconButtonDisabled]}
              onPress={handleDownloadImage}
              disabled={isDownloading}
            >
              <Download size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          keyExtractor={(item, index) => `${item}-${index}`}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={{ uri: resolveImageUri(item) }} style={styles.image} />
            </View>
          )}
        />

        <Text style={[styles.hintText, { color: `${colors.text.white}CC` }]}>
          Vuốt ngang để xem ảnh khác
        </Text>
      </SafeAreaView>
      <AppNoticeModal
        visible={!!notice}
        title={notice?.title || ""}
        message={notice?.message || ""}
        onClose={() => setNotice(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.spacing.l,
    paddingTop: SIZES.spacing.s,
    paddingBottom: SIZES.spacing.m,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  counterText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  headerActions: {
    minWidth: 84,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SIZES.spacing.s,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  slide: {
    width,
    height: height - 160,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.l,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  hintText: {
    textAlign: "center",
    fontFamily: FONTS.regular,
    fontSize: 13,
    paddingBottom: SIZES.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
  },
});
