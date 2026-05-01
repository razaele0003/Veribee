import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';
import type { Coordinate, RouteSummary } from '@/lib/maps';

type Props = {
  label?: string;
  height?: number;
  origin?: Coordinate;
  destination?: Coordinate;
  current?: Coordinate;
  routeSummary?: RouteSummary | null;
  isLive?: boolean;
  onOpenMaps?: () => void;
};

export function MapCard({
  label = 'Makati CBD',
  height = 176,
  origin,
  destination,
  current,
  routeSummary,
  isLive,
  onOpenMaps,
}: Props) {
  const originLabel = current?.label ?? origin?.label ?? 'Rider';
  const destinationLabel = destination?.label ?? 'Destination';

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
      
      <View style={styles.topLabel}>
        <View style={[styles.pulseDot, isLive && styles.pulseDotLive]} />
        <Text style={styles.topLabelText}>{label}</Text>
      </View>

      {(origin || current || destination) && (
        <View style={styles.routePanel}>
          <View style={styles.routeLineText}>
            <MaterialIcons name="near-me" size={14} color={Colors.primary} />
            <Text style={styles.routePointText} numberOfLines={1}>
              {originLabel}
            </Text>
          </View>
          <View style={styles.routePanelDivider} />
          <View style={styles.routeLineText}>
            <MaterialIcons name="place" size={14} color={Colors.primary} />
            <Text style={styles.routePointText} numberOfLines={1}>
              {destinationLabel}
            </Text>
          </View>
          {!!routeSummary && (
            <Text style={styles.routeMeta}>
              {routeSummary.distanceKm.toFixed(1)} km - {routeSummary.etaMinutes} min
            </Text>
          )}
        </View>
      )}

      <Pressable
        onPress={onOpenMaps}
        disabled={!onOpenMaps}
        style={({ pressed }) => [
          styles.locationButton,
          !onOpenMaps && styles.locationButtonDisabled,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open route in Google Maps"
      >
        <MaterialIcons name="my-location" size={20} color={Colors.onSurface} />
      </Pressable>

      {onOpenMaps && (
        <Pressable
          onPress={onOpenMaps}
          style={({ pressed }) => [styles.mapsButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open Google Maps directions"
        >
          <MaterialIcons name="map" size={16} color={Colors.onPrimary} />
          <Text style={styles.mapsButtonText}>Google Maps</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.4)',
    backgroundColor: Colors.surfaceContainerHighest,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  routePanel: {
    position: 'absolute',
    left: Spacing.sm,
    top: Spacing.sm,
    width: '58%',
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.5)',
    padding: Spacing.sm,
    gap: 4,
  },
  routeLineText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routePointText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onSurface,
  },
  routePanelDivider: {
    height: 1,
    backgroundColor: Colors.surfaceVariant,
  },
  routeMeta: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.primary,
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
  topLabel: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.5)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  pulseDotLive: {
    backgroundColor: Colors.success,
  },
  topLabelText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurface,
  },
  locationButton: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    width: 40,
    height: 40,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationButtonDisabled: {
    opacity: 0.72,
  },
  mapsButton: {
    position: 'absolute',
    left: Spacing.sm,
    bottom: Spacing.sm,
    minHeight: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadow.card,
  },
  mapsButtonText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  pressed: {
    opacity: 0.74,
  },
});
