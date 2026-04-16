import {
  Baloo2_400Regular,
  Baloo2_700Bold,
  useFonts,
} from "@expo-google-fonts/baloo-2";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { BarChart2, Home, Plus, Puzzle, Settings } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "./components/EmptyState";
import MoodIcon from "./components/MoodIcon";
import MoodSelector from "./components/MoodSelector";
import PostCard from "./components/PostCard";
import RepresentativeMoodCard from "./components/RepresentativeMoodCard";
import SortSelector, { SortOrder } from "./components/SortSelector";
import { FONTS, SIZES } from "./constants/theme";
import { MoodProvider, useMood } from "./context/MoodContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { getJournals } from "./lib/storage";
import AddJournalScreen from "./screens/AddJournalScreen";
import AllMoodsScreen from "./screens/AllMoodsScreen";
import CreateJourneyScreen from "./screens/CreateJourneyScreen";
import DayDetailScreen from "./screens/DayDetailScreen";
import DiaryDetailScreen from "./screens/DiaryDetailScreen";
import FolderScreen from "./screens/FolderScreen";
import GalleryScreen from "./screens/GalleryScreen";
import ImageViewerScreen from "./screens/ImageViewerScreen";
import JourneyDetailScreen from "./screens/JourneyDetailScreen";
import MoodDetailScreen from "./screens/MoodDetailScreen";
import SettingScreen from "./screens/SettingScreen";
import StatsScreen from "./screens/StatsScreen";
import ThemeListScreen from "./screens/ThemeListScreen";

const { width } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Screens ---
// --- Screens ---
function FeedScreen({ navigation }: any) {
  const { colors, backgrounds } = useTheme();
  const { emojis, language, loading, t } = useMood();
  const [journalSections, setJournalSections] = useState<any[]>([]);
  const [allJournals, setAllJournals] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const today = React.useMemo(() => new Date(), []);
  const todayDateLabel = React.useMemo(() => {
    const locale = language === "vi" ? "vi-VN" : "en-US";
    return today.toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [language, today]);
  const sortedSections = React.useMemo(() => {
    return [...journalSections]
      .map((section) => ({
        ...section,
        data: [...section.data].sort((a: any, b: any) =>
          sortOrder === "newest"
            ? b.timestamp - a.timestamp
            : a.timestamp - b.timestamp,
        ),
      }))
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.sectionTimestamp - a.sectionTimestamp
          : a.sectionTimestamp - b.sectionTimestamp,
      );
  }, [journalSections, sortOrder]);
  const flatJournalIds = React.useMemo(
    () =>
      sortedSections.flatMap((section) =>
        section.data.map((item: any) => item.id),
      ),
    [sortedSections],
  );

  React.useEffect(() => {
    const fetchJournals = async () => {
      const dbJournals = await getJournals();
      setAllJournals(dbJournals);
      const grouped: { [key: string]: any[] } = {};

      dbJournals.forEach((j) => {
        const d = new Date(j.time);
        const dateStr = `${d.getDate()} ${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;

        if (!grouped[dateStr]) grouped[dateStr] = [];
        const emojiObj =
          emojis.find((e) => e.emotion_id === Number(j.typeEmoji)) ||
          emojis.find((e) => e.id === Number(j.typeEmoji));

        grouped[dateStr].push({
          id: j.id,
          time: d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          timestamp: d.getTime(),
          moodIcon: emojiObj ? { uri: emojiObj.image } : null,
          text: j.description,
          image: j.images?.length ? j.images[0] : null,
        });
      });

      const sections = Object.keys(grouped).map((k) => ({
        title: k,
        data: grouped[k],
        sectionTimestamp: Math.max(
          ...grouped[k].map((item: any) => item.timestamp),
        ),
      }));
      setJournalSections(sections);
    };

    const unsubscribe = navigation.addListener("focus", () => {
      if (emojis.length > 0) fetchJournals();
    });

    if (emojis.length > 0) fetchJournals();

    return unsubscribe;
  }, [navigation, emojis]);
  return (
    <ImageBackground
      source={backgrounds.home}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.journalListContent}
        >
          <View
            style={{
              paddingHorizontal: SIZES.spacing.xl,
              paddingTop: 20,
              marginBottom: 20,
            }}
          >
            <Text
              style={[
                styles.screenTitle,
                { color: colors.secondary, textAlign: "left" },
              ]}
            >
              {t("home_title")}
            </Text>
            <View style={styles.greetingContainer}>
              <MoodSelector
                emojis={emojis}
                loading={loading}
                selectedMoodId={null}
                onMoodChange={(moodId) =>
                  navigation.navigate("Add", { initialMoodId: moodId })
                }
                horizontal={false}
                containerStyle={{ paddingHorizontal: 0 }}
              />
            </View>
          </View>

          <View style={styles.todayHeading}>
            <Text
              style={[styles.todayHeadingTitle, { color: colors.secondary }]}
            >
              {language === "vi" ? "Nhật ký hôm nay" : "Today's Diary"}
            </Text>
            <Text
              style={[styles.todayHeadingDate, { color: colors.text.dark }]}
            >
              {todayDateLabel}
            </Text>
          </View>

          {allJournals.some((j) => {
            const jd = new Date(j.time);
            return (
              jd.getDate() === today.getDate() &&
              jd.getMonth() === today.getMonth() &&
              jd.getFullYear() === today.getFullYear()
            );
          }) && (
            <RepresentativeMoodCard
              date={new Date()}
              emojis={emojis}
              journals={allJournals.filter((j) => {
                const jd = new Date(j.time);
                const today = new Date();
                return (
                  jd.getDate() === today.getDate() &&
                  jd.getMonth() === today.getMonth() &&
                  jd.getFullYear() === today.getFullYear()
                );
              })}
              onPress={() => {
                const today = new Date();
                navigation.navigate("DayDetail", {
                  day: today.getDate(),
                  month: today.getMonth(),
                  year: today.getFullYear(),
                });
              }}
            />
          )}

          {sortedSections.length === 0 ? (
            <EmptyState onPress={() => navigation.navigate("Add")} />
          ) : (
            <>
              <View style={styles.sortContainer}>
                <SortSelector value={sortOrder} onValueChange={setSortOrder} />
              </View>
              {sortedSections.map((section, index) => (
                <View key={index}>
                  {/* <View
                  style={{
                    paddingHorizontal: SIZES.spacing.xl,
                    paddingVertical: SIZES.spacing.s,
                    marginTop: SIZES.spacing.s,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.bold,
                      fontSize: 16,
                      color: colors.text.dark,
                    }}
                  >
                    {section.title}
                  </Text>
                </View> */}
                  {section.data.map((item: any) => (
                    <View key={item.id} style={styles.journalItemContainer}>
                      <PostCard
                        item={item}
                        journalIds={flatJournalIds}
                        initialIndex={flatJournalIds.indexOf(item.id)}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  const { t } = useMood();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.bottomTabBar,
          { backgroundColor: colors.background.tabBar },
        ],
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: { fontFamily: FONTS.regular, fontSize: 12 },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          if (route.name === "Home")
            return React.createElement(Home as any, { size, color });
          if (route.name === "Stats")
            return React.createElement(BarChart2 as any, { size, color });
          if (route.name === "Add")
            return (
              <View
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    borderColor: colors.background.white,
                  },
                ]}
              >
                {React.createElement(Plus as any, {
                  size: 32,
                  color: colors.text.textOnDark,
                })}
              </View>
            );
          if (route.name === "Journeys")
            return React.createElement(Puzzle as any, { size, color });
          if (route.name === "Setting")
            return React.createElement(Settings as any, { size, color });
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{ tabBarLabel: t("home") }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarLabel: t("stats") }}
      />
      <Tab.Screen
        name="Add"
        component={AddJournalScreen}
        options={{
          tabBarLabel: () => null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="Journeys"
        component={FolderScreen}
        options={{ tabBarLabel: t("journeys") }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{ tabBarLabel: t("settings") }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddJournal" component={AddJournalScreen} />
      <Stack.Screen name="EditEntry" component={AddJournalScreen} />
      <Stack.Screen name="CreateJourney" component={CreateJourneyScreen} />
      <Stack.Screen name="JourneyDetail" component={JourneyDetailScreen} />
      <Stack.Screen name="MoodDetail" component={MoodDetailScreen} />
      <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <Stack.Screen name="ThemeList" component={ThemeListScreen} />
      <Stack.Screen name="AllMoods" component={AllMoodsScreen} />
      <Stack.Screen name="SecurityPin" component={SecurityPinScreen} />
    </Stack.Navigator>
  );
}

import { SecurityProvider, useSecurity } from "./context/SecurityContext";
import SecurityPinScreen from "./screens/SecurityPinScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MoodProvider>
          <SecurityProvider>
            <AppContent />
          </SecurityProvider>
        </MoodProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { colors } = useTheme();
  const { isLocked } = useSecurity();

  let [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background.main },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLocked) {
    return <SecurityPinScreen mode="unlock" />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
  },
  journalListContent: {
    paddingBottom: 100,
  },
  journalItemContainer: {
    paddingHorizontal: SIZES.spacing.xl,
  },
  sortContainer: {
    paddingHorizontal: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.s,
  },
  todayHeading: {
    paddingHorizontal: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.m,
  },
  todayHeadingTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    marginBottom: 4,
  },
  todayHeadingDate: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    opacity: 0.8,
    textTransform: "capitalize",
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderRadius: SIZES.radius.xxl,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: SIZES.radius.xl,
  },
  activeTab: {},
  tabText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  activeTabText: {},
  feedList: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bottomTabBar: {
    height: 90,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: SIZES.radius.xxxl,
    borderTopRightRadius: SIZES.radius.xxxl,
    position: "absolute",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 20,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 4,
  },
  greetingContainer: {
    marginBottom: SIZES.spacing.l,
    alignItems: "center",
  },
  greetingQuote: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: SIZES.spacing.xs,
  },
  greetingQuestion: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: SIZES.spacing.m,
  },
  moodIconsRow: {
    flexDirection: "row",
    width: "100%",
  },
  moodIconButton: {
    width: 48,
    height: 48,
  },
  moodIconLarge: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
