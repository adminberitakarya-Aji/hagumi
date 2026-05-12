import React, { useState, useCallback } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';

interface TouchFeedbackProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scaleOnPress?: number;
}

export const useTouchFeedback = (scaleOnPress: number = 0.95) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  const getScaleStyle = (): ViewStyle => ({
    transform: [{ scale: isPressed ? scaleOnPress : 1 }],
  });

  return {
    isPressed,
    handlePressIn,
    handlePressOut,
    getScaleStyle,
  };
};

export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  style,
  scaleOnPress = 0.95,
  onPress,
  ...props
}) => {
  const { handlePressIn, handlePressOut, getScaleStyle } = useTouchFeedback(scaleOnPress);

  return React.createElement(
    Pressable,
    {
      onPress: onPress,
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      style: [getScaleStyle(), style],
      ...props,
    },
    children
  );
};
