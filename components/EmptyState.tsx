import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useMood } from '../context/MoodContext';
import { FONTS } from '../constants/theme';

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
  showButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onPress,
  showButton = true,
}) => {
  const { colors } = useTheme();
  const { t } = useMood();

  const displayTitle = title || t('empty_title');
  const displayDesc = description || t('empty_desc');
  const displayButton = buttonText || t('empty_button');

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.dark }]}>{displayTitle}</Text>
      <Text style={[styles.description, { color: colors.text.dark }]}>{displayDesc}</Text>
      {showButton && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.text.textOnDark }]}>{displayButton}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginBottom: 100,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});

export default EmptyState;
