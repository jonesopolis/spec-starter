import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { FeatureFlagProvider, WithFeatureFlag, journeyPalette } from "@journey/ui";
import IntakeWizard from "./intake/IntakeWizard";
import LoginGate from "./auth/LoginGate";
import NavigatorDashboard from "./navigator/NavigatorDashboard";
import StoreHub from "./store/StoreHub";
import ProfileHub from "./profile/ProfileHub";
import {
  fetchLatestPatientIntake,
  setConnectedFeaturesWalkthroughState,
  type LatestIntakeResponse,
  type PatientIntakePayload
} from "./api/intake";
import {
  type IntakeHistoryEntry,
  type IntakeSnapshot
} from "./intake/types";
import {
  type NativePermissionKind,
  type NativePermissionStatus,
  requestNativePermission
} from "./permissions/nativeSettings";
import { useSupabaseAuth, signOut } from "./auth/useSupabaseAuth";
import type { AuthSession } from "./auth/useSupabaseAuth";
import PasswordResetHandler from "./auth/PasswordResetHandler";
import { supabase } from "./lib/supabase";
import * as Linking from "expo-linking";

const featureFlags = {
  telehealth:
    process.env.EXPO_PUBLIC_FEATURE_TELEHEALTH_ENABLED === "true" ||
    process.env.FEATURE_TELEHEALTH_ENABLED === "true",
  prescriptions:
    process.env.EXPO_PUBLIC_FEATURE_PRESCRIPTIONS_ENABLED === "true" ||
    process.env.FEATURE_PRESCRIPTIONS_ENABLED === "true"
};

type AppTab = "navigator" | "store" | "medical" | "profile";

function snapshotFromLatest(payload: LatestIntakeResponse): IntakeSnapshot | null {
  if (!payload.latestIntake) {
    return null;
  }

  const profile = payload.profile;
  const latest = payload.latestIntake;

  return {
    createdAt: latest.createdAt,
    submissionContext: latest.submissionContext || "INITIAL",
    changeLog: latest.changeLog || [],
    healthPhilosophyPreference: profile?.healthPhilosophyPreference || undefined,
    interestLocationState: profile?.interestLocationState,
    dob: profile?.dob,
    sex: profile?.sex,
    genderIdentity: profile?.genderIdentity,
    medicalDiagnoses: latest.medicalDiagnoses || [],
    medications: latest.medications || [],
    medicationAllergies: latest.medicationAllergies || [],
    environmentalAllergies: latest.environmentalAllergies || [],
    socialHistory: latest.socialHistory,
    diet: latest.diet,
    exercise: latest.exercise || [],
    sleep: latest.sleep,
    stressors: latest.stressors || [],
    healthGoals: latest.healthGoals || [],
    healthConcerns: latest.healthConcerns || [],
    lifestyleScores: latest.lifestyleScores
  };
}

function intakeHistoryFromLatest(payload: LatestIntakeResponse): IntakeHistoryEntry[] {
  if (!payload.latestIntake) {
    return [];
  }

  return [
    {
      submittedAt: payload.latestIntake.createdAt,
      context: payload.latestIntake.submissionContext || "INITIAL",
      changeLog: payload.latestIntake.changeLog || []
    }
  ];
}

function snapshotToInitialData(snapshot: IntakeSnapshot | null): Partial<PatientIntakePayload> | undefined {
  if (!snapshot) {
    return undefined;
  }

  return {
    healthPhilosophyPreference: snapshot.healthPhilosophyPreference,
    interestLocationState: snapshot.interestLocationState,
    dob: snapshot.dob,
    sex: snapshot.sex,
    genderIdentity: snapshot.genderIdentity,
    medicalDiagnoses: snapshot.medicalDiagnoses,
    medications: snapshot.medications,
    medicationAllergies: snapshot.medicationAllergies,
    environmentalAllergies: snapshot.environmentalAllergies,
    socialHistory: snapshot.socialHistory,
    diet: snapshot.diet,
    exercise: snapshot.exercise,
    sleep: snapshot.sleep,
    stressors: snapshot.stressors,
    healthGoals: snapshot.healthGoals,
    healthConcerns: snapshot.healthConcerns
  };
}

export default function App() {
  const { session, isLoading } = useSupabaseAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("navigator");
  const [loadingIntake, setLoadingIntake] = useState(false);
  const [intakeGateError, setIntakeGateError] = useState<string | null>(null);
  const [requiresInitialIntake, setRequiresInitialIntake] = useState(true);
  const [editingIntakeFromProfile, setEditingIntakeFromProfile] = useState(false);
  const [intakeSnapshot, setIntakeSnapshot] = useState<IntakeSnapshot | null>(null);
  const [intakeHistory, setIntakeHistory] = useState<IntakeHistoryEntry[]>([]);
  const [permissionStatuses, setPermissionStatuses] = useState<
    Partial<Record<NativePermissionKind, NativePermissionStatus>>
  >({});
  const [showConnectedWalkthrough, setShowConnectedWalkthrough] = useState(false);
  const [connectedWalkthroughCompletedAt, setConnectedWalkthroughCompletedAt] = useState<
    string | null
  >(null);

  // Handle journeyhealth://auth/reset-password deep links
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      if (parsed.path === "auth/reset-password") {
        const fragment = event.url.split("#")[1] ?? "";
        const params = new URLSearchParams(fragment);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          void supabase.auth
            .setSession({ access_token: accessToken, refresh_token: refreshToken })
            .then(() => setShowPasswordReset(true));
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);
    // Check if app was launched from a reset link
    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  const handlePermissionRequest = async (permission: NativePermissionKind) => {
    const status = await requestNativePermission(permission);
    setPermissionStatuses((previous) => ({ ...previous, [permission]: status }));
    return status;
  };

  const refreshIntakeState = async (
    internalPatientId: string,
    options?: { preserveExistingOnError?: boolean }
  ) => {
    setLoadingIntake(true);
    setIntakeGateError(null);

    try {
      const latest = await fetchLatestPatientIntake(internalPatientId);
      const snapshot = snapshotFromLatest(latest);
      setIntakeSnapshot(snapshot);
      setIntakeHistory(intakeHistoryFromLatest(latest));
      setRequiresInitialIntake(!snapshot);
      setConnectedWalkthroughCompletedAt(
        latest.profile?.connectedFeaturesWalkthroughCompletedAt || null
      );
    } catch (error) {
      setIntakeGateError(error instanceof Error ? error.message : "Failed to load intake data.");
      if (!options?.preserveExistingOnError) {
        setRequiresInitialIntake(true);
        setIntakeSnapshot(null);
        setIntakeHistory([]);
        setConnectedWalkthroughCompletedAt(null);
      }
    } finally {
      setLoadingIntake(false);
    }
  };

  useEffect(() => {
    if (!session) {
      setActiveTab("navigator");
      setLoadingIntake(false);
      setIntakeGateError(null);
      setRequiresInitialIntake(true);
      setEditingIntakeFromProfile(false);
      setIntakeSnapshot(null);
      setIntakeHistory([]);
      setShowConnectedWalkthrough(false);
      setConnectedWalkthroughCompletedAt(null);
      return;
    }

    void refreshIntakeState(session.internalPatientId);
  }, [session]);

  useEffect(() => {
    if (!session || requiresInitialIntake) {
      setShowConnectedWalkthrough(false);
      return;
    }

    setShowConnectedWalkthrough(!connectedWalkthroughCompletedAt);
  }, [session, requiresInitialIntake, connectedWalkthroughCompletedAt]);

  const completeConnectedWalkthrough = () => {
    if (!session) {
      setShowConnectedWalkthrough(false);
      return;
    }

    const completedAt = new Date().toISOString();
    setConnectedWalkthroughCompletedAt(completedAt);
    setShowConnectedWalkthrough(false);

    void setConnectedFeaturesWalkthroughState({
      userId: session.internalPatientId,
      completed: true
    }).catch(() => {
      // Local state already set; network retry can occur on a future refresh.
    });
  };

  const tabItems = useMemo(
    () => [
      { key: "navigator" as const, label: "Navigator", icon: "⌂" },
      { key: "store" as const, label: "Store", icon: "◉" },
      { key: "medical" as const, label: "Medical", icon: "✚" },
      { key: "profile" as const, label: "Profile", icon: "◎" }
    ],
    []
  );

  const handleIntakeCompleted = (result: {
    payload: PatientIntakePayload;
    submittedAt: string;
    changeLog: string[];
  }) => {
    const snapshot: IntakeSnapshot = {
      createdAt: result.submittedAt,
      submissionContext: result.payload.submissionContext || "INITIAL",
      changeLog: result.changeLog,
      healthPhilosophyPreference: result.payload.healthPhilosophyPreference,
      interestLocationState: result.payload.interestLocationState,
      dob: result.payload.dob,
      sex: result.payload.sex,
      genderIdentity: result.payload.genderIdentity,
      medicalDiagnoses: result.payload.medicalDiagnoses,
      medications: result.payload.medications,
      medicationAllergies: result.payload.medicationAllergies,
      environmentalAllergies: result.payload.environmentalAllergies,
      socialHistory: result.payload.socialHistory,
      diet: result.payload.diet,
      exercise: result.payload.exercise,
      sleep: result.payload.sleep,
      stressors: result.payload.stressors,
      healthGoals: result.payload.healthGoals,
      healthConcerns: result.payload.healthConcerns,
      lifestyleScores: intakeSnapshot?.lifestyleScores
    };

    setIntakeSnapshot(snapshot);
    setRequiresInitialIntake(false);
    setEditingIntakeFromProfile(false);
    setActiveTab("navigator");
    setIntakeHistory((previous) => [
      {
        submittedAt: result.submittedAt,
        context: result.payload.submissionContext || "INITIAL",
        changeLog: result.changeLog
      },
      ...previous
    ]);

    if (session) {
      void refreshIntakeState(session.internalPatientId, { preserveExistingOnError: true });
    }
  };

  // Show loading splash while restoring session from SecureStore
  if (isLoading) {
    return (
      <FeatureFlagProvider flags={featureFlags}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loadingState}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              accessibilityLabel="Journey Health Navigator logo"
            />
            <ActivityIndicator
              size="large"
              color={journeyPalette.spruce}
              style={styles.loadingIndicator}
            />
          </View>
        </SafeAreaView>
      </FeatureFlagProvider>
    );
  }

  // Password reset deep link — show form before checking session
  if (showPasswordReset) {
    return (
      <FeatureFlagProvider flags={featureFlags}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              accessibilityLabel="Journey Health Navigator logo"
            />
            <View>
              <Text style={styles.title}>Journey Health Navigator</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.screenContent}>
            <PasswordResetHandler onComplete={() => setShowPasswordReset(false)} />
          </ScrollView>
        </SafeAreaView>
      </FeatureFlagProvider>
    );
  }

  return (
    <FeatureFlagProvider flags={featureFlags}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            accessibilityLabel="Journey Health Navigator logo"
          />
          <View>
            <Text style={styles.title}>Journey Health Navigator</Text>
          </View>
        </View>

        {!session ? (
          <ScrollView contentContainerStyle={styles.screenContent}>
            <LoginGate />
          </ScrollView>
        ) : requiresInitialIntake ? (
          <ScrollView contentContainerStyle={styles.screenContent}>
            {loadingIntake ? (
              <View style={styles.inlineLoadingState}>
                <ActivityIndicator size="small" color={journeyPalette.spruce} />
                <Text style={styles.inlineLoadingText}>Syncing profile in background...</Text>
              </View>
            ) : null}
            {intakeGateError ? <Text style={styles.errorText}>{intakeGateError}</Text> : null}
            <IntakeWizard
              userId={session.internalPatientId}
              patientUserId={session.patientUserId}
              showInternalUserId={session.role === "ADMIN"}
              mode="initial"
              onCompleted={handleIntakeCompleted}
            />
          </ScrollView>
        ) : editingIntakeFromProfile ? (
          <ScrollView contentContainerStyle={styles.screenContent}>
            <IntakeWizard
              userId={session.internalPatientId}
              patientUserId={session.patientUserId}
              showInternalUserId={session.role === "ADMIN"}
              mode="profile"
              initialData={snapshotToInitialData(intakeSnapshot)}
              onCompleted={handleIntakeCompleted}
              onCancel={() => setEditingIntakeFromProfile(false)}
            />
          </ScrollView>
        ) : (
          <View style={styles.appBody}>
            {loadingIntake ? (
              <View style={styles.backgroundSyncBanner}>
                <ActivityIndicator size="small" color={journeyPalette.spruce} />
                <Text style={styles.backgroundSyncText}>Refreshing profile data...</Text>
              </View>
            ) : null}
            <View style={styles.tabContent}>
              <View style={[styles.tabPane, activeTab !== "navigator" && styles.tabPaneHidden]}>
                <NavigatorDashboard
                  patientUserId={session.patientUserId}
                  internalPatientId={session.internalPatientId}
                  intakeSnapshot={intakeSnapshot}
                  lifestyleScores={intakeSnapshot?.lifestyleScores}
                  permissionStatuses={permissionStatuses}
                  onRequestPermission={handlePermissionRequest}
                  showConnectedWalkthrough={showConnectedWalkthrough}
                  onCompleteConnectedWalkthrough={completeConnectedWalkthrough}
                  isActive={activeTab === "navigator"}
                />
              </View>

              <View style={[styles.tabPane, activeTab !== "store" && styles.tabPaneHidden]}>
                <StoreHub
                  internalPatientId={session.internalPatientId}
                  patientUserId={session.patientUserId}
                  email={session.email}
                  snapshot={intakeSnapshot}
                />
              </View>

              <View style={[styles.tabPane, activeTab !== "medical" && styles.tabPaneHidden]}>
                <WithFeatureFlag
                  flag="telehealth"
                  fallback={<ComingSoonFeature title="Telehealth" message="Video visits unlock in Phase 2." />}
                >
                  <ComingSoonFeature title="Telehealth" message="Feature flag is enabled for this build." live />
                </WithFeatureFlag>
                <View style={styles.medicalSpacer} />
                <WithFeatureFlag
                  flag="prescriptions"
                  fallback={<ComingSoonFeature title="Prescriptions" message="DoseSpot eRx unlocks in Phase 2." />}
                >
                  <ComingSoonFeature title="Prescriptions" message="Feature flag is enabled for this build." live />
                </WithFeatureFlag>
              </View>

              <View style={[styles.tabPane, activeTab !== "profile" && styles.tabPaneHidden]}>
                <ProfileHub
                  email={session.email}
                  patientUserId={session.patientUserId}
                  internalPatientId={session.internalPatientId}
                  role={session.role}
                  snapshot={intakeSnapshot}
                  onRequestPermission={handlePermissionRequest}
                  permissionStatuses={permissionStatuses}
                  onEditIntake={() => setEditingIntakeFromProfile(true)}
                  onSignOut={() => { void signOut(); }}
                />
              </View>
            </View>
            <View style={styles.tabBar}>
              {tabItems.map((tab) => {
                const selected = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    style={styles.tabButton}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Text style={[styles.tabIcon, selected && styles.tabLabelSelected]}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </SafeAreaView>
    </FeatureFlagProvider>
  );
}

function ComingSoonFeature({
  title,
  message,
  live = false
}: {
  title: string;
  message: string;
  live?: boolean;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureGraphicWrap}>
        <View style={styles.featureCone} />
        <View style={styles.featureCranePole} />
        <View style={styles.featureCraneArm} />
        <View style={styles.featureStripe} />
        <View style={styles.featureStripeAlt} />
      </View>
      <Text style={styles.featureBadge}>{live ? "Live Flag" : "Coming Soon"}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: journeyPalette.white
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 74, 61, 0.1)"
  },
  logo: {
    width: 44,
    height: 44
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    color: journeyPalette.spruce
  },
  screenContent: {
    padding: 16,
    paddingBottom: 28
  },
  appBody: {
    flex: 1
  },
  tabContent: {
    flex: 1,
    padding: 14
  },
  backgroundSyncBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8
  },
  backgroundSyncText: {
    color: journeyPalette.sage,
    fontWeight: "600",
    fontSize: 12
  },
  tabPane: {
    flex: 1
  },
  tabPaneHidden: {
    display: "none"
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(46, 74, 61, 0.15)",
    backgroundColor: journeyPalette.white,
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIcon: {
    color: journeyPalette.sage,
    fontSize: 15,
    marginBottom: 2
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: journeyPalette.sage
  },
  tabLabelSelected: {
    color: journeyPalette.spruce
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingIndicator: {
    marginTop: 24
  },
  loadingText: {
    marginTop: 8,
    color: journeyPalette.spruce,
    fontWeight: "600"
  },
  inlineLoadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  inlineLoadingText: {
    color: journeyPalette.sage,
    fontWeight: "600",
    fontSize: 12
  },
  errorText: {
    marginBottom: 8,
    color: journeyPalette.clay,
    fontWeight: "600"
  },
  featureCard: {
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)",
    borderRadius: 16,
    backgroundColor: journeyPalette.white,
    padding: 16,
    overflow: "hidden"
  },
  medicalSpacer: {
    height: 12
  },
  featureGraphicWrap: {
    height: 110,
    borderRadius: 14,
    backgroundColor: "rgba(141, 163, 153, 0.15)",
    marginBottom: 10,
    overflow: "hidden"
  },
  featureCone: {
    position: "absolute",
    bottom: 12,
    left: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 58,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: journeyPalette.clay
  },
  featureCranePole: {
    position: "absolute",
    right: 36,
    bottom: 12,
    width: 8,
    height: 74,
    borderRadius: 4,
    backgroundColor: journeyPalette.spruce
  },
  featureCraneArm: {
    position: "absolute",
    right: 36,
    top: 20,
    width: 88,
    height: 8,
    borderRadius: 4,
    backgroundColor: journeyPalette.spruce
  },
  featureStripe: {
    position: "absolute",
    right: 58,
    top: 18,
    width: 10,
    height: 74,
    backgroundColor: "rgba(194, 91, 86, 0.65)",
    transform: [{ rotate: "18deg" }]
  },
  featureStripeAlt: {
    position: "absolute",
    right: 82,
    top: 20,
    width: 10,
    height: 74,
    backgroundColor: "rgba(46, 74, 61, 0.65)",
    transform: [{ rotate: "18deg" }]
  },
  featureBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(141, 163, 153, 0.2)",
    color: journeyPalette.spruce,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700"
  },
  featureTitle: {
    marginTop: 8,
    color: journeyPalette.spruce,
    fontSize: 20,
    fontWeight: "700"
  },
  featureText: {
    marginTop: 6,
    color: journeyPalette.spruce
  }
});
