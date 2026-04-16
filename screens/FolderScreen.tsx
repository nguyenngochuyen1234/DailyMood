import { ArrowRight, Compass } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { getJournals, getJourneys } from "../lib/storage";
import { Journey } from "../types/models";
import CreateJourneyScreen from "./CreateJourneyScreen";

const { width } = Dimensions.get("window");

export default function FolderScreen({ navigation }: { navigation: any }) {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [journeys, setJourneys] = React.useState<Journey[]>([]);
  const { colors, backgrounds } = useTheme();

  const fetchData = React.useCallback(async () => {
    const jData = await getJourneys();
    const allJournals = await getJournals();

    const counts: { [key: string]: number } = {};
    const lastImages: { [key: string]: string | null } = {};

    allJournals
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .forEach((j) => {
        if (j.journeyId) {
          counts[j.journeyId] = (counts[j.journeyId] || 0) + 1;
          if (!lastImages[j.journeyId] && j.images && j.images.length > 0) {
            lastImages[j.journeyId] = j.images[0];
          }
        }
      });

    setJourneys(
      jData.map((j) => ({
        ...j,
        postCount: counts[j.id] || 0,
        lastImage: lastImages[j.id] || null,
      })),
    );
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchData);
    fetchData(); // Initial load
    return unsubscribe;
  }, [navigation, fetchData]);

  return (
    <ImageBackground
      source={backgrounds.journeys}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.secondary }]}>
              Hành trình
            </Text>
          </View>

          <View
            style={[
              styles.bannerOverlay,
              {
                backgroundColor: colors.backgroundCard,
                marginBottom: SIZES.spacing.xl,
              },
            ]}
          >
            <Text style={[styles.bannerTitle, { color: colors.text.dark }]}>
              Khám phá bản thân qua từng trang nhật ký
            </Text>
            <Text style={[styles.bannerSubtitle, { color: colors.text.dark }]}>
              Lưu giữ những bước tiến nhỏ mỗi ngày để thấy hành trình của bạn
              rạng rỡ như thế nào.
            </Text>
          </View>

          {journeys.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.journeyCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.border,
                  shadowColor: colors.border,
                },
              ]}
              onPress={() =>
                navigation.navigate("JourneyDetail", { journey: item })
              }
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: `${colors.primary}20`,
                      borderRadius: 30,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {item.postCount} BÀI VIẾT
                  </Text>
                </View>
                <Compass size={20} color={colors.text.muted} />
              </View>

              <View style={styles.cardMain}>
                <View style={styles.textColumn}>
                  <Text
                    style={[styles.journeyTitle, { color: colors.text.dark }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.journeyDesc, { color: colors.text.dark }]}
                    numberOfLines={2}
                  >
                    {item.description ||
                      "Hãy tiếp tục viết nên hành trình tuyệt vời của bạn."}
                  </Text>
                  <View style={styles.ctaButton}>
                    <Text style={[styles.ctaText, { color: colors.primary }]}>
                      Tiếp tục viết
                    </Text>
                    {React.createElement(ArrowRight as any, {
                      size: 16,
                      color: colors.primary,
                      style: { marginLeft: 6 },
                    })}
                  </View>
                </View>

                {item.lastImage && (
                  <Image
                    source={{ uri: item.lastImage }}
                    style={[styles.lastPhoto, { borderColor: colors.border }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.bottomActionButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => setShowCreateModal(true)}
          >
            {React.createElement(Compass as any, {
              size: 20,
              color: colors.text.textOnDark,
              style: { marginRight: 8 },
            })}
            <Text
              style={[
                styles.bottomActionText,
                { color: colors.text.textOnDark },
              ]}
            >
              Bắt đầu Hành trình mới
            </Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>

        <Modal
          visible={showCreateModal}
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <CreateJourneyScreen
            navigation={{ goBack: () => setShowCreateModal(false) }}
            onClose={async () => {
              setShowCreateModal(false);
              await fetchData();
            }}
          />
        </Modal>
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
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.l,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacing.l,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  banner: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
    minHeight: 160,
    overflow: "hidden",
    justifyContent: "center",
  },
  bannerOverlay: {
    padding: SIZES.spacing.xl,
    flex: 1,
    justifyContent: "center",
    borderRadius: SIZES.radius.xxl,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    marginBottom: SIZES.spacing.m,
    maxWidth: "85%",
  },
  bannerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  journeyCard: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.l,
    marginBottom: SIZES.spacing.l,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.spacing.m,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  cardMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textColumn: {
    flex: 1,
    paddingRight: SIZES.spacing.m,
  },
  journeyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: SIZES.spacing.xs,
  },
  journeyDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: SIZES.spacing.m,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  lastPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
  },
  bottomActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: SIZES.spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bottomActionText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
