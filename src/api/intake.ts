import { fetchWithTimeout } from "./http";
import { supabase } from "../lib/supabase";

export type MedicationEntry = {
  name: string;
  dose?: string;
};

export type AllergyEntry = {
  allergen: string;
  reaction?: string;
};

export type SmokingStatus = "NO" | "YES" | "FORMER";
export type DrugUseStatus = "NO" | "YES" | "FORMER";

export type SocialHistory = {
  smokingStatus?: SmokingStatus;
  smokingPacksPerDay?: number;
  smokingQuitYear?: number;
  alcoholByDay?: Record<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    number
  >;
  illicitDrugStatus?: DrugUseStatus;
  illicitDrugsUsed?: string;
  illicitDrugQuitYear?: number;
};

export type DietPattern = {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
  calorieBeverages?: string;
};

export type ExerciseEntry = {
  type: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
};

export type SleepPattern = {
  averageHoursPerNight?: number;
  averageAwakeningsPerNight?: number;
  sleepQuality?: number;
};

export type StressorEntry = {
  stressor: string;
  effectScore: number;
};

export type HealthConcernEntry = {
  concern: string;
  details?: string;
};

export type IntakeSubmissionContext = "INITIAL" | "PROFILE_UPDATE";

export type PatientIntakePayload = {
  userId: string;
  healthPhilosophyPreference?: "TRADITIONAL" | "FUNCTIONAL" | "NATUROPATHY" | "BIOHACKING";
  interestLocationState?: string;
  dob?: string;
  sex?: string;
  genderIdentity?: string;
  medicalDiagnoses?: string[];
  medications?: MedicationEntry[];
  medicationAllergies?: AllergyEntry[];
  environmentalAllergies?: AllergyEntry[];
  socialHistory?: SocialHistory;
  diet?: DietPattern;
  exercise?: ExerciseEntry[];
  sleep?: SleepPattern;
  stressors?: StressorEntry[];
  healthGoals?: string[];
  healthConcerns?: HealthConcernEntry[];
  medicationsText?: string;
  allergiesText?: string;
  socialHistoryText?: string;
  lifestyleText?: string;
  dietText?: string;
  goalsText?: string;
  submissionContext?: IntakeSubmissionContext;
  changeLog?: string[];
};

export type LatestIntakeResponse = {
  profile: {
    userId: string;
    healthPhilosophyPreference?: PatientIntakePayload["healthPhilosophyPreference"];
    interestLocationState?: string;
    dob?: string;
    sex?: string;
    genderIdentity?: string;
    connectedFeaturesWalkthroughCompletedAt?: string | null;
  } | null;
  latestIntake: {
    id: string;
    createdAt: string;
    medicalDiagnoses?: string[];
    medications?: MedicationEntry[];
    medicationAllergies?: AllergyEntry[];
    environmentalAllergies?: AllergyEntry[];
    socialHistory?: SocialHistory;
    diet?: DietPattern;
    exercise?: ExerciseEntry[];
    sleep?: SleepPattern;
    stressors?: StressorEntry[];
    healthGoals?: string[];
    healthConcerns?: HealthConcernEntry[];
    lifestyleScores?: {
      diet?: number;
      exercise?: number;
      sleep?: number;
      stress?: number;
    };
    submissionContext?: IntakeSubmissionContext;
    changeLog?: string[];
  } | null;
};

type LocalIntakeCacheEntry = {
  payload: PatientIntakePayload;
  createdAt: string;
  id: string;
  connectedFeaturesWalkthroughCompletedAt?: string | null;
};

const localIntakeCache = new Map<string, LocalIntakeCacheEntry>();
let preferredIntakeBaseUrl: string | null = null;

function isDevelopmentRuntime() {
  const nodeEnv = process.env.NODE_ENV;
  return (typeof __DEV__ !== "undefined" && __DEV__) || nodeEnv !== "production";
}

function cacheLocalIntake(payload: PatientIntakePayload, createdAt = new Date().toISOString()) {
  if (!payload.userId) {
    return;
  }
  const existing = localIntakeCache.get(payload.userId);
  localIntakeCache.set(payload.userId, {
    payload,
    createdAt,
    id: `local-${createdAt}`,
    connectedFeaturesWalkthroughCompletedAt:
      existing?.connectedFeaturesWalkthroughCompletedAt ?? null
  });
}

function cacheWalkthroughCompletion(userId: string, completedAt: string | null) {
  const existing = localIntakeCache.get(userId);
  if (!existing) {
    return;
  }

  localIntakeCache.set(userId, {
    ...existing,
    connectedFeaturesWalkthroughCompletedAt: completedAt
  });
}

function latestFromLocalCache(userId: string): LatestIntakeResponse | null {
  const cached = localIntakeCache.get(userId);
  if (!cached) {
    return null;
  }

  const payload = cached.payload;

  return {
    profile: {
      userId: payload.userId,
      healthPhilosophyPreference: payload.healthPhilosophyPreference,
      interestLocationState: payload.interestLocationState,
      dob: payload.dob,
      sex: payload.sex,
      genderIdentity: payload.genderIdentity,
      connectedFeaturesWalkthroughCompletedAt: cached.connectedFeaturesWalkthroughCompletedAt
    },
    latestIntake: {
      id: cached.id,
      createdAt: cached.createdAt,
      medicalDiagnoses: payload.medicalDiagnoses || [],
      medications: payload.medications || [],
      medicationAllergies: payload.medicationAllergies || [],
      environmentalAllergies: payload.environmentalAllergies || [],
      socialHistory: payload.socialHistory,
      diet: payload.diet,
      exercise: payload.exercise || [],
      sleep: payload.sleep,
      stressors: payload.stressors || [],
      healthGoals: payload.healthGoals || [],
      healthConcerns: payload.healthConcerns || [],
      submissionContext: payload.submissionContext,
      changeLog: payload.changeLog || []
    }
  };
}

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.filter(Boolean)));
}

function normalizeOptionalUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, "").trim();
  if (!unquoted || unquoted.toLowerCase() === "null" || unquoted.toLowerCase() === "undefined") {
    return "";
  }

  return unquoted;
}

async function intakeAuthHeaders(): Promise<Record<string, string>> {
  const anonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

  const headers: Record<string, string> = {};

  if (!anonKey) {
    return headers;
  }

  headers.apikey = anonKey;

  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    headers.Authorization = `Bearer ${accessToken ?? anonKey}`;
  } catch {
    headers.Authorization = `Bearer ${anonKey}`;
  }

  return headers;
}

function prioritizeIntakeUrls(urls: string[]) {
  if (!preferredIntakeBaseUrl || !urls.includes(preferredIntakeBaseUrl)) {
    return urls;
  }

  return [preferredIntakeBaseUrl, ...urls.filter((url) => url !== preferredIntakeBaseUrl)];
}

export function resolveIntakeUrl() {
  return resolveIntakeUrls()[0] || null;
}

export function resolveIntakeUrls() {
  const supabaseUrl = normalizeOptionalUrl(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const nodeEnv = process.env.NODE_ENV;
  const isDev = (typeof __DEV__ !== "undefined" && __DEV__) || nodeEnv !== "production";
  const explicitUrl = normalizeOptionalUrl(process.env.EXPO_PUBLIC_INTAKE_URL);
  const localEdgeUrls = [
    "http://127.0.0.1:54321/functions/v1/intake",
    "http://localhost:54321/functions/v1/intake",
    "http://10.0.2.2:54321/functions/v1/intake"
  ];

  if (explicitUrl) {
    return uniqueUrls([explicitUrl, ...(isDev ? localEdgeUrls : [])]);
  }

  if (!supabaseUrl) {
    if (isDev) {
      return uniqueUrls(localEdgeUrls);
    }
    return [];
  }

  try {
    const parsed = new URL(supabaseUrl);
    const trimmedBase = supabaseUrl.endsWith("/") ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const primary = `${trimmedBase}/functions/v1/intake`;

    // If we're pointed at hosted Supabase, prefer only hosted Edge URL.
    // Local fallbacks in this case can add avoidable timeout noise in dev.
    if (!isLocalhost) {
      return uniqueUrls([primary]);
    }

    return uniqueUrls([primary, ...(isDev ? localEdgeUrls : [])]);
  } catch (error) {
    if (isDev) {
      return uniqueUrls(localEdgeUrls);
    }
    return [];
  }
}

async function fetchWithFallback(
  urls: string[],
  buildUrl: (baseUrl: string) => string,
  init: RequestInit,
  timeoutMs: number
) {
  let lastResponse: Response | null = null;
  let lastNetworkError: Error | null = null;

  for (const baseUrl of urls) {
    try {
      const response = await fetchWithTimeout(buildUrl(baseUrl), init, timeoutMs);

      if (
        response.ok ||
        (response.status >= 400 && response.status < 500 && response.status !== 404)
      ) {
        preferredIntakeBaseUrl = baseUrl;
        return response;
      }

      lastResponse = response;
    } catch (error) {
      if (error instanceof Error) {
        lastNetworkError = error;
      } else {
        lastNetworkError = new Error("Network request failed.");
      }
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastNetworkError || new Error("Network request failed.");
}

export async function fetchLatestPatientIntake(userId: string): Promise<LatestIntakeResponse> {
  const intakeUrls = prioritizeIntakeUrls(resolveIntakeUrls());
  const isDev = isDevelopmentRuntime();
  const timeoutMs = isDev ? 5000 : 9000;
  const emptyState: LatestIntakeResponse = {
    profile: null,
    latestIntake: null
  };
  if (intakeUrls.length === 0) {
    if (isDev) {
      const cached = latestFromLocalCache(userId);
      if (cached) {
        return cached;
      }
      return emptyState;
    }
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL for Edge intake.");
  }

  const params = new URLSearchParams();
  params.set("userId", userId);

  let response: Response;
  try {
    response = await fetchWithFallback(
      intakeUrls,
      (baseUrl) => `${baseUrl}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(await intakeAuthHeaders())
        }
      },
      timeoutMs
    );
  } catch (error) {
    if (isDev) {
      const cached = latestFromLocalCache(userId);
      if (cached) {
        return cached;
      }
      return emptyState;
    }
    throw error;
  }

  if (!response.ok) {
    if (isDev) {
      const cached = latestFromLocalCache(userId);
      if (cached) {
        return cached;
      }
      return emptyState;
    }
    const errorBody = await response.text();
    throw new Error(`Intake fetch failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as LatestIntakeResponse;
}

export async function submitPatientIntake(payload: PatientIntakePayload) {
  const intakeUrls = prioritizeIntakeUrls(resolveIntakeUrls());
  const isDev = isDevelopmentRuntime();
  const timeoutMs = isDev ? 12000 : 9000;
  if (intakeUrls.length === 0) {
    if (isDev) {
      cacheLocalIntake(payload);
      return { id: "local-dev-intake", mode: "LOCAL_CACHE" };
    }
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL for Edge intake.");
  }

  let response: Response;
  try {
    response = await fetchWithFallback(intakeUrls, (baseUrl) => baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await intakeAuthHeaders())
      },
      body: JSON.stringify(payload)
    }, timeoutMs);
  } catch (error) {
    if (isDev) {
      cacheLocalIntake(payload);
      return { id: "local-dev-intake", mode: "LOCAL_CACHE" };
    }
    throw error;
  }

  if (!response.ok) {
    if (isDev && (response.status === 404 || response.status >= 500)) {
      cacheLocalIntake(payload);
      return { id: "local-dev-intake", mode: "LOCAL_CACHE" };
    }
    const errorBody = await response.text();
    throw new Error(`Intake submission failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  cacheLocalIntake(payload);
  return data;
}

export async function setConnectedFeaturesWalkthroughState({
  userId,
  completed
}: {
  userId: string;
  completed: boolean;
}) {
  const intakeUrls = prioritizeIntakeUrls(resolveIntakeUrls());
  const isDev = isDevelopmentRuntime();
  const timeoutMs = isDev ? 10000 : 9000;

  if (intakeUrls.length === 0) {
    if (isDev) {
      cacheWalkthroughCompletion(userId, completed ? new Date().toISOString() : null);
      return {
        status: "ok",
        connectedFeaturesWalkthroughCompletedAt: completed ? new Date().toISOString() : null
      };
    }
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL for Edge intake.");
  }

  let response: Response;
  try {
    response = await fetchWithFallback(intakeUrls, (baseUrl) => baseUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await intakeAuthHeaders())
      },
      body: JSON.stringify({
        userId,
        connectedFeaturesWalkthroughCompleted: completed
      })
    }, timeoutMs);
  } catch (error) {
    if (isDev) {
      cacheWalkthroughCompletion(userId, completed ? new Date().toISOString() : null);
      return {
        status: "ok",
        connectedFeaturesWalkthroughCompletedAt: completed ? new Date().toISOString() : null
      };
    }
    throw error;
  }

  if (!response.ok) {
    if (isDev && (response.status === 404 || response.status >= 500)) {
      cacheWalkthroughCompletion(userId, completed ? new Date().toISOString() : null);
      return {
        status: "ok",
        connectedFeaturesWalkthroughCompletedAt: completed ? new Date().toISOString() : null
      };
    }
    const errorBody = await response.text();
    throw new Error(`Walkthrough update failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    status: "ok";
    connectedFeaturesWalkthroughCompletedAt?: string | null;
  };

  cacheWalkthroughCompletion(
    userId,
    data.connectedFeaturesWalkthroughCompletedAt ?? (completed ? new Date().toISOString() : null)
  );

  return data;
}
