import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function NearbyGymsScreen({ theme }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionAsync();

      if (status !== "granted") {
        Alert.alert(
          "permissão negada",
          "Não foi possivel acessar sua localização"
        );
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLoading(Location.coords);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View>
      {location && (
        <MapView>
          style={styles.map}
          initialRegion={{
            latitude: Location.latitude,
            longitude: Location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}

          <Marker/>
        </MapView>
      )}

    </View>
  );
}
