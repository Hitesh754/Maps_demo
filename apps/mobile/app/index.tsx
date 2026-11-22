import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { createApiClient, ProblemDetailsError, ApiClientError } from "@meridian/api-client";
import type { ReadyResponse } from "@meridian/contracts";
import { darkColors } from "@meridian/design-tokens";

type ProbeState =
  | { status: "loading" }
  | { status: "ready"; data: ReadyResponse }
  | { status: "degraded"; detail: string }
  | { status: "unreachable"; message: string };

export default function MobileHomeScreen() {
  const [probe, setProbe] = useState<ProbeState>({ status: "loading" });
  // Default to Android emulator gateway 10.0.2.2 or override via EXPO_PUBLIC_API_BASE_URL
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:8080";

  const probeReadiness = useCallback(async () => {
    setProbe({ status: "loading" });
    const client = createApiClient({ baseUrl: apiUrl, defaultTimeoutMs: 4000 });

    try {
      const ready = await client.getReady();
      setProbe({ status: "ready", data: ready });
    } catch (err: unknown) {
      if (err instanceof ProblemDetailsError) {
        setProbe({
          status: "degraded",
          detail: err.problem.detail || err.problem.title || "Service degraded",
        });
      } else if (err instanceof ApiClientError) {
        setProbe({
          status: "unreachable",
          message: `${err.message} (${apiUrl})`,
        });
      } else {
        setProbe({
          status: "unreachable",
          message: err instanceof Error ? err.message : "Unknown connectivity failure",
        });
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    probeReadiness();
  }, [probeReadiness]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.platformTitle}>Meridian</Text>
        <Text style={styles.platformSubtitle}>Geospatial Mobile Client • SDK 57</Text>
        <Text style={styles.targetHost}>Probing: {apiUrl}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend Cluster Readiness</Text>

        {probe.status === "loading" && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Probing /readyz endpoint...</Text>
          </View>
        )}

        {probe.status === "ready" && (
          <View style={styles.statusBoxReady}>
            <Text style={styles.statusTextReady}>Operational (200 OK)</Text>
            <Text style={styles.timestampText}>{probe.data.timestamp}</Text>

            <View style={styles.checksList}>
              <Text style={styles.checkItem}>
                • PostgreSQL + PostGIS: {probe.data.checks.postgres ? "UP" : "DOWN"}
              </Text>
              <Text style={styles.checkItem}>
                • NATS JetStream: {probe.data.checks.nats ? "UP" : "DOWN"}
              </Text>
              <Text style={styles.checkItem}>
                • S3 Storage: {probe.data.checks.s3 ? "UP" : "DOWN"}
              </Text>
            </View>
          </View>
        )}

        {probe.status === "degraded" && (
          <View style={styles.statusBoxDegraded}>
            <Text style={styles.statusTextDegraded}>Cluster Degraded (503)</Text>
            <Text style={styles.detailText}>{probe.detail}</Text>
          </View>
        )}

        {probe.status === "unreachable" && (
          <View style={styles.statusBoxUnreachable}>
            <Text style={styles.statusTextUnreachable}>API Unreachable</Text>
            <Text style={styles.detailText}>{probe.message}</Text>
            <Text style={styles.hintText}>
              Note: Android emulators connect via http://10.0.2.2:8080. Physical devices must use your PC's LAN IP address.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={probeReadiness}>
          <Text style={styles.refreshButtonText}>Re-probe Readiness</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: darkColors.background,
  },
  header: {
    marginBottom: 24,
  },
  platformTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: darkColors.textPrimary,
  },
  platformSubtitle: {
    fontSize: 14,
    color: darkColors.textSecondary,
    marginTop: 4,
  },
  targetHost: {
    fontSize: 12,
    color: darkColors.textMuted,
    fontFamily: "monospace",
    marginTop: 6,
  },
  card: {
    backgroundColor: darkColors.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: darkColors.textPrimary,
    marginBottom: 16,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  loadingText: {
    color: darkColors.textSecondary,
    fontSize: 14,
  },
  statusBoxReady: {
    padding: 14,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    marginBottom: 16,
  },
  statusTextReady: {
    color: darkColors.statusOk,
    fontSize: 15,
    fontWeight: "bold",
  },
  timestampText: {
    color: darkColors.textMuted,
    fontSize: 11,
    fontFamily: "monospace",
    marginTop: 2,
    marginBottom: 8,
  },
  checksList: {
    marginTop: 4,
    gap: 4,
  },
  checkItem: {
    color: darkColors.textPrimary,
    fontSize: 13,
  },
  statusBoxDegraded: {
    padding: 14,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: 16,
  },
  statusTextDegraded: {
    color: darkColors.statusWarning,
    fontSize: 15,
    fontWeight: "bold",
  },
  statusBoxUnreachable: {
    padding: 14,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    marginBottom: 16,
  },
  statusTextUnreachable: {
    color: darkColors.statusDanger,
    fontSize: 15,
    fontWeight: "bold",
  },
  detailText: {
    color: darkColors.textPrimary,
    fontSize: 13,
    marginTop: 4,
  },
  hintText: {
    color: darkColors.textMuted,
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: darkColors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
