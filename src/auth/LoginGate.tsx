import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { journeyPalette } from "@journey/ui";
import { signInWithEmail, signUpWithEmail, resetPassword } from "./useSupabaseAuth";

export type { AuthSession } from "./useSupabaseAuth";

type Mode = "signIn" | "signUp" | "forgotPassword";

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Email or password is incorrect. Please try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Check your inbox to confirm your email before signing in.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email exists. Try signing in instead.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  return message;
}

export default function LoginGate() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const resetFields = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setConfirmationSent(false);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: authError } = await signInWithEmail(email.trim(), password);
    setSubmitting(false);
    if (authError) {
      setError(mapAuthError(authError.message));
    }
    // On success, useSupabaseAuth's onAuthStateChange updates session automatically
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: authError } = await signUpWithEmail(email.trim(), password);
    setSubmitting(false);
    if (authError) {
      setError(mapAuthError(authError.message));
    } else {
      setConfirmationSent(true);
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: authError } = await resetPassword(email.trim());
    setSubmitting(false);
    if (authError) {
      setError(mapAuthError(authError.message));
    } else {
      setConfirmationSent(true);
    }
  };

  const handleSubmit = () => {
    if (mode === "signIn") void handleSignIn();
    else if (mode === "signUp") void handleSignUp();
    else void handleForgotPassword();
  };

  const titles: Record<Mode, string> = {
    signIn: "Sign In",
    signUp: "Create Account",
    forgotPassword: "Reset Password"
  };

  const buttonLabels: Record<Mode, string> = {
    signIn: "Sign In",
    signUp: "Create Account",
    forgotPassword: "Send Reset Email"
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titles[mode]}</Text>
      <Text style={styles.subtitle}>
        {mode === "forgotPassword"
          ? "Enter your email and we'll send a reset link."
          : "Use your account to continue."}
      </Text>

      {confirmationSent && mode === "signUp" ? (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            Check your email to confirm your account, then sign in.
          </Text>
          <Pressable onPress={() => resetFields("signIn")}>
            <Text style={styles.link}>Back to Sign In</Text>
          </Pressable>
        </View>
      ) : confirmationSent && mode === "forgotPassword" ? (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            Password reset email sent. Check your inbox.
          </Text>
          <Pressable onPress={() => resetFields("signIn")}>
            <Text style={styles.link}>Back to Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            editable={!submitting}
          />

          {mode !== "forgotPassword" ? (
            <>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                editable={!submitting}
              />
            </>
          ) : null}

          {mode === "signUp" ? (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                value={confirmPassword}
                secureTextEntry
                onChangeText={setConfirmPassword}
                editable={!submitting}
              />
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={journeyPalette.white} />
            ) : (
              <Text style={styles.buttonText}>{buttonLabels[mode]}</Text>
            )}
          </Pressable>

          <View style={styles.modeLinks}>
            {mode === "signIn" ? (
              <>
                <Pressable onPress={() => resetFields("forgotPassword")}>
                  <Text style={styles.link}>Forgot password?</Text>
                </Pressable>
                <Pressable onPress={() => resetFields("signUp")}>
                  <Text style={styles.link}>Create an account</Text>
                </Pressable>
              </>
            ) : mode === "signUp" ? (
              <Pressable onPress={() => resetFields("signIn")}>
                <Text style={styles.link}>Already have an account? Sign in</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => resetFields("signIn")}>
                <Text style={styles.link}>Back to Sign In</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.2)"
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: journeyPalette.spruce
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: journeyPalette.sage
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "600",
    color: journeyPalette.spruce
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(46, 74, 61, 0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff"
  },
  error: {
    marginTop: 6,
    color: journeyPalette.clay
  },
  button: {
    marginTop: 10,
    backgroundColor: journeyPalette.spruce,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: journeyPalette.white,
    fontWeight: "700"
  },
  modeLinks: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8
  },
  link: {
    color: journeyPalette.spruce,
    fontWeight: "600",
    fontSize: 13,
    textDecorationLine: "underline"
  },
  confirmationBox: {
    marginTop: 8,
    gap: 10
  },
  confirmationText: {
    color: journeyPalette.spruce,
    fontWeight: "500"
  }
});
