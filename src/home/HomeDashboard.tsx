import { ScrollView, StyleSheet, Text, View } from "react-native";
import { journeyPalette } from "@journey/ui";
import NavigatorDashboard from "../navigator/NavigatorDashboard";
import NextStepsCard, { type NextStep } from "./NextStepsCard";
import type { IntakeSnapshot } from "../intake/types";
import type { NativePermissionKind, NativePermissionStatus } from "../permissions/nativeSettings";

type LifestyleScores = {
  diet?: number;
  exercise?: number;
  sleep?: number;
  stress?: number;
};

type HomeDashboardSession = {
  email: string;
  patientUserId: string;
  internalPatientId: string;
  role: "PATIENT" | "ADMIN";
};

type HomeDashboardProps = {
  session: HomeDashboardSession;
  intakeSnapshot: IntakeSnapshot | null;
  lifestyleScores?: LifestyleScores;
  connectedWalkthroughCompletedAt: string | null;
  permissionStatuses: Partial<Record<NativePermissionKind, NativePermissionStatus>>;
  onRequestPermission: (permission: NativePermissionKind) => Promise<NativePermissionStatus>;
  showConnectedWalkthrough: boolean;
  onCompleteConnectedWalkthrough: () => void;
  onStartIntake: () => void;
  onStartConnectedWalkthrough: () => void;
  isActive: boolean;
};

function greetingText(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function displayName(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function HomeDashboard({
  session,
  intakeSnapshot,
  lifestyleScores,
  connectedWalkthroughCompletedAt,
  permissionStatuses,
  onRequestPermission,
  showConnectedWalkthrough,
  onCompleteConnectedWalkthrough,
  onStartIntake,
  onStartConnectedWalkthrough,
  isActive
}: HomeDashboardProps) {
  const hasIntake = intakeSnapshot !== null;
  const hasConnected = connectedWalkthroughCompletedAt !== null;
  const hasGoals = (intakeSnapshot?.healthGoals?.length ?? 0) > 0;

  const steps: NextStep[] = [
    {
      key: "intake",
      label: "Complete health intake",
      description: "Tell us about your health history, medications, and goals.",
      completed: hasIntake,
      onPress: onStartIntake
    },
    {
      key: "connect",
      label: "Connect Apple Health",
      description: "Sync activity, sleep, and heart rate data from your devices.",
      completed: hasConnected,
      onPress: onStartConnectedWalkthrough
    },
    {
      key: "goals",
      label: "Set health goals",
      description: "Choose what matters most — weight, energy, sleep, or stress.",
      completed: hasGoals,
      onPress: onStartIntake
    },
    {
      key: "meal",
      label: "Log your first meal",
      description: "Snap a photo or search to start tracking nutrition.",
      completed: false,
      onPress: () => {
        // v1: meal logging is visible below in the Navigator section
      }
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          {greetingText()}, {displayName(session.email)}
        </Text>
        <Text style={styles.greetingSub}>Here's your health journey at a glance.</Text>
      </View>

      <NextStepsCard steps={steps} />

      {hasIntake ? (
        <NavigatorDashboard
          patientUserId={session.patientUserId}
          internalPatientId={session.internalPatientId}
          intakeSnapshot={intakeSnapshot}
          lifestyleScores={lifestyleScores}
          permissionStatuses={permissionStatuses}
          onRequestPermission={onRequestPermission}
          showConnectedWalkthrough={showConnectedWalkthrough}
          onCompleteConnectedWalkthrough={onCompleteConnectedWalkthrough}
          isActive={isActive}
          renderAsSection
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120
  },
  greeting: {
    marginBottom: 16
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "700",
    color: journeyPalette.spruce
  },
  greetingSub: {
    marginTop: 4,
    fontSize: 14,
    color: journeyPalette.sage
  }
});
