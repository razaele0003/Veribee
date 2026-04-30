import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type Props = {
  label?: string;
  height?: number;
};

export function MapCard({ label = 'Makati CBD', height = 176 }: Props) {
  return (
    <View style={[styles.map, { height }]}>
      <View style={styles.gridLayer}>
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.road, styles.roadThree]} />
        <View style={[styles.route, styles.routeOne]} />
        <View style={[styles.route, styles.routeTwo]} />
        <View style={styles.pinPrimary}>
          <MaterialIcons name="navigation" size={14} color={Colors.onTertiary} />
        </View>
        <View style={styles.pinDestination}>
          <MaterialIcons name="location-on" size={20} color={Colors.onPrimary} />
        </View>
      </View>
      <View style={styles.mapLabel}>
        <MaterialIcons name="my-location" size={15} color={Colors.primary} />
        <Text style={styles.mapLabelText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
    ...Shadow.card,
  },
  gridLayer: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
  },
  road: {
    position: 'absolute',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.full,
  },
  roadOne: {
    left: -20,
    right: -20,
    top: '32%',
    height: 16,
    transform: [{ rotate: '-12deg' }],
  },
  roadTwo: {
    left: '18%',
    top: -24,
    bottom: -24,
    width: 18,
    transform: [{ rotate: '18deg' }],
  },
  roadThree: {
    right: '12%',
    top: -24,
    bottom: -24,
    width: 14,
    transform: [{ rotate: '-22deg' }],
  },
  route: {
    position: 'absolute',
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
  },
  routeOne: {
    left: '18%',
    top: '58%',
    width: '40%',
    transform: [{ rotate: '-24deg' }],
  },
  routeTwo: {
    left: '52%',
    top: '38%',
    width: '32%',
    transform: [{ rotate: '-35deg' }],
  },
  pinPrimary: {
    position: 'absolute',
    left: '28%',
    top: '55%',
    width: 30,
    height: 30,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDestination: {
    position: 'absolute',
    right: '17%',
    top: '23%',
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: {
    position: 'absolute',
    left: Spacing.sm,
    bottom: Spacing.sm,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mapLabelText: {
    ...Type.labelCaps,
    fontFamily: Fonts.manropeBold,
    color: Colors.onSurface,
  },
});
