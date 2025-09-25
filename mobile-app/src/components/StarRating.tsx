import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  icon: string;
  color: string;
  min?: number;
  max?: number;
}

interface MultiRatingProps {
  ratings: {
    selection: number;
    friendliness: number;
    creativity: number;
  };
  onRatingsChange: (ratings: {
    selection: number;
    friendliness: number;
    creativity: number;
  }) => void;
}

const RatingSlider: React.FC<RatingSliderProps> = ({
  label,
  value,
  onValueChange,
  icon,
  color,
  min = 1,
  max = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderWidth = Dimensions.get('window').width - 64; // Account for padding

  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    const newValue = Math.round(min + percentage * (max - min));
    onValueChange(Math.max(min, Math.min(max, newValue)));
  };

  const getEmoji = (val: number) => {
    if (val <= 2) return '😞';
    if (val <= 4) return '😐';
    if (val <= 6) return '🙂';
    if (val <= 8) return '😊';
    return '🤩';
  };

  const percentage = (value - min) / (max - min);

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <View style={styles.labelContainer}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={[styles.sliderLabel, { color }]}>{label}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.emoji}>{getEmoji(value)}</Text>
          <Text style={[styles.valueText, { color }]}>{value}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.sliderTrack}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={[styles.sliderFill, { width: percentage * sliderWidth, backgroundColor: color }]} />
        <View style={[styles.sliderThumb, { left: percentage * sliderWidth - 12, backgroundColor: color }]}>
          <View style={styles.thumbInner} />
        </View>
      </TouchableOpacity>

      <View style={styles.sliderLabels}>
        <Text style={styles.minLabel}>{min}</Text>
        <Text style={styles.maxLabel}>{max}</Text>
      </View>
    </View>
  );
};

const MultiRatingSliders: React.FC<MultiRatingProps> = ({
  ratings,
  onRatingsChange,
}) => {
  const updateRating = (key: keyof typeof ratings, value: number) => {
    onRatingsChange({
      ...ratings,
      [key]: value,
    });
  };

  const getAverageRating = () => {
    const values = Object.values(ratings);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bedøm boden</Text>

      <RatingSlider
        label="Udbud & Kvalitet"
        value={ratings.selection}
        onValueChange={(value) => updateRating('selection', value)}
        icon="storefront"
        color="#4CAF50"
      />

      <RatingSlider
        label="Venlighed & Service"
        value={ratings.friendliness}
        onValueChange={(value) => updateRating('friendliness', value)}
        icon="heart"
        color="#FF9800"
      />

      <RatingSlider
        label="Kreativitet & Unikhed"
        value={ratings.creativity}
        onValueChange={(value) => updateRating('creativity', value)}
        icon="color-palette"
        color="#9C27B0"
      />

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Samlet bedømmelse</Text>
        <View style={styles.averageContainer}>
          <Text style={styles.averageEmoji}>
            {getAverageRating() >= 7 ? '🌟' : getAverageRating() >= 5 ? '👍' : '👎'}
          </Text>
          <Text style={styles.averageText}>
            {getAverageRating().toFixed(1)} / 10
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 18,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minLabel: {
    fontSize: 12,
    color: '#666',
  },
  maxLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageEmoji: {
    fontSize: 24,
  },
  averageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MultiRatingSliders;