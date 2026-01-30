import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  AdaptiveBottomSheet,
  useBottomSheet,
} from "react-native-adaptive-bottom-sheet";

export default function HomeScreen() {
  const basicSheet = useBottomSheet();
  const customSheet = useBottomSheet();
  const dialogSheet = useBottomSheet();
  const keyboardSheet = useBottomSheet();
  const sidebarLeft = useBottomSheet();
  const sidebarRight = useBottomSheet();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Bottom Sheet Demo</Text>
        <Text style={styles.subtitle}>react-native-adaptive-bottom-sheet</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <DemoButton
          title="Basic Bottom Sheet"
          description="Default configuration"
          onPress={() => basicSheet.openSheet()}
        />

        <DemoButton
          title="Custom Styled"
          description="With custom colors and styles"
          onPress={() => customSheet.openSheet()}
        />

        <DemoButton
          title="Dialog Mode"
          description="Centered modal on tablets"
          onPress={() => dialogSheet.openSheet()}
        />

        <DemoButton
          title="With Keyboard"
          description="Test keyboard avoidance"
          onPress={() => keyboardSheet.openSheet()}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sidebar Mode</Text>
        </View>

        <DemoButton
          title="Sidebar Left"
          description="Slides in from the left"
          onPress={() => sidebarLeft.openSheet()}
        />

        <DemoButton
          title="Sidebar Right"
          description="Slides in from the right"
          onPress={() => sidebarRight.openSheet()}
        />
      </ScrollView>

      {/* Basic Bottom Sheet */}
      <AdaptiveBottomSheet bottomSheetInstance={basicSheet}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Basic Bottom Sheet</Text>
          <Text style={styles.sheetText}>
            This is a basic bottom sheet with default settings. You can drag it
            down to dismiss or tap the backdrop.
          </Text>
        </View>
      </AdaptiveBottomSheet>

      {/* Custom Styled Bottom Sheet */}
      <AdaptiveBottomSheet
        bottomSheetInstance={customSheet}
        darkMode
        styles={{
          sheet: {
            backgroundColor: "#1a1a2e",
          },
          header: {
            borderBottomWidth: 1,
            borderBottomColor: "#333",
          },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: "#fff" }]}>
            Custom Styled
          </Text>
          <Text style={[styles.sheetText, { color: "#ccc" }]}>
            This sheet has custom dark styling applied through the styles prop.
          </Text>
        </View>
      </AdaptiveBottomSheet>

      {/* Dialog Mode Bottom Sheet */}
      <AdaptiveBottomSheet
        bottomSheetInstance={dialogSheet}
        mode="dialog"
        headerComponent={
          <View style={styles.customHeader}>
            <Text style={styles.customHeaderText}>Dialog Mode</Text>
          </View>
        }
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetText}>
            When mode is set to "dialog", the sheet appears as a centered modal.
            This is useful for tablet layouts.
          </Text>
          <Text style={styles.sheetText}>
            Try "auto" mode to automatically switch between bottomSheet and
            dialog based on screen width.
          </Text>
        </View>
      </AdaptiveBottomSheet>

      {/* Keyboard Avoidance Bottom Sheet */}
      <AdaptiveBottomSheet bottomSheetInstance={keyboardSheet} avoidKeyboard>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Keyboard Test</Text>
          <Text style={styles.sheetText}>
            Tap the input below to test keyboard avoidance:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type something..."
            placeholderTextColor="#999"
          />
        </View>
      </AdaptiveBottomSheet>

      {/* Sidebar Left */}
      <AdaptiveBottomSheet
        bottomSheetInstance={sidebarLeft}
        mode="sidebar"
        sidebarPosition="left"
        sidebarMinWidth={280}
        sidebarMaxWidth={350}
      >
        <View style={styles.sidebarContent}>
          <Text style={styles.sheetTitle}>Left Sidebar</Text>
          <Text style={styles.sheetText}>
            This sidebar slides in from the left side of the screen.
          </Text>
          <View style={styles.menuItems}>
            <MenuItem icon="🏠" label="Home" />
            <MenuItem icon="👤" label="Profile" />
            <MenuItem icon="⚙️" label="Settings" />
            <MenuItem icon="📱" label="Notifications" />
            <MenuItem icon="❓" label="Help" />
          </View>
          <Text style={styles.sheetText}>
            Drag horizontally to the left to dismiss, or tap the backdrop.
          </Text>
        </View>
      </AdaptiveBottomSheet>

      {/* Sidebar Right */}
      <AdaptiveBottomSheet
        bottomSheetInstance={sidebarRight}
        mode="sidebar"
        sidebarPosition="right"
        sidebarMinWidth={300}
        sidebarMaxWidth={400}
        darkMode
        styles={{
          sheet: {
            backgroundColor: "#1a1a2e",
          },
        }}
      >
        <View style={styles.sidebarContent}>
          <Text style={[styles.sheetTitle, { color: "#fff" }]}>
            Right Sidebar
          </Text>
          <Text style={[styles.sheetText, { color: "#ccc" }]}>
            This sidebar slides in from the right with dark mode styling.
          </Text>
          <View style={styles.menuItems}>
            <MenuItem icon="🛒" label="Cart" dark />
            <MenuItem icon="💳" label="Payment" dark />
            <MenuItem icon="📦" label="Orders" dark />
            <MenuItem icon="🎁" label="Rewards" dark />
          </View>
          <Text style={[styles.sheetText, { color: "#ccc" }]}>
            Drag horizontally to the right to dismiss.
          </Text>
        </View>
      </AdaptiveBottomSheet>
    </SafeAreaView>
  );
}

function DemoButton({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Text style={styles.buttonTitle}>{title}</Text>
      <Text style={styles.buttonDescription}>{description}</Text>
    </Pressable>
  );
}

function MenuItem({
  icon,
  label,
  dark = false,
}: {
  icon: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && (dark ? styles.menuItemPressedDark : styles.menuItemPressed),
      ]}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, dark && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonPressed: {
    backgroundColor: "#f0f0f0",
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  buttonDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sheetContent: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  sheetText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginBottom: 12,
  },
  customHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  customHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sidebarContent: {
    padding: 20,
    flex: 1,
  },
  menuItems: {
    marginVertical: 16,
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemPressed: {
    backgroundColor: "#f0f0f0",
  },
  menuItemPressedDark: {
    backgroundColor: "#333",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
});
