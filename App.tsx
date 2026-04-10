import React, { useMemo, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  FlatList,
  SectionList,
  Image,
  ScrollView,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  Baloo2_400Regular,
  Baloo2_700Bold,
} from "@expo-google-fonts/baloo-2";
import {
  Heart,
  Smile,
  Frown,
  Sun,
  Home,
  BarChart2,
  Plus,
  Puzzle,
  Settings,
} from "lucide-react-native";

import PostCard from "./components/PostCard";
import EmptyState from "./components/EmptyState";
import AddJournalScreen from "./screens/AddJournalScreen";
import StatsScreen from "./screens/StatsScreen";
import FolderScreen from "./screens/FolderScreen";
import SettingScreen from "./screens/SettingScreen";
import MonthSelector from "./components/MonthSelector";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { FONTS, SIZES } from "./constants/theme";
import MoodIcon from "./components/MoodIcon";
import CreateJourneyScreen from "./screens/CreateJourneyScreen";
import { getJournals } from "./lib/storage";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JourneyDetailScreen from "./screens/JourneyDetailScreen";
import SortSelector, { SortOrder } from "./components/SortSelector";
import { SafeAreaView } from "react-native-safe-area-context";
import MoodDetailScreen from "./screens/MoodDetailScreen";
import GalleryScreen from "./screens/GalleryScreen";
import ThemeListScreen from "./screens/ThemeListScreen";
import AllMoodsScreen from "./screens/AllMoodsScreen";
import { MoodProvider, useMood } from "./context/MoodContext";

const { width } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// --- Screens ---
// --- Screens ---
function FeedScreen({ navigation }: any) {
  const { colors, backgrounds } = useTheme();
  const { emojis, loading, t } = useMood();
  const [journalSections, setJournalSections] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchJournals = async () => {
      const dbJournals = await getJournals();
      const grouped: { [key: string]: any[] } = {};
      
      dbJournals.forEach(j => {
        const d = new Date(j.time);
        const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
        
        if (!grouped[dateStr]) grouped[dateStr] = [];
        const emojiObj = emojis.find(e => e.id === j.typeEmoji);
        
        grouped[dateStr].push({
          id: j.id,
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          moodIcon: emojiObj ? { uri: emojiObj.image } : null,
          text: j.description || j.title,
          image: j.images?.length ? j.images[0] : null,
        });
      });
      
      const sections = Object.keys(grouped).map(k => ({
        title: k,
        data: grouped[k]
      }));
      setJournalSections(sections);
    };

    const unsubscribe = navigation.addListener('focus', () => {
      if (emojis.length > 0) fetchJournals();
    });
    
    if (emojis.length > 0) fetchJournals();
    
    return unsubscribe;
  }, [navigation, emojis]);

  return (
    <ImageBackground source={backgrounds.home} style={[styles.container, { backgroundColor: colors.background.main }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.journalListContent}>
          <View style={{ paddingHorizontal: SIZES.spacing.xl, paddingTop: 20, marginBottom: 20 }}>
            <Text style={[styles.screenTitle, { color: colors.text.dark, textAlign: 'left' }]}>{t('home_title')}</Text>
      <View style={styles.greetingContainer}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15 }}>
               {loading ? (
                 <ActivityIndicator color={colors.primary} />
               ) : (
                 emojis.map((emoji) => (
                   <TouchableOpacity 
                    key={emoji.id} 
                    style={styles.moodIconButton}
                    onPress={() => navigation.navigate("Add")}
                   >
                     <MoodIcon url={emoji.image} size={48} />
                   </TouchableOpacity>
                 ))
               )}
             </ScrollView>
          </View>
          </View>

          

          {journalSections.length === 0 ? (
            <EmptyState 
              onPress={() => navigation.navigate("Add")} 
            />
          ) : (
            journalSections.map((section, index) => (
              <View key={index}>
                <View style={{ paddingHorizontal: SIZES.spacing.xl, paddingVertical: SIZES.spacing.s, marginTop: SIZES.spacing.s }}>
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 16, color: colors.text.dark }}>{section.title}</Text>
                </View>
                {section.data.map((item: any) => (
                  <View key={item.id} style={styles.journalItemContainer}>
                    <PostCard item={item} />
                  </View>
                ))}
              </View>
            ))
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
        tabBarStyle: [styles.bottomTabBar, { backgroundColor: colors.background.tabBar }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: { fontFamily: FONTS.regular, fontSize: 12 },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          if (route.name === "Home")
            return React.createElement(Home as any, { size, color });
          if (route.name === "Stats")
            return React.createElement(BarChart2 as any, { size, color });
          if (route.name === "Add")
            return (
              <View style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.primary, borderColor: colors.background.white }]}>
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
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarLabel: t('stats') }}
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
        options={{ tabBarLabel: t('journeys') }}
      />
      <Tab.Screen 
        name="Setting" 
        component={SettingScreen} 
        options={{ tabBarLabel: t('settings') }} 
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="EditEntry" component={AddJournalScreen} />
      <Stack.Screen name="CreateJourney" component={CreateJourneyScreen} />
      <Stack.Screen name="JourneyDetail" component={JourneyDetailScreen} />
      <Stack.Screen name="MoodDetail" component={MoodDetailScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="ThemeList" component={ThemeListScreen} />
      <Stack.Screen name="AllMoods" component={AllMoodsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MoodProvider>
        <AppContent />
      </MoodProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors } = useTheme();
  let [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.main }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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
  activeTab: {
  },
  tabText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  activeTabText: {
  },
  feedList: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bottomTabBar: {
    height: 90,
    borderTopWidth: 0,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: SIZES.radius.xxxl,
    borderTopRightRadius: SIZES.radius.xxxl,
    position: "absolute",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
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
  sortContainer: {
    paddingHorizontal: SIZES.spacing.xl,
    marginTop: -SIZES.spacing.xs,
  },
  greetingContainer: {
    paddingHorizontal: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.l,
    alignItems: 'center',
  },
  greetingQuote: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  greetingQuestion: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SIZES.spacing.m,
  },
  moodIconsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  moodIconButton: {
    width: 48,
    height: 48,
  },
  moodIconLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
