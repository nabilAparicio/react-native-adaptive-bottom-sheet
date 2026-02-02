# React Native Adaptive Bottom Sheet

A flexible, self-measuring, gesture-driven adaptive bottom sheet for React Native with multiple presentation modes, keyboard avoidance, and smooth animations.

## Features

- **Adaptive Height** - Automatically measures content or use fixed height
- **Multiple Presentation Modes** - Bottom sheet, dialog, sidebar, or auto-detect
- **Type-Safe Props** - Discriminated unions ensure you only use props valid for each mode
- **Gesture Driven** - Smooth drag-to-close gestures with spring animations
- **Keyboard Avoidance** - Optional keyboard handling
- **Customizable** - Custom headers, themes, and styling per slot
- **Performance** - Built with Reanimated 3 for 60fps animations
- **Safe Areas** - Respects device safe areas (configurable)
- **Portal Based** - Renders above all content using portal system

## Installation

```bash
npm install react-native-adaptive-bottom-sheet
# or
yarn add react-native-adaptive-bottom-sheet
# or
pnpm install react-native-adaptive-bottom-sheet
```

### Peer Dependencies

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-worklets react-native-svg
```

Follow the setup instructions for each:
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)

**Important:** Your app must have `GestureHandlerRootView` and `SafeAreaProvider` at the root level.

## Quick Start

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdaptiveBottomSheetProvider } from 'react-native-adaptive-bottom-sheet';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AdaptiveBottomSheetProvider>
          {/* Your app content */}
        </AdaptiveBottomSheetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

```tsx
import { useBottomSheet, AdaptiveBottomSheet } from 'react-native-adaptive-bottom-sheet';

function MyComponent() {
  const sheet = useBottomSheet();

  return (
    <>
      <Button title="Open" onPress={() => sheet.openSheet()} />

      <AdaptiveBottomSheet bottomSheetInstance={sheet}>
        <Text>Hello Bottom Sheet!</Text>
      </AdaptiveBottomSheet>
    </>
  );
}
```

## Presentation Modes

The component supports 4 presentation modes, each with its own specific props:

| Mode | Description | Specific Props |
|------|-------------|----------------|
| `bottomSheet` | Traditional sheet sliding from bottom | None |
| `dialog` | Centered modal dialog | `dialogDragToClose` |
| `sidebar` | Horizontal panel from left/right | `sidebarPosition`, `sidebarWidth`, `sidebarMinWidth`, `sidebarMaxWidth`, `sidebarDragToClose` |
| `auto` | Auto-selects based on screen width | All mode-specific props |

### Type-Safe Props by Mode

The library uses **discriminated unions** to ensure type safety. TypeScript will show an error if you try to use props that don't belong to the selected mode:

```tsx
// ✅ Correct - sidebar props with mode="sidebar"
<AdaptiveBottomSheet
  mode="sidebar"
  sidebarPosition="right"
  sidebarWidth={350}
/>

// ✅ Correct - dialog props with mode="dialog"
<AdaptiveBottomSheet
  mode="dialog"
  dialogDragToClose={false}
/>

// ❌ TypeScript Error - sidebarWidth doesn't exist on DialogModeProps
<AdaptiveBottomSheet
  mode="dialog"
  sidebarWidth={300}
/>

// ✅ Correct - mode="auto" accepts all props (runtime resolution)
<AdaptiveBottomSheet
  mode="auto"
  tabletBreakpoint={1024}
  dialogDragToClose={false}
  sidebarPosition="left"
/>
```

### Bottom Sheet Mode

Default mode. Slides up from the bottom of the screen.

```tsx
<AdaptiveBottomSheet
  mode="bottomSheet"
  bottomSheetInstance={sheet}
>
  <YourContent />
</AdaptiveBottomSheet>
```

### Dialog Mode

Centered modal with optional drag-to-close.

```tsx
<AdaptiveBottomSheet
  mode="dialog"
  bottomSheetInstance={sheet}
  dialogDragToClose={false}
>
  <YourContent />
</AdaptiveBottomSheet>
```

### Sidebar Mode

Horizontal panel that slides from left or right edge.

```tsx
<AdaptiveBottomSheet
  mode="sidebar"
  bottomSheetInstance={sheet}
  sidebarPosition="right"
  sidebarWidth={320}
  sidebarDragToClose={true}
>
  <NavigationMenu />
</AdaptiveBottomSheet>
```

### Auto Mode (Responsive)

Automatically switches between modes based on screen width:
- Width < breakpoint → `bottomSheet`
- Width >= breakpoint → `dialog`

```tsx
<AdaptiveBottomSheet
  mode="auto"
  bottomSheetInstance={sheet}
  tabletBreakpoint={768}
>
  <YourContent />
</AdaptiveBottomSheet>
```

## API Reference

### `useBottomSheet(initialValue?: boolean)`

Hook that returns a controller object for managing the bottom sheet.

```tsx
const sheet = useBottomSheet();

sheet.openSheet();           // Open the sheet
sheet.closeSheet();          // Close the sheet
sheet.toggleSheet();         // Toggle open/close
sheet.isOpen;                // Current state (boolean)
sheet.instanceID;            // Unique identifier
```

### Props

#### Common Props (All Modes)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to display |
| `bottomSheetInstance` | `BottomSheetHook` | **required** | Controller from `useBottomSheet` |
| `maxHeight` | `number` | screen - 90 | Maximum height |
| `fixedHeight` | `number` | - | Fixed height (disables auto-sizing) |
| `headerComponent` | `ReactNode` | - | Custom header |
| `hideCloseButton` | `boolean` | `false` | Hide close button |
| `disableBackdropDismiss` | `boolean` | `false` | Prevent backdrop tap dismiss |
| `avoidKeyboard` | `boolean` | `false` | Push up when keyboard opens |
| `onDismiss` | `() => void` | - | Callback on dismiss |
| `darkMode` | `boolean` | `false` | Enable dark theme |
| `styles` | `BottomSheetStyleOverrides` | - | Style overrides by slot |
| `renderCloseIcon` | `(params) => ReactNode` | - | Custom close icon |
| `closeButtonProps` | `TouchableOpacityProps` | - | Close button props |
| `tabletBreakpoint` | `number` | `768` | Width breakpoint for auto mode |
| `disableSafeArea` | `boolean` | `false` | Ignore safe area insets |

#### Dialog Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dialogDragToClose` | `boolean` | `true` | Enable vertical drag to dismiss |

#### Sidebar Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarPosition` | `'left' \| 'right'` | `'left'` | Which edge to slide from |
| `sidebarWidth` | `number` | - | Fixed width (overrides min/max) |
| `sidebarMinWidth` | `number` | `280` | Minimum width |
| `sidebarMaxWidth` | `number` | `400` | Maximum width |
| `sidebarDragToClose` | `boolean` | `true` | Enable horizontal drag to dismiss |

### Style Overrides

Customize appearance per slot:

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={sheet}
  styles={{
    backdrop: { backgroundColor: 'rgba(0,0,0,0.7)' },
    sheet: { backgroundColor: '#1a1a1a', borderRadius: 24 },
    header: { paddingHorizontal: 16 },
    content: { padding: 20 },
    closeButton: { opacity: 0.8 },
    sidebarContainer: { /* sidebar mode only */ },
  }}
/>
```

**Reserved keys** (controlled by animations, will warn if overridden):
- `sheet`: `transform`, `opacity`, `position`, `zIndex`, `bottom`, `top`, `left`, `right`
- `backdrop`: `opacity`, `position`, `zIndex`, `top`, `left`, `right`, `bottom`

### Safe Area Control

By default, the sheet respects device safe areas (notch, home indicator). Disable this when rendering inside a container that already handles insets:

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={sheet}
  disableSafeArea={true}
>
  <YourContent />
</AdaptiveBottomSheet>
```

### TypeScript Exports

```tsx
import {
  // Component & Hook
  AdaptiveBottomSheet,
  AdaptiveBottomSheetProvider,
  useBottomSheet,

  // Types
  type BottomSheetProps,           // Main discriminated union
  type CommonBottomSheetProps,     // Shared props
  type BottomSheetModeProps,       // mode="bottomSheet"
  type DialogModeProps,            // mode="dialog"
  type SidebarModeProps,           // mode="sidebar"
  type AutoModeProps,              // mode="auto"
  type BottomSheetStyleOverrides,
  type PresentationMode,
  type SidebarPosition,

  // Type Guards
  isSidebarMode,
  isDialogMode,
  isBottomSheetMode,
  isAutoMode,
} from 'react-native-adaptive-bottom-sheet';
```

## Examples

### Fixed Height

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={sheet}
  fixedHeight={400}
>
  <YourContent />
</AdaptiveBottomSheet>
```

### With Custom Header

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={sheet}
  headerComponent={
    <View style={styles.header}>
      <Text style={styles.title}>Settings</Text>
    </View>
  }
  hideCloseButton
>
  <YourContent />
</AdaptiveBottomSheet>
```

### Keyboard Avoidance

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={sheet}
  avoidKeyboard
>
  <TextInput placeholder="Type here..." />
</AdaptiveBottomSheet>
```

### Sidebar Navigation

```tsx
<AdaptiveBottomSheet
  mode="sidebar"
  bottomSheetInstance={menuSheet}
  sidebarPosition="left"
  sidebarWidth={280}
  darkMode
>
  <NavigationMenu onNavigate={() => menuSheet.closeSheet()} />
</AdaptiveBottomSheet>
```

### Responsive Modal

```tsx
<AdaptiveBottomSheet
  mode="auto"
  bottomSheetInstance={sheet}
  tabletBreakpoint={768}
  dialogDragToClose={false}
  maxHeight={500}
>
  <ModalContent />
</AdaptiveBottomSheet>
```

## Requirements

- React Native >= 0.64.0
- React >= 16.8.0
- react-native-gesture-handler >= 2.0.0
- react-native-reanimated >= 3.0.0
- react-native-safe-area-context >= 4.0.0
- react-native-worklets >= 0.5.0
- react-native-svg >= 13.0.0

## License

MIT
