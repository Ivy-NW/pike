import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from "react-native";
import { router } from "expo-router";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme, useSemanticColors, RADIUS_CARD } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

/**
 * `@pike/shared-types`' `UserQuestListItem` (and the `Venue`/`Quest` entities
 * it's built from) don't carry a real lat/lng today — see
 * packages/shared-types/src/api.ts and entities.ts. Rather than fabricate a
 * position, this returns null so the caller can skip the pin; wire the real
 * field in here once the API exposes one instead of guessing at a shape that
 * doesn't exist yet.
 */
function venueCoordinate(_item: UserQuestListItem): { lat: number; lng: number } | null {
  return null;
}

export default function MapScreen() {
  const theme = useTheme();
  const semantic = useSemanticColors();
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [questFilter, setQuestFilter] = useState<"all" | "high" | "exploration">("all");
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
  const actionColor = semantic.action;
  const mutedColor = c.onSurfaceVariant;

  // Only quests with a real venue coordinate get a pin — see venueCoordinate() above.
  const markersData = quests
    .map((q) => {
      const coords = venueCoordinate(q);
      if (!coords) return null;
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
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  // 100% Free OpenStreetMap Pure Implementation (Zero Tokens, Zero API Keys, Pure OSM)
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
        body, html { width: 100%; height: 100%; background: ${isDark ? "#000000" : "#F6F4EF"}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Orbitron", sans-serif; }
        #map { width: 100%; height: 100%; }

        /* Dark Theme OSM Tile Filter — Gives OpenStreetMap a rich dark titanium aesthetic without any external API keys! */
        ${
          isDark
            ? `
        .leaflet-tile-pane {
          filter: brightness(0.65) invert(1) contrast(3.5) hue-rotate(200deg) saturate(0.2) brightness(0.75);
        }
        `
            : ""
        }

        /* Neumorphic pins matching PIKE Blue: available quests in Pike Blue, visited/completed venues in muted gray */
        .pin-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-pin {
          background: ${isDark ? "#0d0d0d" : "#ffffff"};
          color: ${actionColor};
          border: 2.5px solid ${actionColor};
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 14px ${isDark ? "rgba(59, 130, 246, 0.5)" : "rgba(37, 99, 235, 0.35)"};
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .custom-pin:hover, .custom-pin:active {
          transform: scale(1.15);
        }
        .custom-pin.completed {
          color: ${mutedColor};
          border-color: ${mutedColor};
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }

        /* Popup Styling */
        .leaflet-popup-content-wrapper {
          background: ${isDark ? "rgba(20, 20, 24, 0.95)" : "rgba(255, 255, 255, 0.98)"};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: ${isDark ? "#ece7df" : "#1F1A14"};
          border: 1.5px solid ${isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(37, 99, 235, 0.25)"};
          border-radius: 18px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.3);
          padding: 8px 6px;
        }
        .leaflet-popup-tip {
          background: ${isDark ? "rgba(20, 20, 24, 0.95)" : "rgba(255, 255, 255, 0.98)"};
        }
        .popup-title {
          font-size: 14px;
          font-weight: 700;
          color: ${actionColor};
          margin-bottom: 2px;
        }
        .popup-quest {
          font-size: 12px;
          color: ${isDark ? "#8f867a" : "#6B6255"};
          margin-bottom: 6px;
        }
        .popup-reward {
          font-size: 11px;
          font-weight: 700;
          color: ${c.primary};
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .map-hint {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 1000;
          background: ${isDark ? "rgba(20, 20, 24, 0.9)" : "rgba(255, 255, 255, 0.92)"};
          color: ${isDark ? "#8f867a" : "#6B6255"};
          font-size: 11px;
          text-align: center;
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.08)"};
        }
        .leaflet-control-attribution {
          background: ${isDark ? "rgba(12, 12, 14, 0.8)" : "rgba(255, 255, 255, 0.8)"} !important;
          color: ${isDark ? "#5c5449" : "#8A8171"} !important;
          font-size: 9px !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      ${markersData.length === 0 ? `<div class="map-hint">Pin locations are coming soon — browse quests in the list below</div>` : ""}
      <script>
        var map = L.map('map', {
          center: [-1.286389, 36.817223], // Nairobi CBD
          zoom: 13,
          zoomControl: false,
          attributionControl: true
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Standard 100% Free OpenStreetMap Tiles (Open-Source, Zero Keys, Zero Limits)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    mapContainer: {
      height: "44%",
      width: "100%",
      backgroundColor: isDark ? "#000000" : "#E8E4DA",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
    },
    sheet: {
      flex: 1,
      backgroundColor: isDark ? "#000000" : c.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 16,
      paddingHorizontal: 16,
      marginTop: -20,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(59, 130, 246, 0.18)" : "rgba(15, 23, 42, 0.08)",
      shadowColor: isDark ? "#000000" : "#0f172a",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDark ? 0.75 : 0.08,
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
    sheetCount: { ...theme.font(theme.type.bodyLg), color: actionColor, fontWeight: "700" },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS_CARD },
    filterPillActiveText: { ...theme.font(theme.type.labelCaps), color: actionColor, fontSize: 11, fontWeight: "700" },
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
    distanceText: { ...theme.font(theme.type.labelCaps), color: actionColor, fontSize: 10, fontWeight: "700" },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 24 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Explore" showLogo={false} subtitle="Nairobi Quests" />
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
            style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#F6F4EF" }}
            scrollEnabled={false}
          />
        )}
      </View>
      <View style={styles.sheet}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>NEARBY QUESTS</Text>
          <Text style={styles.sheetCount}>{quests.length} active</Text>
        </View>

        {/* Quick Filter Pills */}
        <View style={styles.filterRow}>
          <NeumorphicView
            variant={questFilter === "all" ? "inset" : "raised"}
            accent={questFilter === "all" ? "action" : "none"}
            radius={RADIUS_CARD}
            style={styles.filterPill}
            onPress={() => setQuestFilter("all")}
          >
            <Text style={questFilter === "all" ? styles.filterPillActiveText : styles.filterPillInactiveText}>● ALL QUESTS</Text>
          </NeumorphicView>
          <NeumorphicView
            variant={questFilter === "high" ? "inset" : "raised"}
            accent={questFilter === "high" ? "action" : "none"}
            radius={RADIUS_CARD}
            style={styles.filterPill}
            onPress={() => setQuestFilter("high")}
          >
            <Text style={questFilter === "high" ? styles.filterPillActiveText : styles.filterPillInactiveText}>HIGH YIELD</Text>
          </NeumorphicView>
          <NeumorphicView
            variant={questFilter === "exploration" ? "inset" : "raised"}
            accent={questFilter === "exploration" ? "action" : "none"}
            radius={RADIUS_CARD}
            style={styles.filterPill}
            onPress={() => setQuestFilter("exploration")}
          >
            <Text style={questFilter === "exploration" ? styles.filterPillActiveText : styles.filterPillInactiveText}>EXPLORATION</Text>
          </NeumorphicView>
        </View>

        <FlatList
          data={quests.filter((q) => {
            if (questFilter === "high") return q.rewardDescription.toLowerCase().includes("off") || q.rewardDescription.toLowerCase().includes("free");
            if (questFilter === "exploration") return !q.completed;
            return true;
          })}
          keyExtractor={(q) => q.id}
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No quests found in this category.</Text>}
          renderItem={({ item }) => {
            return (
              <NeumorphicView
                variant="raised"
                radius={RADIUS_CARD}
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
                  <MaterialIcons name={item.completed ? "military-tech" : "explore"} size={22} color={item.completed ? "#10B981" : actionColor} />
                </NeumorphicView>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.venueName}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>{item.name}</Text>
                  <NeumorphicView variant="inset" radius={8} style={styles.distanceTag}>
                    <Text style={styles.distanceText} numberOfLines={1}>{item.rewardDescription}</Text>
                  </NeumorphicView>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(item.venueId)} hitSlop={8} style={styles.favBtn}>
                  <MaterialIcons
                    name={favorites.has(item.venueId) ? "favorite" : "favorite-border"}
                    size={20}
                    color={favorites.has(item.venueId) ? "#ef4444" : c.onSurfaceVariant}
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
