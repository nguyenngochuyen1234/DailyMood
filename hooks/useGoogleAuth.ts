import * as React from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cấu hình thư viện - gọi một lần khi module được load
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
});

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Kiểm tra token đã lưu khi khởi động
  React.useEffect(() => {
    checkLocalToken();
  }, []);

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const tokens = await GoogleSignin.getTokens();
      const token = tokens?.accessToken || null;
      if (token) {
        setAccessToken(token);
        await AsyncStorage.setItem("@google_token", token);
      }
      return token;
    } catch (error) {
      console.error("Google token refresh error:", error);
      return null;
    }
  };

  const checkLocalToken = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signedInUser: any = await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const token = tokens?.accessToken || null;

      const signedUser =
        signedInUser?.user || signedInUser?.data?.user || signedInUser;
      const user = signedUser
        ? {
            name: signedUser.name,
            email: signedUser.email,
            picture: signedUser.photo,
            id: signedUser.id,
          }
        : null;

      if (token) {
        setAccessToken(token);
        await AsyncStorage.setItem("@google_token", token);
      }
      if (user) {
        setUserInfo(user);
        await AsyncStorage.setItem("@google_user", JSON.stringify(user));
      }

      if (!token || !user) {
        const storedToken = await AsyncStorage.getItem("@google_token");
        const storedUser = await AsyncStorage.getItem("@google_user");
        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUserInfo(JSON.parse(storedUser));
        }
      }
    } catch (e) {
      try {
        const storedToken = await AsyncStorage.getItem("@google_token");
        const storedUser = await AsyncStorage.getItem("@google_user");
        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUserInfo(JSON.parse(storedUser));
        }
      } catch {
        // Skipped logging
      }
    }
  };

  // Hàm đăng nhập bằng Native Google Sign-In popup
  const promptAsync = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!response.data) {
        throw new Error("Sign in failed - no data returned");
      }

      // Lấy access token riêng để gọi Drive API
      const tokens = await GoogleSignin.getTokens();
      const token = tokens.accessToken;

      const user = {
        name: response.data.user.name,
        email: response.data.user.email,
        picture: response.data.user.photo,
        id: response.data.user.id,
      };

      setUserInfo(user);
      setAccessToken(token);

      await AsyncStorage.setItem("@google_token", token);
      await AsyncStorage.setItem("@google_user", JSON.stringify(user));
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Skipped logging
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Skipped logging
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Skipped logging
      } else {
        console.error("Google Sign-In error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Skipped logging
    }
    setUserInfo(null);
    setAccessToken(null);
    await AsyncStorage.removeItem("@google_token");
    await AsyncStorage.removeItem("@google_user");
  };

  return {
    userInfo,
    accessToken,
    promptAsync,
    request: null,
    logout,
    loading,
    refreshAccessToken,
  };
}
