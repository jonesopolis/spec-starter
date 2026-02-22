import { Pressable, StyleSheet, Text, View } from "react-native";
import { journeyPalette } from "@journey/ui";

export type NextStep = {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  onPress: () => void;
};

type NextStepsCardProps = {
  steps: NextStep[];
};

export default function NextStepsCard({ steps }: NextStepsCardProps) {
  const allComplete = steps.length > 0 && steps.every((s) => s.completed);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Next Steps</Text>
      {allComplete ? (
        <View style={styles.allSetBanner}>
          <Text style={styles.allSetText}>
            ✓ You're all set! Your health dashboard is fully configured.
          </Text>
        </View>
      ) : null}
      {steps.map((step, index) => (
        <Pressable
          key={step.key}
          style={[styles.stepRow, index < steps.length - 1 && styles.stepRowBorder]}
          onPress={step.completed ? undefined : step.onPress}
        >
          <View style={[styles.indicator, step.completed && styles.indicatorDone]}>
            <Text style={[styles.indicatorText, step.completed && styles.indicatorTextDone]}>
              {step.completed ? "✓" : String(index + 1)}
            </Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={[styles.stepLabel, step.completed && styles.stepLabelDone]}>
              {step.label}
            </Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
          {!step.completed ? (
            <Text style={styles.stepArrow}>›</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)",
    backgroundColor: journeyPalette.white,
    padding: 16,
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: journeyPalette.spruce,
    marginBottom: 12
  },
  allSetBanner: {
    backgroundColor: "rgba(46, 74, 61, 0.08)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  allSetText: {
    color: journeyPalette.spruce,
    fontWeight: "600",
    fontSize: 14
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12
  },
  stepRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 74, 61, 0.08)"
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: journeyPalette.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  indicatorDone: {
    backgroundColor: journeyPalette.spruce,
    borderColor: journeyPalette.spruce
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: "700",
    color: journeyPalette.sage
  },
  indicatorTextDone: {
    color: journeyPalette.white
  },
  stepBody: {
    flex: 1
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: journeyPalette.spruce,
    marginBottom: 2
  },
  stepLabelDone: {
    color: journeyPalette.sage
  },
  stepDescription: {
    fontSize: 12,
    color: journeyPalette.sage,
    lineHeight: 16
  },
  stepArrow: {
    fontSize: 20,
    color: journeyPalette.sage,
    fontWeight: "300"
  }
});
