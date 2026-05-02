import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as MapLibre from '@maplibre/maplibre-react-native';
import { RouteFallbackMap } from '@/components/rider/RouteFallbackMap';
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

const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

function toPosition(coordinate: Coordinate): [number, number] {
  return [coordinate.longitude, coordinate.latitude];
}

function getBounds(points: Coordinate[]) {
  const longitudes = points.map((point) => point.longitude);
  const latitudes = points.map((point) => point.latitude);

  return {
    ne: [Math.max(...longitudes), Math.max(...latitudes)] as [number, number],
    sw: [Math.min(...longitudes), Math.min(...latitudes)] as [number, number],
  };
}

export function LiveOsmMap({
  origin,
  destination,
  current,
  zoom = 14,
  showAttribution = true,
}: Props) {
  const [styleFailed, setStyleFailed] = useState(false);
  const markerOrigin = current ?? origin;
  const bounds = useMemo(
    () => getBounds([markerOrigin, destination]),
    [destination.latitude, destination.longitude, markerOrigin.latitude, markerOrigin.longitude],
  );
  const routeShape = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [toPosition(markerOrigin), toPosition(destination)],
      },
    }),
    [destination.latitude, destination.longitude, markerOrigin.latitude, markerOrigin.longitude],
  );

  if (styleFailed) {
    return (
      <RouteFallbackMap
        origin={origin}
        destination={destination}
        current={current}
        zoom={zoom}
        showAttribution={showAttribution}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapLibre.MapView
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={showAttribution}
        compassEnabled
        rotateEnabled
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled
        onDidFailLoadingMap={() => setStyleFailed(true)}
      >
        <MapLibre.Camera
          bounds={{ ne: bounds.ne, sw: bounds.sw }}
          padding={{ paddingTop: 72, paddingBottom: 72, paddingLeft: 56, paddingRight: 56 }}
          zoomLevel={zoom}
          animationDuration={0}
        />
        <MapLibre.ShapeSource id="veribee-route" shape={routeShape}>
          <MapLibre.LineLayer
            id="veribee-route-line"
            style={{
              lineColor: Colors.tertiaryContainer,
              lineWidth: 5,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </MapLibre.ShapeSource>
        <MapLibre.PointAnnotation id="veribee-rider" coordinate={toPosition(markerOrigin)}>
          <View style={styles.originMarker}>
            <MaterialIcons name="delivery-dining" size={20} color={Colors.onPrimary} />
          </View>
        </MapLibre.PointAnnotation>
        <MapLibre.PointAnnotation id="veribee-destination" coordinate={toPosition(destination)}>
          <View style={styles.destinationMarker}>
            <MaterialIcons name="home" size={20} color={Colors.onSecondaryContainer} />
          </View>
        </MapLibre.PointAnnotation>
      </MapLibre.MapView>
      {showAttribution && <Text style={styles.attribution}>OpenFreeMap</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surfaceContainer,
    overflow: 'hidden',
  },
  originMarker: {
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
