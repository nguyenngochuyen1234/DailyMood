import React from "react";
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
// import { MOOD_ICONS } from "../constants/moods"; // Không dùng nữa

const { width } = Dimensions.get("window");
// 3 columns layout
const numColumns = 3;
const itemMargin = 2;
const itemWidth = (width - SIZES.spacing.xl * 2 - itemMargin * (numColumns * 2)) / numColumns;

// MOCK_GALLERY sẽ được dùng bên trong component để lấy dữ liệu động

export default function GalleryScreen({ navigation }: { navigation: any }) {
  const { colors, backgrounds } = useTheme();
  const { emojis, loading } = useMood();

  const MOCK_GALLERY = React.useMemo(() => [
    { id: "1", date: "2 Jun", moodIdx: 0, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=60" },
    { id: "2", date: "7 Jun", moodIdx: 1, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=60" },
    { id: "3", date: "14 Jun", moodIdx: 4, image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=60" },
    { id: "4", date: "15 Jun", moodIdx: 3, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=60" },
    { id: "5", date: "20 Jun", moodIdx: 2, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=60" },
    { id: "6", date: "22 Jun", moodIdx: 0, image: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=500&q=60" },
    { id: "7", date: "25 Jun", moodIdx: 1, image: "https://images.unsplash.com/photo-1473496169904-658bba4f3d1e?w=500&q=60" },
    { id: "8", date: "28 Jun", moodIdx: 4, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=60" },
    { id: "9", date: "1 Jul", moodIdx: 0, image: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=500&q=60" },
    { id: "10", date: "3 Jul", moodIdx: 2, image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&q=60" },
  ], [emojis]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlayInfo}>
         <MoodIcon index={item.moodIdx} size={34} style={styles.miniMoodIcon} />
      </View>
    </TouchableOpacity>
  );

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
          <Text style={[styles.screenTitle, { color: colors.text.dark }]}>Bộ sưu tập</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={MOCK_GALLERY}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
        />
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
    padding: 1,
    justifyContent:"center",
    alignItems:"center",
  },
  miniMoodIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
});
