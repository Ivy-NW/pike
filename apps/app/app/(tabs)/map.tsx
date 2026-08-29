import { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";

interface QuestListItem {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  rewardDescription: string;
  completed: boolean;
  markerId: string | null;
}

// Generate consistent synthetic coordinates around a city center for venues without fixed GPS
function getVenueCoordinate(venueId: string, index: number) {
  const baseLat = 40.7128;
  const baseLng = -74.006;
  const offsets = [
    { lat: 0.0035, lng: -0.0025 },
    { lat: -0.0042, lng: 0.0051 },
    { lat: 0.0061, lng: 0.0038 },
    { lat: -0.0028, lng: -0.0062 },
    { lat: 0.0075, lng: -0.0045 },
  ];
  const offset = offsets[index % offsets.length];
  return {
    lat: baseLat + offset.lat,
    lng: baseLng + offset.lng,
  };
}

export default function MapScreen() {
  const theme = useTheme();
  const [quests, setQuests] = useState<QuestListItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    api.quests().then(setQuests).catch(() => setQuests([]));
    api.favorites().then((f) => setFavorites(new Set(f.map((v) => v.id)))).catch(() => {});
  }, []);

  const toggleFavorite = async (venueId: string) => {
    const isFav = favorites.has(venueId);
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(venueId) : next.add(venueId);
      return next;
    });
    try {
      await (isFav ? api.removeFavorite(venueId) : api.addFavorite(venueId));
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.add(venueId) : next.delete(venueId);
        return next;
      });
    }
  };

  const venueMarkers = quests.map((q, idx) => {
    const coords = getVenueCoordinate(q.venueId, idx);
    return {
      id: q.id,
      venueId: q.venueId,
      name: q.venueName,
      questName: q.name,
      reward: q.rewardDescription,
      completed: q.completed,
      lat: coords.lat,
      lng: coords.lng,
    };
  });

  const c = theme.colors;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { width: 100%; height: 100%; background: #060e20; overflow: hidden; }
        #map { width: 100%; height: 100%; background: #060e20; }
        .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .custom-pin {
          background: #2563eb;
          color: #fff;
          border: 2px solid #b4c5ff;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
          font-size: 15px;
          box-shadow: 0 0 14px rgba(79, 70, 229, 0.8);
        }
        .custom-pin.completed {
          background: #ffb95f;
          border-color: #ffd99f;
          box-shadow: 0 0 14px rgba(255, 185, 95, 0.8);
        }
        .leaflet-popup-content-wrapper {
          background: #131b2e;
          color: #dae2fd;
          border: 1px solid rgba(180, 197, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }
        .leaflet-popup-tip { background: #131b2e; }
        .popup-title { font-size: 14px; font-weight: 700; color: #b4c5ff; margin-bottom: 2px; font-family: sans-serif; }
        .popup-sub { font-size: 12px; color: #c3c6d7; margin-bottom: 6px; font-family: sans-serif; }
        .popup-reward { font-size: 11px; color: #ffb95f; font-weight: 600; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([40.7128, -74.0060], 14);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c']
        }).addTo(map);

        var markers = ${JSON.stringify(venueMarkers)};
        if (markers.length > 0) {
          var group = [];
          markers.forEach(function(m) {
            var iconClass = m.completed ? 'custom-pin completed' : 'custom-pin';
            var icon = L.divIcon({
              className: 'pin-wrapper',
              html: '<div class="' + iconClass + '">' + (m.completed ? '🏆' : '📍') + '</div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
            marker.bindPopup('<div class="popup-title">' + m.name + '</div><div class="popup-sub">' + m.questName + '</div><div class="popup-reward">🎁 ' + m.reward + '</div>');
            group.push([m.lat, m.lng]);
          });
          if (group.length > 1) {
            map.fitBounds(group, { padding: [40, 40] });
          } else if (group.length === 1) {
            map.setView(group[0], 15);
          }
        }
      </script>
    </body>
    </html>
  `;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    mapContainer: {
      height: "44%",
      width: "100%",
      backgroundColor: c.surfaceContainerLowest,
      borderBottomWidth: 1,
      borderBottomColor: c.surfaceContainerHighest,
      overflow: "hidden",
    },
    sheet: {
      flex: 1,
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: theme.radius.card,
      borderTopRightRadius: theme.radius.card,
      paddingTop: theme.spacing.stackMd,
      paddingHorizontal: theme.spacing.containerPadding,
      marginTop: -16,
    },
    sheetHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.stackMd,
    },
    sheetTitle: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant },
    sheetCount: { ...theme.font(theme.type.bodyLg), color: c.primary },
    card: {
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      marginBottom: theme.spacing.stackSm,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    dot: { width: 10, height: 10, borderRadius: 5 },
    favBtn: { padding: 4 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    cardSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2 },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 24 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Explore" showLogo={false} subtitle="Live OpenStreetMap discovery" />
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={mapHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="OpenStreetMap"
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={{ flex: 1, backgroundColor: "#060e20" }}
            scrollEnabled={false}
          />
        )}
      </View>
      <View style={styles.sheet}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>NEARBY VENUES & QUESTS</Text>
          <Text style={styles.sheetCount}>{quests.length} venues</Text>
        </View>
        <FlatList
          data={quests}
          keyExtractor={(q) => q.id}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No quests available right now.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/quest/[id]",
                  params: {
                    id: item.id,
                    name: item.name,
                    venueName: item.venueName,
                    rewardDescription: item.rewardDescription,
                    completed: String(item.completed),
                    markerId: item.markerId ?? "",
                  },
                })
              }
            >
              <View style={[styles.dot, { backgroundColor: item.completed ? c.secondaryContainer : c.primaryContainer }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.venueName}</Text>
                <Text style={styles.cardSub}>{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.venueId)} hitSlop={8} style={styles.favBtn}>
                <MaterialIcons
                  name={favorites.has(item.venueId) ? "favorite" : "favorite-border"}
                  size={20}
                  color={favorites.has(item.venueId) ? c.primary : c.onSurfaceVariant}
                />
              </TouchableOpacity>
              <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
