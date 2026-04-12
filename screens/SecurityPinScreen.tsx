import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Delete, Leaf } from 'lucide-react-native';
import { useSecurity } from '../context/SecurityContext';
import { useMood } from '../context/MoodContext';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SecurityPinScreen({ route, navigation, ...props }: any) {
  // Support both direct props (for startup lock) and route params (for setup)
  const mode = route?.params?.mode || props.mode || 'unlock';
  const onSuccess = route?.params?.onSuccess || props.onSuccess;
  const onCancel = route?.params?.onCancel || props.onCancel;
  const initialPin = route?.params?.initialPin || props.initialPin;

  const { unlock, setPinCode } = useSecurity();
  const { t } = useMood();
  const { colors, backgrounds } = useTheme();
  
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const shakeAnimation = new Animated.Value(0);

  const dots = [1, 2, 3, 4];

  const handlePress = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        setTimeout(() => handleFulfilled(newPin), 200);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(enteredPin.slice(0, -1));
    setErrorMsg('');
  };

  const handleFulfilled = async (finalPin: string) => {
    if (mode === 'unlock') {
      const success = unlock(finalPin);
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        shake();
        setEnteredPin('');
        setErrorMsg(t('pin_incorrect'));
        Vibration.vibrate();
      }
    } else if (mode === 'set') {
      if (onSuccess) onSuccess(finalPin);
      setEnteredPin('');
    } else if (mode === 'confirm') {
      if (finalPin === initialPin) {
        await setPinCode(finalPin);
        if (onSuccess) onSuccess();
      } else {
        shake();
        setEnteredPin('');
        setErrorMsg(t('pin_mismatch') || 'PIN mismatch');
        Vibration.vibrate();
      }
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const renderKey = (num: string) => (
    <TouchableOpacity 
      key={num} 
      style={styles.key} 
      onPress={() => handlePress(num)}
      activeOpacity={0.6}
    >
      <Text style={[styles.keyText, { color: colors.text.dark }]}>{num}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={backgrounds.home} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Lock size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text.dark }]}>{t('secure_garden')}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.text.dark }]}>
            {mode === 'confirm' ? t('confirm_pin') : mode === 'set' ? t('set_pin') : t('enter_pin')}
          </Text>

          <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnimation }] }]}>
            {dots.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { backgroundColor: i < enteredPin.length ? colors.primary : `${colors.primary}30` }
                ]} 
              />
            ))}
          </Animated.View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.keypad}>
            <View style={styles.row}>
              {['1', '2', '3'].map(renderKey)}
            </View>
            <View style={styles.row}>
              {['4', '5', '6'].map(renderKey)}
            </View>
            <View style={styles.row}>
              {['7', '8', '9'].map(renderKey)}
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.key} onPress={onCancel}>
                 <Text style={[styles.forgotText, { color: colors.primary }]}>{mode === 'unlock' ? t('forgot_pin') : t('cancel')}</Text>
              </TouchableOpacity>
              {renderKey('0')}
              <TouchableOpacity style={styles.key} onPress={handleDelete}>
                <Delete size={28} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Leaf size={24} color={`${colors.primary}80`} />
          <Text style={[styles.footerText, { color: colors.text.muted }]}>{t('privacy_footer')}</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#4A5D23',
    letterSpacing: -1,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    color: '#4A5D23',
    opacity: 0.7,
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#E57373',
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 20,
  },
  keypad: {
    width: '80%',
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF50',
  },
  keyText: {
    fontFamily: FONTS.regular,
    fontSize: 28,
  },
  forgotText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#8D6E63',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#4A5D23',
    opacity: 0.4,
    letterSpacing: 2,
  },
});
