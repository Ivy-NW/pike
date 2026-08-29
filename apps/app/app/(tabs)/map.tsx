import { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

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
        body, html { width: 100%; height: 100%; background: #0b1329; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        #map { width: 100%; height: 100%; }
        
        /* Smooth custom pins */
        .pin-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-pin {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.6), 0 0 0 3px rgba(37, 99, 235, 0.25);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .custom-pin:hover, .custom-pin:active {
          transform: scale(1.18);
        }
        .custom-pin.completed {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-color: #fef3c7;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6), 0 0 0 3px rgba(245, 158, 11, 0.25);
        }
        
        /* Glassmorphism popups */
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.5);
          padding: 6px 4px;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95);
        }
        .popup-title {
          font-size: 15px;
          font-weight: 700;
          color: #93c5fd;
          margin-bottom: 3px;
        }
        .popup-sub {
          font-size: 12px;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .popup-reward {
          font-size: 11px;
          color: #fbbf24;
          font-weight: 600;
          background: rgba(251, 191, 36, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
          display: inline-block;
          border: 1px solid rgba(251, 191, 36, 0.25);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([40.7128, -74.0060], 14);

        // Smooth Google Maps Roadmap / Terrain in Leaflet
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);

        var markers = ${JSON.stringify(venueMarkers)};
        if (markers.length > 0) {
          var group = [];
          markers.forEach(function(m) {
            var iconClass = m.completed ? 'custom-pin completed' : 'custom-pin';
            var icon = L.divIcon({
              className: 'pin-wrapper',
              html: '<div class="' + iconClass + '">' + (m.completed ? '🏆' : '📍') + '</div>',
              iconSize: [38, 38],
              iconAnchor: [19, 19]
            });
            var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
            marker.bindPopup('<div class="popup-title">' + m.name + '</div><div class="popup-sub">' + m.questName + '</div><div class="popup-reward">🎁 ' + m.reward + '</div>');
            group.push([m.lat, m.lng]);
          });
          if (group.length > 1) {
            map.fitBounds(group, { padding: [45, 45] });
          } else if (group.length === 1) {
            map.setView(group[0], 15);
          }
        }
      </script>
    </body>
    </html>
  `;

  const isDark = theme.mode === "dark";
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    mapContainer: {
      height: "44%",
      width: "100%",
      backgroundColor: c.surfaceContainerLowest,
      borderBottomWidth: 1,
      borderBottomColor: c.neumorphBorder,
      overflow: "hidden",
    },
    sheet: {
      flex: 1,
      backgroundColor: isDark ? "#141314" : c.surfaceContainerLow,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 16,
      paddingHorizontal: theme.spacing.containerPadding,
      marginTop: -20,
      borderTopWidth: 1,
      borderTopColor: c.neumorphBorder,
      shadowColor: isDark ? "#000000" : "#a3b1c6",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: isDark ? 0.7 : 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    sheetHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sheetTitle: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5 },
    sheetCount: { ...theme.font(theme.type.bodyLg), color: "#00f0ff" },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    filterPill: { paddingHorizontal: 12, paddingVertical: 6 },
    filterPillActive: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 10 },
    filterPillInactive: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10 },
    card: {
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    nodeIconWell: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    favBtn: { padding: 6 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 17 },
    cardSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, fontSize: 13 },
    distanceTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
    distanceText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 9 },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 24 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Explore" showLogo={false} subtitle="Detected Nodes & Anomalies" />
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={mapHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Google Maps"
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
          <Text style={styles.sheetTitle}>DETECTED NODES</Text>
          <Text style={styles.sheetCount}>{quests.length} active</Text>
        </View>

        {/* Quick Filter Pills */}
        <View style={styles.filterRow}>
          <NeumorphicView variant="inset" radius={12} style={styles.filterPill}>
            <Text style={styles.filterPillActive}>● ALL NODES</Text>
          </NeumorphicView>
          <NeumorphicView variant="raised" radius={12} style={styles.filterPill}>
            <Text style={styles.filterPillInactive}>HIGH YIELD</Text>
          </NeumorphicView>
          <NeumorphicView variant="raised" radius={12} style={styles.filterPill}>
            <Text style={styles.filterPillInactive}>EXPLORATION</Text>
          </NeumorphicView>
        </View>

        <FlatList
          data={quests}
          keyExtractor={(q) => q.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No nodes detected in this sector.</Text>}
          renderItem={({ item }) => (
            <NeumorphicView
              variant="raised"
              radius={20}
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
              <NeumorphicView variant="inset" radius={14} style={styles.nodeIconWell}>
                <MaterialIcons name={item.completed ? "memory" : "explore"} size={22} color={item.completed ? "#10B981" : "#00f0ff"} />
              </NeumorphicView>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.venueName}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>{item.name}</Text>
                <NeumorphicView variant="inset" radius={8} style={styles.distanceTag}>
                  <Text style={styles.distanceText}>0.8 KM • +150 XP</Text>
                </NeumorphicView>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.venueId)} hitSlop={8} style={styles.favBtn}>
                <MaterialIcons
                  name={favorites.has(item.venueId) ? "favorite" : "favorite-border"}
                  size={20}
                  color={favorites.has(item.venueId) ? "#00f0ff" : c.onSurfaceVariant}
                />
              </TouchableOpacity>
              <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
            </NeumorphicView>
          )}
        />
      </View>
    </View>
  );
}
