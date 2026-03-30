import { StyleSheet, Text, View } from "react-native";

type SplashHeaderProps = {
	title: string;
	subtitle: string;
};

export default function SplashHeader({ title, subtitle }: SplashHeaderProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.subtitle}>{subtitle}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 24,
	},
	title: {
		color: "#F7F1E8",
		fontSize: 24,
		fontWeight: "700",
		textAlign: "center",
		letterSpacing: 0.3,
	},
	subtitle: {
		color: "#E7D6C9",
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
	},
});
