import { Link } from "expo-router";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/signin">Sign in</Link>
      <Link href="/explore">explore</Link>
      <Link href="/profile">profile</Link>
      <Link href="/properties/1">property</Link>
    </View>
  );
}
