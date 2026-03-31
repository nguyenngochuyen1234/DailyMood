import React, { useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Dimensions, ImageBackground, 
  ActivityIndicator, FlatList,
  SectionList
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts, Baloo2_400Regular, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { 
  Heart, Smile, Frown, Sun,
  Home, BarChart2, Plus, Puzzle, Settings
} from 'lucide-react-native';

import PostCard from './components/PostCard';
import AddJournalScreen, { MOOD_ICONS } from './screens/AddJournalScreen';
import StatsScreen from './screens/StatsScreen';
import FolderScreen from './screens/FolderScreen';
import SettingScreen from './screens/SettingScreen';
import MonthSelector from './components/MonthSelector';
import { COLORS } from './constants/colors';
import { FONTS, SIZES } from './constants/theme';
import { BACKGROUNDS } from './constants/images';
import CreateJourneyScreen from './screens/CreateJourneyScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Mock Data ---
const MY_FEED = [
  {
    id: '1',
    text: 'Hôm nay trời đẹp quá, mình cảm thấy rất nhẹ lòng.',
    image: null,
    emoji: React.createElement(Smile as any, { size: 24, color: COLORS.moods[1] }),
    time: '1 giờ trước',
  },
  {
    id: '2',
    text: 'Đã hoàn thành xong công việc đúng hạn!',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60',
    emoji: React.createElement(Sun as any, { size: 24, color: COLORS.moods[0] }),
    time: '5 giờ trước',
  },
];
// --- Screens ---
function FeedScreen() {
  const journalSections = useMemo(() => [
    {
      title: '30 March 2026',
      data: [
        { id: '1', time: '10:30 AM', moodIcon: MOOD_ICONS[0], text: 'Hôm nay trời rất đẹp, mình cảm thấy rất vui!', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60' },
        { id: '2', time: '02:15 PM', moodIcon: MOOD_ICONS[1], text: 'Vừa đi uống cà phê với bạn bè.', image: null },
      ],
    },
    {
      title: '29 March 2026',
      data: [
        { id: '3', time: '09:00 AM', moodIcon: MOOD_ICONS[2], text: 'Một ngày bình thường tại văn phòng.', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60' },
      ],
    },
    {
      title: '28 March 2026',
      data: [
        { id: '4', time: '08:45 PM', moodIcon: MOOD_ICONS[4], text: 'Hôm nay bận rộn quá, hơi cáu một chút.', image: null },
      ],
    },
  ], []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 1, // Nhạy hơn, kích hoạt ngay khi thấy 1% phần tử
  }).current;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentViewTime, setCurrentViewTime] = useState<string | null>(null);
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0 ) {
      const firstItem = viewableItems[0];
      if (firstItem.section && firstItem.section.title) {
        // Parse section title "30 March 2026"
        const parsedDate = new Date(firstItem.section.title);
        if (!isNaN(parsedDate.getTime())) {
          setCurrentDate(parsedDate);
          setCurrentViewTime(firstItem.item.time);
        }
      }
    }
  }).current;
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  return (
    <ImageBackground 
      source={BACKGROUNDS.home} 
      style={styles.container}
    >
      <View style={styles.safeArea}>
        <Text style={styles.screenTitle}>Bình yên hôm nay</Text>
        
        <MonthSelector 
          currentDate={currentDate}
          activeTab="Friends" // Fixed for now as home is the journal feed
          currentViewTime={currentViewTime}
          onChangeMonth={changeMonth}
        />

           <SectionList
             sections={journalSections}
             keyExtractor={(item) => item.id}
             renderItem={({ item }) => (
               <View style={styles.journalItemContainer}>
                 <PostCard item={item} />
               </View>
             )}
             stickySectionHeadersEnabled={true}
             onViewableItemsChanged={onViewableItemsChanged}
             viewabilityConfig={viewabilityConfig}
             contentContainerStyle={styles.journalListContent}
             showsVerticalScrollIndicator={false}
           />
      </View>
    </ImageBackground>
  );
}

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={{ fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary }}>
        {name} coming soon...
      </Text>
    </View>
  );
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: styles.bottomTabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarLabelStyle: { fontFamily: FONTS.regular, fontSize: 12 },
        tabBarIcon: ({ color, size }: { color: string, size: number }) => {
          if (route.name === 'Home') return React.createElement(Home as any, { size, color });
          if (route.name === 'Stats') return React.createElement(BarChart2 as any, { size, color });
          if (route.name === 'Add') return (
            <View style={styles.addButton}>
              {React.createElement(Plus as any, { size: 32, color: COLORS.text.white })}
            </View>
          );
          if (route.name === 'Journeys') return React.createElement(Puzzle as any, { size, color });
          if (route.name === 'Setting') return React.createElement(Settings as any, { size, color });
        },
      })}
    >
      <Tab.Screen name="Home" component={FeedScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: 'Thống kê' }} />
      <Tab.Screen 
        name="Add" 
        component={AddJournalScreen} 
        options={{ 
          tabBarLabel: () => null,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Tab.Screen name="Journeys" component={FolderScreen} options={{ tabBarLabel: 'Hành trình' }} />
      <Tab.Screen name="Setting" options={{ tabBarLabel: 'Cài đặt' }}>
        {() => <SettingScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthStack({ onLogin }: { onLogin: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onRegister={onLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function RootStack({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <MainTabs onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="CreateJourney" 
        component={CreateJourneyScreen} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  let [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isAuthenticated ? (
        <RootStack onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AuthStack onLogin={() => setIsAuthenticated(true)} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f8e8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f1f8e8",
  },
  safeArea: {
    flex: 1,
    paddingTop: 60,
  },  journalListContent: {
    paddingBottom: 100,
  },
  journalItemContainer: {
    paddingHorizontal: SIZES.spacing.xl,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text.dark,
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xxl,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radius.xl,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.primary,
  },
  activeTabText: {
    color: COLORS.text.white,
  },
  feedList: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bottomTabBar: {
    height: 90,
    backgroundColor: "#f1f8e8",
    borderTopWidth: 0,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: SIZES.radius.xxxl,
    borderTopRightRadius: SIZES.radius.xxxl,
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 20,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.background.white,
  },
});
