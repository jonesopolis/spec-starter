import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { journeyPalette } from "@journey/ui";
import MealLogger, { type NutritionSignals } from "./MealLogger";
import {
  fetchAiRecommendations,
  type RecommendationItem
} from "../api/recommendations";
import {
  fetchWearableExerciseSummary,
  type WearableExerciseSummary
} from "../health/wearableSync";
import type { IntakeSnapshot } from "../intake/types";
import type { NativePermissionKind, NativePermissionStatus } from "../permissions/nativeSettings";

type LifestyleScores = {
  diet?: number;
  exercise?: number;
  sleep?: number;
  stress?: number;
};

type NavigatorDashboardProps = {
  patientUserId: string;
  internalPatientId: string;
  intakeSnapshot: IntakeSnapshot | null;
  lifestyleScores?: LifestyleScores;
  permissionStatuses: Partial<Record<NativePermissionKind, NativePermissionStatus>>;
  onRequestPermission: (
    permission: NativePermissionKind
  ) => Promise<NativePermissionStatus>;
  showConnectedWalkthrough: boolean;
  onCompleteConnectedWalkthrough: () => void;
  isActive: boolean;
  renderAsSection?: boolean;
};

type NavigatorSection = "RECOMMENDATIONS" | "NUTRITION" | "EXERCISE" | "SLEEP" | "STRESS";

type ExerciseLog = {
  id: string;
  type: string;
  minutes: number;
  loggedAt: string;
};

const connectedWalkthroughOrder: NativePermissionKind[] = [
  "camera",
  "notifications",
  "location",
  "healthData"
];

const exerciseOptions = [
  "Aerobics",
  "Badminton",
  "Barre",
  "Basketball",
  "Boxing",
  "Calisthenics",
  "Circuit Training",
  "CrossFit",
  "Cycling",
  "Dance",
  "Elliptical",
  "Golf",
  "Hiking",
  "HIIT",
  "Indoor Rowing",
  "Jogging",
  "Jump Rope",
  "Martial Arts",
  "Mobility Work",
  "Padel",
  "Pilates",
  "Pickleball",
  "Powerlifting",
  "Rock Climbing",
  "Rowing",
  "Running",
  "Skiing",
  "Soccer",
  "Spin",
  "Stair Climber",
  "Strength Training",
  "Stretching",
  "Surfing",
  "Swimming",
  "Tennis",
  "Trail Running",
  "Volleyball",
  "Walking",
  "Weightlifting",
  "Yoga",
  "Other"
].sort((a, b) => a.localeCompare(b));

const sectionTabs: Array<{ key: NavigatorSection; label: string; icon: string }> = [
  { key: "RECOMMENDATIONS", label: "Recommendations", icon: "AI" },
  { key: "NUTRITION", label: "Nutrition", icon: "N" },
  { key: "EXERCISE", label: "Exercise", icon: "E" },
  { key: "SLEEP", label: "Sleep", icon: "SL" },
  { key: "STRESS", label: "Stress", icon: "ST" }
];

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

function normalizeScore(score?: number) {
  if (typeof score !== "number") {
    return undefined;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function summarizeLifestyle(lifestyleScores?: LifestyleScores) {
  const values = [
    normalizeScore(lifestyleScores?.diet),
    normalizeScore(lifestyleScores?.exercise),
    normalizeScore(lifestyleScores?.sleep),
    normalizeScore(lifestyleScores?.stress)
  ].filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return 60;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function computeNutritionQuality(signals: NutritionSignals | null) {
  if (!signals || signals.calories <= 0) {
    return 60;
  }

  let score = 100;
  if (signals.calories < 1200 || signals.calories > 3400) {
    score -= 20;
  }

  const proteinPct = (signals.proteinG * 4) / Math.max(1, signals.calories);
  const carbsPct = (signals.carbsG * 4) / Math.max(1, signals.calories);
  const fatPct = (signals.fatG * 9) / Math.max(1, signals.calories);

  if (proteinPct < 0.15 || proteinPct > 0.4) {
    score -= 10;
  }
  if (carbsPct < 0.2 || carbsPct > 0.7) {
    score -= 10;
  }
  if (fatPct < 0.15 || fatPct > 0.45) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeSleepQuality(snapshot: IntakeSnapshot | null, lifestyleScores?: LifestyleScores) {
  if (typeof snapshot?.sleep?.sleepQuality === "number") {
    return Math.max(0, Math.min(100, Math.round(snapshot.sleep.sleepQuality * 10)));
  }
  return normalizeScore(lifestyleScores?.sleep) ?? 60;
}

function computeStressQuality(snapshot: IntakeSnapshot | null, lifestyleScores?: LifestyleScores) {
  const fromLifestyle = normalizeScore(lifestyleScores?.stress);
  if (typeof fromLifestyle === "number") {
    return fromLifestyle;
  }

  const stressors = snapshot?.stressors || [];
  if (stressors.length === 0) {
    return 65;
  }

  const averageEffect =
    stressors
      .map((entry) => (typeof entry.effectScore === "number" ? entry.effectScore : 0))
      .reduce((sum, value) => sum + value, 0) / stressors.length;

  return Math.max(0, Math.min(100, Math.round((10 - averageEffect) * 10)));
}

function computeHealthScore(input: {
  lifestyleScores?: LifestyleScores;
  snapshot: IntakeSnapshot | null;
  nutritionSignals: NutritionSignals | null;
  healthPermissionStatus?: NativePermissionStatus;
  wearableSummary: WearableExerciseSummary | null;
}) {
  const lifestyleScore = summarizeLifestyle(input.lifestyleScores);
  const nutritionScore = computeNutritionQuality(input.nutritionSignals);
  const sleepScore = computeSleepQuality(input.snapshot, input.lifestyleScores);
  const stressScore = computeStressQuality(input.snapshot, input.lifestyleScores);
  const labScore = 60;
  const wearableMinutes = input.wearableSummary?.totals.minutes || 0;
  const wearableSteps = input.wearableSummary?.totals.steps || 0;
  const wearableScore =
    input.healthPermissionStatus === "granted"
      ? Math.min(95, 55 + Math.round(wearableMinutes / 15) + Math.round(wearableSteps / 2500))
      : 55;

  const weighted =
    lifestyleScore * 0.35 +
    nutritionScore * 0.25 +
    sleepScore * 0.15 +
    stressScore * 0.1 +
    labScore * 0.1 +
    wearableScore * 0.05;

  return {
    total: Math.max(0, Math.min(100, Math.round(weighted))),
    breakdown: {
      lifestyle: lifestyleScore,
      nutrition: nutritionScore,
      sleep: sleepScore,
      stress: stressScore,
      labs: labScore,
      wearable: wearableScore
    }
  };
}

function qualityBand(score: number) {
  if (score >= 85) {
    return "Excellent";
  }
  if (score >= 70) {
    return "Good";
  }
  if (score >= 55) {
    return "Developing";
  }
  return "Needs attention";
}

function recommendationChipStyle(category: RecommendationItem["category"]) {
  switch (category) {
    case "EXERCISE":
      return "rgba(78, 122, 106, 0.2)";
    case "SLEEP":
      return "rgba(141, 163, 153, 0.28)";
    case "STRESS":
      return "rgba(194, 91, 86, 0.16)";
    case "SAFETY":
      return "rgba(194, 91, 86, 0.22)";
    default:
      return "rgba(46, 74, 61, 0.16)";
  }
}

export default function NavigatorDashboard({
  patientUserId,
  internalPatientId,
  intakeSnapshot,
  lifestyleScores,
  permissionStatuses,
  onRequestPermission,
  showConnectedWalkthrough,
  onCompleteConnectedWalkthrough,
  isActive,
  renderAsSection = false
}: NavigatorDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavigatorSection>("RECOMMENDATIONS");
  const [nutritionSignals, setNutritionSignals] = useState<NutritionSignals | null>(null);

  const [connectedSetupStatus, setConnectedSetupStatus] = useState<string | null>(null);
  const [connectedSetupActive, setConnectedSetupActive] = useState(false);
  const connectedWalkthroughStarted = useRef(false);

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationSource, setRecommendationSource] = useState<"llm" | "fallback" | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("30");
  const [wearableSummary, setWearableSummary] = useState<WearableExerciseSummary | null>(null);
  const [wearableLoading, setWearableLoading] = useState(false);

  const healthScore = useMemo(
    () =>
      computeHealthScore({
        lifestyleScores,
        snapshot: intakeSnapshot,
        nutritionSignals,
        healthPermissionStatus: permissionStatuses.healthData,
        wearableSummary
      }),
    [intakeSnapshot, lifestyleScores, nutritionSignals, permissionStatuses.healthData, wearableSummary]
  );

  const topExerciseTypes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of exerciseLogs) {
      counts.set(log.type, (counts.get(log.type) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type]) => type);
  }, [exerciseLogs]);

  const visibleExerciseOptions = useMemo(() => {
    if (topExerciseTypes.length === 0) {
      return exerciseOptions;
    }

    const top = topExerciseTypes.filter((type) => exerciseOptions.includes(type));
    const remaining = exerciseOptions.filter((option) => !top.includes(option));
    return [...top, ...remaining];
  }, [topExerciseTypes]);

  const weeklyExerciseMinutes = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const manual = exerciseLogs
      .filter((entry) => now - new Date(entry.loggedAt).getTime() <= sevenDaysMs)
      .reduce((sum, entry) => sum + entry.minutes, 0);
    const wearable = wearableSummary?.days.slice(-7).reduce((sum, day) => sum + day.minutes, 0) || 0;
    return Math.round(manual + wearable);
  }, [exerciseLogs, wearableSummary]);

  const weeklySteps = useMemo(() => {
    return Math.round(
      wearableSummary?.days.slice(-7).reduce((sum, day) => sum + day.steps, 0) || 0
    );
  }, [wearableSummary]);

  const sleepHours = intakeSnapshot?.sleep?.averageHoursPerNight;
  const sleepAwakenings = intakeSnapshot?.sleep?.averageAwakeningsPerNight;
  const sleepQuality = intakeSnapshot?.sleep?.sleepQuality;

  const stressors = intakeSnapshot?.stressors || [];
  const topStressors = [...stressors]
    .sort((a, b) => (b.effectScore || 0) - (a.effectScore || 0))
    .slice(0, 5);

  useEffect(() => {
    if (!showConnectedWalkthrough) {
      connectedWalkthroughStarted.current = false;
      setConnectedSetupStatus(null);
      setConnectedSetupActive(false);
      return;
    }

    if (!isActive || connectedWalkthroughStarted.current) {
      return;
    }

    connectedWalkthroughStarted.current = true;
    setConnectedSetupActive(true);

    let cancelled = false;

    const runWalkthrough = async () => {
      for (const permission of connectedWalkthroughOrder) {
        if (cancelled) {
          return;
        }

        setConnectedSetupStatus(`Requesting ${permission} permission...`);
        await onRequestPermission(permission);
        await delay(250);
      }

      if (cancelled) {
        return;
      }

      setConnectedSetupStatus("Connected feature setup complete.");
      setConnectedSetupActive(false);
      onCompleteConnectedWalkthrough();
    };

    void runWalkthrough();

    return () => {
      cancelled = true;
    };
  }, [
    isActive,
    onCompleteConnectedWalkthrough,
    onRequestPermission,
    showConnectedWalkthrough
  ]);

  useEffect(() => {
    if (!isActive || activeSection !== "RECOMMENDATIONS") {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setRecommendationsLoading(true);
      setRecommendationError(null);

      try {
        const result = await fetchAiRecommendations({
          internalPatientId,
          patientUserId,
          snapshot: intakeSnapshot,
          nutritionSignals
        });

        if (cancelled) {
          return;
        }

        setRecommendations(result.items);
        setRecommendationSource(result.source);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setRecommendationError(error instanceof Error ? error.message : "Recommendation fetch failed.");
      } finally {
        if (!cancelled) {
          setRecommendationsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    activeSection,
    intakeSnapshot,
    internalPatientId,
    isActive,
    nutritionSignals,
    patientUserId
  ]);

  useEffect(() => {
    if (!isActive || permissionStatuses.healthData !== "granted") {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setWearableLoading(true);

      const summary = await fetchWearableExerciseSummary(permissionStatuses.healthData);
      if (!cancelled) {
        setWearableSummary(summary);
        setWearableLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isActive, permissionStatuses.healthData]);

  const addExerciseLog = () => {
    const selectedType = exerciseType.trim();
    const minutes = Number(exerciseMinutes);

    if (!selectedType || !Number.isFinite(minutes) || minutes <= 0) {
      return;
    }

    setExerciseLogs((previous) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: selectedType,
        minutes,
        loggedAt: new Date().toISOString()
      },
      ...previous
    ]);

    setExerciseMinutes("30");
  };

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI-Driven Recommendations</Text>
      <Text style={styles.sectionText}>
        Personalized recommendations generated from intake, meal logs, and connected data.
      </Text>
      {recommendationsLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={journeyPalette.spruce} />
          <Text style={styles.sectionText}>Generating recommendations...</Text>
        </View>
      ) : null}
      {recommendationError ? <Text style={styles.errorText}>{recommendationError}</Text> : null}
      {!recommendationsLoading && recommendations.length === 0 ? (
        <Text style={styles.sectionText}>No recommendations available yet. Add more profile and nutrition data.</Text>
      ) : null}
      {recommendationSource ? (
        <Text style={styles.sourceBadge}>Source: {recommendationSource === "llm" ? "LLM" : "Fallback"}</Text>
      ) : null}
      {recommendations.map((item, index) => (
        <View key={`${item.title}-${index}`} style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationPriority}>{item.priority}</Text>
            <Text style={[styles.recommendationCategory, { backgroundColor: recommendationChipStyle(item.category) }]}> 
              {item.category}
            </Text>
          </View>
          <Text style={styles.recommendationTitle}>{item.title}</Text>
          <Text style={styles.recommendationDetail}>{item.detail}</Text>
          {item.rationale ? <Text style={styles.recommendationRationale}>Why: {item.rationale}</Text> : null}
        </View>
      ))}
    </View>
  );

  const renderExercise = () => {
    const grouped = new Map<string, number>();
    for (const log of exerciseLogs) {
      grouped.set(log.type, (grouped.get(log.type) || 0) + log.minutes);
    }

    const typeTotals = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);
    const maxMinutes = Math.max(1, ...typeTotals.map((row) => row[1]));

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wearable Exercise Feed</Text>
          <Text style={styles.sectionText}>
            Apple HealthKit / Health Connect exercise data appears here after connection.
          </Text>
          {wearableLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={journeyPalette.spruce} />
              <Text style={styles.sectionText}>Syncing wearable activity...</Text>
            </View>
          ) : null}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Health sync status</Text>
            <Text style={styles.metricValue}>{permissionStatuses.healthData || "not requested"}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Last 7 day minutes</Text>
            <Text style={styles.metricValue}>{weeklyExerciseMinutes}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Last 7 day steps</Text>
            <Text style={styles.metricValue}>{weeklySteps}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Data source</Text>
            <Text style={styles.metricValue}>{wearableSummary?.source || "none"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Exercise Log</Text>
          {topExerciseTypes.length > 0 ? (
            <Text style={styles.sectionText}>Frequently used: {topExerciseTypes.join(", ")}</Text>
          ) : null}

          <Text style={styles.inputLabel}>Exercise type</Text>
          <Pressable style={styles.selectButton} onPress={() => setExercisePickerOpen((previous) => !previous)}>
            <Text style={styles.selectValue}>{exerciseType || "Select type"}</Text>
          </Pressable>
          {exercisePickerOpen ? (
            <ScrollView style={styles.selectMenu} nestedScrollEnabled>
              {visibleExerciseOptions.map((option) => (
                <Pressable
                  key={option}
                  style={styles.selectMenuItem}
                  onPress={() => {
                    setExerciseType(option);
                    setExercisePickerOpen(false);
                  }}
                >
                  <Text style={styles.selectMenuItemText}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <Text style={styles.inputLabel}>Minutes</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={exerciseMinutes}
            onChangeText={setExerciseMinutes}
            placeholder="30"
          />

          <Pressable style={styles.primaryButton} onPress={addExerciseLog}>
            <Text style={styles.primaryButtonText}>Add Exercise</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Exercise Trends</Text>
          {typeTotals.length === 0 ? (
            <Text style={styles.sectionText}>No exercise logs yet.</Text>
          ) : (
            typeTotals.map(([type, minutes]) => (
              <View key={type} style={styles.trendRow}>
                <Text style={styles.trendLabel}>{type}</Text>
                <View style={styles.trendBarTrack}>
                  <View
                    style={[
                      styles.trendBarFill,
                      { width: `${Math.max(8, (minutes / maxMinutes) * 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.trendValue}>{minutes} min</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wearable Daily Trends (14 days)</Text>
          {!wearableSummary || wearableSummary.days.length === 0 ? (
            <Text style={styles.sectionText}>No wearable records available yet.</Text>
          ) : (
            wearableSummary.days.map((day) => (
              <View key={day.day} style={styles.trendRow}>
                <Text style={styles.trendLabel}>{day.day.slice(5)}</Text>
                <View style={styles.trendBarTrack}>
                  <View
                    style={[
                      styles.trendBarFill,
                      {
                        width: `${Math.max(8, Math.min(100, day.minutes * 1.6))}%`
                      }
                    ]}
                  />
                </View>
                <Text style={styles.trendValue}>{Math.round(day.minutes)} min / {Math.round(day.steps)} st</Text>
              </View>
            ))
          )}
        </View>
      </>
    );
  };

  const renderSleep = () => {
    const sleepScore = computeSleepQuality(intakeSnapshot, lifestyleScores);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Data</Text>
        <Text style={styles.sectionText}>Sleep score and trends based on intake and connected data.</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Sleep score</Text>
          <Text style={styles.metricValue}>{sleepScore}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Avg hours/night</Text>
          <Text style={styles.metricValue}>{typeof sleepHours === "number" ? toFixed(sleepHours) : "-"}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Avg awakenings/night</Text>
          <Text style={styles.metricValue}>{typeof sleepAwakenings === "number" ? toFixed(sleepAwakenings) : "-"}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Quality (0-10)</Text>
          <Text style={styles.metricValue}>{typeof sleepQuality === "number" ? toFixed(sleepQuality) : "-"}</Text>
        </View>
      </View>
    );
  };

  const renderStress = () => {
    const stressScore = computeStressQuality(intakeSnapshot, lifestyleScores);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stress Data</Text>
        <Text style={styles.sectionText}>Top stressors and severity from intake updates.</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Stress score</Text>
          <Text style={styles.metricValue}>{stressScore}</Text>
        </View>

        {topStressors.length === 0 ? (
          <Text style={styles.sectionText}>No stressors logged yet.</Text>
        ) : (
          topStressors.map((entry, index) => (
            <View key={`${entry.stressor || "stressor"}-${index}`} style={styles.stressorRow}>
              <Text style={styles.stressorTitle}>{entry.stressor || "Unnamed stressor"}</Text>
              <Text style={styles.stressorValue}>Impact {entry.effectScore}/10</Text>
            </View>
          ))
        )}
      </View>
    );
  };

  const Wrapper = renderAsSection ? View : ScrollView;
  const wrapperProps = renderAsSection
    ? { style: styles.content }
    : { contentContainerStyle: styles.content };

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.hero}>
        <View style={styles.heroOrbLeft} />
        <View style={styles.heroOrbRight} />
        <Text style={styles.heroKicker}>Navigator Dashboard</Text>
        <Text style={styles.heroTitle}>Personalized guidance and trend intelligence.</Text>
        <Text style={styles.heroText}>Patient: {patientUserId}</Text>
      </View>

      <View style={styles.sectionTabsWrap}>
        {sectionTabs.map((tab) => {
          const selected = activeSection === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.sectionTab, selected && styles.sectionTabSelected]}
              onPress={() => setActiveSection(tab.key)}
            >
              <View style={[styles.sectionTabIcon, selected && styles.sectionTabIconSelected]}>
                <Text style={[styles.sectionTabIconText, selected && styles.sectionTabIconTextSelected]}>{tab.icon}</Text>
              </View>
              <Text style={[styles.sectionTabLabel, selected && styles.sectionTabLabelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.healthScoreCard}>
        <Text style={styles.healthScoreTitle}>Health Score</Text>
        <Text style={styles.healthScoreValue}>{healthScore.total}</Text>
        <Text style={styles.healthScoreBand}>{qualityBand(healthScore.total)}</Text>
        <View style={styles.healthBreakdownGrid}>
          {Object.entries(healthScore.breakdown).map(([key, value]) => (
            <View key={key} style={styles.healthBreakdownTile}>
              <Text style={styles.healthBreakdownLabel}>{capitalize(key)}</Text>
              <Text style={styles.healthBreakdownValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {showConnectedWalkthrough || connectedSetupActive ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Features Setup</Text>
          <Text style={styles.sectionText}>
            Native permission prompts are running for camera, health sync, alerts, and local recommendations.
          </Text>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={journeyPalette.spruce} />
            <Text style={styles.sectionText}>{connectedSetupStatus || "Preparing native permission prompts..."}</Text>
          </View>
        </View>
      ) : null}

      {activeSection === "RECOMMENDATIONS" ? renderRecommendations() : null}
      {activeSection === "NUTRITION" ? (
        <MealLogger
          onRequestPermission={onRequestPermission}
          onNutritionSignalsChange={setNutritionSignals}
        />
      ) : null}
      {activeSection === "EXERCISE" ? renderExercise() : null}
      {activeSection === "SLEEP" ? renderSleep() : null}
      {activeSection === "STRESS" ? renderStress() : null}
    </Wrapper>
  );
}

function toFixed(value: number, digits = 1) {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }
  return rounded.toFixed(digits);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
    padding: 18,
    backgroundColor: journeyPalette.spruce,
    marginBottom: 12
  },
  heroOrbLeft: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(141, 163, 153, 0.22)",
    left: -80,
    top: -120
  },
  heroOrbRight: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: "rgba(194, 91, 86, 0.18)",
    right: -70,
    bottom: -100
  },
  heroKicker: {
    color: "rgba(249, 249, 247, 0.78)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1
  },
  heroTitle: {
    color: journeyPalette.white,
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700"
  },
  heroText: {
    color: "rgba(249, 249, 247, 0.92)",
    marginTop: 8
  },
  sectionTabsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  sectionTab: {
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: journeyPalette.white
  },
  sectionTabSelected: {
    borderColor: journeyPalette.sage,
    backgroundColor: "rgba(141, 163, 153, 0.18)"
  },
  sectionTabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.24)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  sectionTabIconSelected: {
    borderColor: journeyPalette.spruce,
    backgroundColor: "rgba(46, 74, 61, 0.12)"
  },
  sectionTabIconText: {
    color: journeyPalette.sage,
    fontWeight: "700",
    fontSize: 10
  },
  sectionTabIconTextSelected: {
    color: journeyPalette.spruce
  },
  sectionTabLabel: {
    color: journeyPalette.spruce,
    fontWeight: "600",
    fontSize: 12
  },
  sectionTabLabelSelected: {
    fontWeight: "700"
  },
  healthScoreCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)",
    backgroundColor: journeyPalette.white,
    padding: 14,
    marginBottom: 12
  },
  healthScoreTitle: {
    color: journeyPalette.spruce,
    fontSize: 16,
    fontWeight: "700"
  },
  healthScoreValue: {
    marginTop: 4,
    color: journeyPalette.spruce,
    fontSize: 34,
    fontWeight: "800"
  },
  healthScoreBand: {
    color: journeyPalette.sage,
    fontWeight: "700",
    marginBottom: 10
  },
  healthBreakdownGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  healthBreakdownTile: {
    width: "31%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.12)",
    padding: 8,
    backgroundColor: "rgba(141, 163, 153, 0.08)"
  },
  healthBreakdownLabel: {
    color: journeyPalette.sage,
    fontSize: 11,
    fontWeight: "700"
  },
  healthBreakdownValue: {
    marginTop: 2,
    color: journeyPalette.spruce,
    fontSize: 18,
    fontWeight: "700"
  },
  section: {
    backgroundColor: journeyPalette.white,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: journeyPalette.spruce,
    marginBottom: 8
  },
  sectionText: {
    color: journeyPalette.sage,
    marginBottom: 8
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sourceBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(141, 163, 153, 0.18)",
    color: journeyPalette.spruce,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden"
  },
  recommendationCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.15)",
    padding: 12,
    marginBottom: 10,
    backgroundColor: "rgba(249, 249, 247, 0.9)"
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  recommendationPriority: {
    color: journeyPalette.clay,
    fontSize: 11,
    fontWeight: "700"
  },
  recommendationCategory: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: journeyPalette.spruce,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden"
  },
  recommendationTitle: {
    color: journeyPalette.spruce,
    fontWeight: "700",
    marginBottom: 4
  },
  recommendationDetail: {
    color: journeyPalette.spruce
  },
  recommendationRationale: {
    marginTop: 6,
    color: journeyPalette.sage,
    fontSize: 12
  },
  errorText: {
    color: journeyPalette.clay,
    fontWeight: "600"
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 74, 61, 0.1)",
    paddingBottom: 6
  },
  metricLabel: {
    color: journeyPalette.spruce,
    fontWeight: "600"
  },
  metricValue: {
    color: journeyPalette.spruce,
    fontWeight: "700"
  },
  inputLabel: {
    color: journeyPalette.spruce,
    fontWeight: "600",
    marginBottom: 6
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8
  },
  selectValue: {
    color: journeyPalette.spruce,
    fontWeight: "600"
  },
  selectMenu: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)",
    borderRadius: 10,
    marginBottom: 8
  },
  selectMenuItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 74, 61, 0.08)"
  },
  selectMenuItemText: {
    color: journeyPalette.spruce
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.24)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: journeyPalette.spruce,
    backgroundColor: journeyPalette.white,
    marginBottom: 10
  },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: journeyPalette.spruce,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: journeyPalette.white,
    fontWeight: "700"
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  trendLabel: {
    width: 110,
    color: journeyPalette.spruce,
    fontSize: 12
  },
  trendBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(141, 163, 153, 0.2)",
    marginHorizontal: 8,
    overflow: "hidden"
  },
  trendBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: journeyPalette.spruce
  },
  trendValue: {
    width: 64,
    textAlign: "right",
    color: journeyPalette.spruce,
    fontWeight: "700",
    fontSize: 12
  },
  stressorRow: {
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.15)",
    borderRadius: 10,
    backgroundColor: "rgba(141, 163, 153, 0.08)",
    padding: 10,
    marginTop: 8
  },
  stressorTitle: {
    color: journeyPalette.spruce,
    fontWeight: "700"
  },
  stressorValue: {
    marginTop: 4,
    color: journeyPalette.sage
  }
});
