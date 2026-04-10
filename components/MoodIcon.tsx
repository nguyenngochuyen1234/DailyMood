import React from 'react';
import { Image, ImageStyle, StyleProp, View, ActivityIndicator } from 'react-native';
import { useMood } from '../context/MoodContext';

interface MoodIconProps {
  emotionId?: number;
  index?: number;
  url?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const MoodIcon: React.FC<MoodIconProps> = ({ 
  emotionId, 
  index, 
  url, 
  size = 48, 
  style 
}) => {
  const { getEmojiByEmotionId, getEmojiByIndex, loading } = useMood();

  let finalUrl = url;

  if (!finalUrl) {
    if (emotionId !== undefined) {
      finalUrl = getEmojiByEmotionId(emotionId)?.image;
    } else if (index !== undefined) {
      finalUrl = getEmojiByIndex(index)?.image;
    }
  }

  if (loading && !finalUrl) {
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!finalUrl) return <View style={[{ width: size, height: size }, style]} />;

  return (
    <Image 
      source={{ uri: finalUrl }} 
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]} 
    />
  );
};

export default MoodIcon;
