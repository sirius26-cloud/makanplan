// Keep the native safeguard, but allow React Native Web to map Pressable className values.
// Buttons and choice chips rely on this mapping for their visual styles in web exports.
import { Platform, Pressable } from "react-native";
import { remapProps } from "nativewind";

if (Platform.OS !== "web") {
  remapProps(Pressable, { className: false });
}
