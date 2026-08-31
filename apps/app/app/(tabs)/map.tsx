import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from "react-native";
import { router } from "expo-router";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

// Nairobi Sector Anchor Coordinates (100% Kenya Nairobi Grid)
const NAIROBI_VENUES = [
  { name: "KICC Sky Deck", lat: -1.2885, lng: 36.8233, sector: "CBD Central" },
  { name: "Nairobi National Museum", lat: -1.2740, lng: 36.8140, sector: "Museum Hill" },
  { name: "Upper Hill Cyber Hub", lat: -1.2980, lng: 36.8150, sector: "Upper Hill" },
  { name: "Sarit Tech Expo", lat: -1.2615, lng: 36.8040, sector: "Westlands" },
  { name: "Kilimani Node Terminal", lat: -1.2921, lng: 36.7865, sector: "Kilimani" },
  { name: "The Hub Cyber Plaza", lat: -1.3190, lng: 36.7060, sector: "Karen" },
  { name: "Village Market Portal", lat: -1.2290, lng: 36.8040, sector: "Gigiri" },
];

function getVenueCoordinate(venueId: string, index: number) {
  const spot = NAIROBI_VENUES[index % NAIROBI_VENUES.length];
  return {
    lat: spot.lat,
    lng: spot.lng,
    sector: spot.sector,
  };
}

export default function MapScreen() {
  const theme = useTheme();
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [nodeFilter, setNodeFilter] = useState<"all" | "high" | "exploration">("all");
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
        const rollback = new Set(prev);
        isFav ? rollback.add(venueId) : rollback.delete(venueId);
        return rollback;
      });
    }
  };

  const c = theme.colors;
  const isDark = theme.mode === "dark";

  // Build markers JSON for Nairobi locations
  const markersData = quests.map((q, i) => {
    const coords = getVenueCoordinate(q.venueId, i);
    return {
      id: q.id,
      venueId: q.venueId,
      name: q.venueName,
      questName: q.name,
      reward: q.rewardDescription,
      completed: q.completed,
      lat: coords.lat,
      lng: coords.lng,
      sector: coords.sector,
    };
  });

  // 100% Free Open-Source OpenStreetMap Tile Implementation (Zero API Keys required)
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="referrer" content="no-referrer" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { width: 100%; height: 100%; background: ${isDark ? "#141314" : "#f1f5f9"}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Space Grotesk", sans-serif; }
        #map { width: 100%; height: 100%; }
        
        /* Neumorphic Cyan/Gold Glow Pins matching PIKE Logo */
        .pin-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-pin {
          background: ${isDark ? "#141314" : "#ffffff"};
          color: ${isDark ? "#00f0ff" : "#1d4ed8"};
          border: 2.5px solid ${isDark ? "#00f0ff" : "#1d4ed8"};
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 14px ${isDark ? "rgba(0, 240, 255, 0.6)" : "rgba(29, 78, 216, 0.4)"};
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .custom-pin:hover, .custom-pin:active {
          transform: scale(1.15);
        }
        .custom-pin.completed {
          color: #10B981;
          border-color: #10B981;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
        }
        
        /* Popup Styling */
        .leaflet-popup-content-wrapper {
          background: ${isDark ? "rgba(20, 19, 20, 0.95)" : "rgba(255, 255, 255, 0.98)"};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: ${isDark ? "#f8fafc" : "#0f172a"};
          border: 1.5px solid ${isDark ? "rgba(0, 240, 255, 0.4)" : "rgba(29, 78, 216, 0.3)"};
          border-radius: 18px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.4);
          padding: 8px 6px;
        }
        .leaflet-popup-tip {
          background: ${isDark ? "rgba(20, 19, 20, 0.95)" : "rgba(255, 255, 255, 0.98)"};
        }
        .popup-title {
          font-size: 14px;
          font-weight: 700;
          color: ${isDark ? "#00f0ff" : "#1d4ed8"};
          margin-bottom: 2px;
        }
        .popup-quest {
          font-size: 12px;
          color: ${isDark ? "#cbd5e1" : "#334155"};
          margin-bottom: 6px;
        }
        .popup-reward {
          font-size: 11px;
          font-weight: 700;
          color: ${isDark ? "#f59e0b" : "#b45309"};
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .leaflet-control-attribution {
          background: ${isDark ? "rgba(20, 19, 20, 0.8)" : "rgba(255, 255, 255, 0.8)"} !important;
          color: ${isDark ? "#94a3b8" : "#64748b"} !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: ${isDark ? "#00f0ff" : "#1d4ed8"} !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          center: [-1.286389, 36.817223], // Nairobi CBD Anchor Hub
          zoom: 13,
          zoomControl: false,
          attributionControl: true
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        // 100% Free OpenStreetMap Tiles (Open-Source, Zero API Key)
        var isDarkMode = ${isDark};
        var tileUrl = isDarkMode
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
          subdomains: isDarkMode ? 'abc' : 'abc',
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var markers = ${JSON.stringify(markersData)};

        markers.forEach(function(m) {
          var iconHtml = '<div class="pin-wrapper"><div class="custom-pin ' + (m.completed ? 'completed' : '') + '">' +
            (m.completed ? '✓' : '⬡') +
            '</div></div>';

          var icon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -20]
          });

          var popupContent = '<div style="min-width: 150px;">' +
            '<div class="popup-title">' + m.name + '</div>' +
            '<div class="popup-quest">' + m.questName + '</div>' +
            '<div class="popup-reward">🎁 ' + m.reward + '</div>' +
            '</div>';

          L.marker([m.lat, m.lng], { icon: icon })
            .bindPopup(popupContent)
            .addTo(map);
        });

        if (markers.length > 0) {
          var group = new L.featureGroup(markers.map(function(m) {
            return L.marker([m.lat, m.lng]);
          }));
          map.fitBounds(group.getBounds().pad(0.15));
        }
      </script>
    </body>
    </html>
  `;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    mapContainer: {
      height: "44%",
      width: "100%",
      backgroundColor: isDark ? "#141314" : "#e2e8f0",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
    },
    sheet: {
      flex: 1,
      backgroundColor: isDark ? "#141314" : c.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 16,
      paddingHorizontal: 16,
      marginTop: -20,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
      shadowColor: isDark ? "#000000" : "#94a3b8",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDark ? 0.75 : 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    sheetHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sheetTitle: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5, fontSize: 11, fontWeight: "700" },
    sheetCount: { ...theme.font(theme.type.bodyLg), color: isDark ? "#00f0ff" : c.primary, fontWeight: "700" },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
    filterPillActiveText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#00f0ff" : c.primary, fontSize: 11, fontWeight: "700" },
    filterPillInactiveText: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 11 },
    card: {
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    nodeIconWell: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    favBtn: { padding: 6 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 16, fontWeight: "700" },
    cardSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, fontSize: 13 },
    distanceTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, alignSelf: "flex-start", borderRadius: 8 },
    distanceText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#00f0ff" : c.primary, fontSize: 10, fontWeight: "700" },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 24 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Explore" showLogo={false} subtitle="Nairobi Sector Nodes" />
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={mapHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="OpenStreetMap Nairobi"
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={{ flex: 1, backgroundColor: isDark ? "#141314" : "#f1f5f9" }}
            scrollEnabled={false}
          />
        )}
      </View>
      <View style={styles.sheet}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>DETECTED NODES (NAIROBI)</Text>
          <Text style={styles.sheetCount}>{quests.length} active</Text>
        </View>

        {/* Quick Filter Pills */}
        <View style={styles.filterRow}>
          <NeumorphicView
            variant={nodeFilter === "all" ? "inset" : "raised"}
            glow={nodeFilter === "all" ? (isDark ? "cyan" : "blue") : "none"}
            radius={14}
            style={styles.filterPill}
            onPress={() => setNodeFilter("all")}
          >
            <Text style={nodeFilter === "all" ? styles.filterPillActiveText : styles.filterPillInactiveText}>● ALL NODES</Text>
          </NeumorphicView>
          <NeumorphicView
            variant={nodeFilter === "high" ? "inset" : "raised"}
            glow={nodeFilter === "high" ? (isDark ? "cyan" : "blue") : "none"}
            radius={14}
            style={styles.filterPill}
            onPress={() => setNodeFilter("high")}
          >
            <Text style={nodeFilter === "high" ? styles.filterPillActiveText : styles.filterPillInactiveText}>HIGH YIELD</Text>
          </NeumorphicView>
          <NeumorphicView
            variant={nodeFilter === "exploration" ? "inset" : "raised"}
            glow={nodeFilter === "exploration" ? (isDark ? "cyan" : "blue") : "none"}
            radius={14}
            style={styles.filterPill}
            onPress={() => setNodeFilter("exploration")}
          >
            <Text style={nodeFilter === "exploration" ? styles.filterPillActiveText : styles.filterPillInactiveText}>EXPLORATION</Text>
          </NeumorphicView>
        </View>

        <FlatList
          data={quests.filter((q) => {
            if (nodeFilter === "high") return q.rewardDescription.toLowerCase().includes("off") || q.rewardDescription.toLowerCase().includes("free");
            if (nodeFilter === "exploration") return !q.completed;
            return true;
          })}
          keyExtractor={(q) => q.id}
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No nodes detected in this filter category.</Text>}
          renderItem={({ item, index }) => {
            const coords = getVenueCoordinate(item.venueId, index);
            return (
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
                  <MaterialIcons name={item.completed ? "memory" : "explore"} size={22} color={item.completed ? "#10B981" : (isDark ? "#00f0ff" : c.primary)} />
                </NeumorphicView>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.venueName}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>{item.name}</Text>
                  <NeumorphicView variant="inset" radius={8} style={styles.distanceTag}>
                    <Text style={styles.distanceText}>{coords.sector} • +150 XP</Text>
                  </NeumorphicView>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(item.venueId)} hitSlop={8} style={styles.favBtn}>
                  <MaterialIcons
                    name={favorites.has(item.venueId) ? "favorite" : "favorite-border"}
                    size={20}
                    color={favorites.has(item.venueId) ? (isDark ? "#00f0ff" : "#dc2626") : c.onSurfaceVariant}
                  />
                </TouchableOpacity>
                <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
              </NeumorphicView>
            );
          }}
        />
      </View>
    </View>
  );
}
