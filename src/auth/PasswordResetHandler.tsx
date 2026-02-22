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
import { supabase } from "../lib/supabase";

type PasswordResetHandlerProps = {
  onComplete: () => void;
};

export default function PasswordResetHandler({ onComplete }: PasswordResetHandlerProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Password Updated</Text>
        <Text style={styles.subtitle}>Your password has been set. You are now signed in.</Text>
        <Pressable style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>Continue to App</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Set New Password</Text>
      <Text style={styles.subtitle}>Choose a new password for your account.</Text>

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        editable={!submitting}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
        editable={!submitting}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={() => { void handleSubmit(); }}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color={journeyPalette.white} />
        ) : (
          <Text style={styles.buttonText}>Set Password</Text>
        )}
      </Pressable>
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
  }
});
