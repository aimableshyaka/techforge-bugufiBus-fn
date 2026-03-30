import { StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  style?: ViewStyle;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  style,
  error,
  autoCapitalize = "none",
}: InputFieldProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#A89080"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  label: {
    color: "#F7E8DA",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#5E3627",
    borderWidth: 1,
    borderColor: "#6C3F2C",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#F7E8DA",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#D32F2F",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
});
