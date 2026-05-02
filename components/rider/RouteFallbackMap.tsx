import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';
import type { Coordinate } from '@/lib/maps';

type Props = {
  origin: Coordinate;
  destination: Coordinate;
  current?: Coordinate;
  zoom?: number;
  showAttribution?: boolean;
};

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 15;
const MIN_ZOOM = 11;
const FIT_PADDING = 72;

type Point = {
  x: number;
  y: number;
};

function clampLatitude(latitude: number) {
  return Math.max(Math.min(latitude, 85.05112878), -85.05112878);
}

function coordinateToWorldPixel(coordinate: Coordinate, zoom: number): Point {
  const scale = TILE_SIZE * 2 ** zoom;
  const latitude = clampLatitude(coordinate.latitude);
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);

  return {
    x: ((coordinate.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
}

function resolveZoom(
  origin: Coordinate,
  destination: Coordinate,
  width: number,
  height: number,
  requestedZoom?: number,
) {
  if (requestedZoom) return requestedZoom;

  for (let candidate = DEFAULT_ZOOM; candidate >= MIN_ZOOM; candidate -= 1) {
    const originPoint = coordinateToWorldPixel(origin, candidate);
    const destinationPoint = coordinateToWorldPixel(destination, candidate);
    const dx = Math.abs(destinationPoint.x - originPoint.x);
    const dy = Math.abs(destinationPoint.y - originPoint.y);
    if (dx <= width - FIT_PADDING * 2 && dy <= height - FIT_PADDING * 2) return candidate;
  }

  return MIN_ZOOM;
}

export function RouteFallbackMap({
  origin,
  destination,
  current,
  zoom,
  showAttribution = true,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const markerOrigin = current ?? origin;
  const center = useMemo(
    () => ({
      latitude: (markerOrigin.latitude + destination.latitude) / 2,
      longitude: (markerOrigin.longitude + destination.longitude) / 2,
    }),
    [destination.latitude, destination.longitude, markerOrigin.latitude, markerOrigin.longitude],
  );

  const map = useMemo(() => {
    if (!size.width || !size.height) return null;

    const effectiveZoom = resolveZoom(markerOrigin, destination, size.width, size.height, zoom);
    const centerPixel = coordinateToWorldPixel(center, effectiveZoom);
    const topLeft = {
      x: centerPixel.x - size.width / 2,
      y: centerPixel.y - size.height / 2,
    };

    const toScreenPoint = (coordinate: Coordinate) => {
      const point = coordinateToWorldPixel(coordinate, effectiveZoom);
      return {
        x: point.x - topLeft.x,
        y: point.y - topLeft.y,
      };
    };

    const originPoint = toScreenPoint(markerOrigin);
    const destinationPoint = toScreenPoint(destination);
    const dx = destinationPoint.x - originPoint.x;
    const dy = destinationPoint.y - originPoint.y;

    return {
      originPoint,
      destinationPoint,
      routeLength: Math.sqrt(dx * dx + dy * dy),
      routeAngle: `${Math.atan2(dy, dx)}rad`,
      routeCenter: {
        x: (originPoint.x + destinationPoint.x) / 2,
        y: (originPoint.y + destinationPoint.y) / 2,
      },
    };
  }, [center, destination, markerOrigin, size.height, size.width, zoom]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <View style={[styles.block, styles.blockOne]} />
      <View style={[styles.block, styles.blockTwo]} />
      <View style={[styles.block, styles.blockThree]} />

      {!!map && (
        <>
          <View
            style={[
              styles.route,
              {
                left: map.routeCenter.x - map.routeLength / 2,
                top: map.routeCenter.y - 2.5,
                width: map.routeLength,
                transform: [{ rotate: map.routeAngle }],
              },
            ]}
          />
          <View
            style={[
              styles.originMarker,
              { left: map.originPoint.x - 18, top: map.originPoint.y - 18 },
            ]}
          >
            <MaterialIcons name="delivery-dining" size={20} color={Colors.onPrimary} />
          </View>
          <View
            style={[
              styles.destinationMarker,
              { left: map.destinationPoint.x - 18, top: map.destinationPoint.y - 18 },
            ]}
          >
            <MaterialIcons name="home" size={20} color={Colors.onSecondaryContainer} />
          </View>
        </>
      )}

      {showAttribution && <Text style={styles.attribution}>Preview route</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f1ede7',
    overflow: 'hidden',
  },
  road: {
    position: 'absolute',
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  roadOne: {
    left: -48,
    right: -48,
    top: '28%',
    height: 18,
    transform: [{ rotate: '-12deg' }],
  },
  roadTwo: {
    left: '18%',
    top: -40,
    bottom: -40,
    width: 18,
    transform: [{ rotate: '18deg' }],
  },
  roadThree: {
    right: '20%',
    top: -40,
    bottom: -40,
    width: 16,
    transform: [{ rotate: '-21deg' }],
  },
  block: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(201, 217, 190, 0.72)',
  },
  blockOne: {
    left: '8%',
    top: '13%',
  },
  blockTwo: {
    right: '12%',
    top: '34%',
  },
  blockThree: {
    left: '34%',
    bottom: '10%',
  },
  route: {
    position: 'absolute',
    height: 5,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
  },
  originMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attribution: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: Fonts.manropeBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
});
