import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, Text as SvgText } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';

interface AskWorldLogoProps {
  size?: number;
  showText?: boolean;
}

export const AskWorldLogo: React.FC<AskWorldLogoProps> = ({ size = 200, showText = true }) => {
  const iconSize = showText ? size * 0.7 : size;
  const textSize = size * 0.2;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0066FF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00FFCC" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Globe Circle */}
        <Circle
          cx="85"
          cy="85"
          r="50"
          stroke="url(#blueGradient)"
          strokeWidth="3"
          fill="none"
        />
        
        {/* North America */}
        <Path
          d="M 50 50 Q 45 45, 55 40 L 60 38 L 65 42 L 62 48 L 58 52 Z"
          stroke="url(#blueGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* South America */}
        <Path
          d="M 60 80 Q 55 85, 58 95 L 62 105 L 68 108 L 70 100 L 65 85 Z"
          stroke="url(#blueGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Africa */}
        <Path
          d="M 85 65 Q 90 70, 88 80 L 90 95 L 95 105 L 100 102 L 98 88 L 100 75 L 95 68 Z"
          stroke="url(#blueGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Europe */}
        <Path
          d="M 85 50 L 90 48 L 95 50 L 98 55 L 95 60 L 90 58 Z"
          stroke="url(#blueGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Asia */}
        <Path
          d="M 100 45 Q 110 48, 115 55 L 120 65 L 118 75 L 115 82 L 108 78 L 105 68 L 102 58 Z"
          stroke="url(#blueGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Speech Bubble Circle */}
        <Circle
          cx="130"
          cy="45"
          r="25"
          stroke="url(#blueGradient)"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Speech Bubble Tail */}
        <Path
          d="M 115 60 L 110 70 L 120 65 Z"
          stroke="url(#blueGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        
        {/* Question Mark */}
        <Path
          d="M 125 32 Q 135 28, 138 35 Q 140 40, 135 43 Q 130 46, 130 50"
          stroke="url(#blueGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx="130"
          cy="56"
          r="2.5"
          fill="url(#blueGradient)"
        />
        
        {/* Text "AskWorld" */}
        {showText && (
          <SvgText
            x="100"
            y="170"
            fontSize="32"
            fontWeight="600"
            fill="#1e3a5f"
            textAnchor="middle"
            fontFamily="System"
          >
            AskWorld
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
