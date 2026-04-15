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
import { X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";

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
  const initialIndex = route.params?.initialIndex || 0;
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
      const firstVisible = viewableItems[0];
      if (typeof firstVisible?.index === "number") {
        setCurrentIndex(firstVisible.index);
      }
    },
  );

  if (!images.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: "#fff" }}>Khong co anh de hien thi.</Text>
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
          <View style={styles.headerSpacer} />
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
              <Image source={{ uri: item }} style={styles.image} />
            </View>
          )}
        />

        <Text style={[styles.hintText, { color: `${colors.text.white}CC` }]}>
          Vuot ngang de xem anh khac
        </Text>
      </SafeAreaView>
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
  headerSpacer: {
    width: 42,
    height: 42,
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
