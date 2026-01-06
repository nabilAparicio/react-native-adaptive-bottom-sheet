# React Native Adaptive Bottom Sheet

A flexible, self-measuring, gesture-driven adaptive bottom sheet for React Native with keyboard avoidance and smooth animations.

## Features

✨ **Adaptive Height** - Automatically measures content or use fixed height
🎯 **Gesture Driven** - Smooth drag-to-close gesture with spring animations
⌨️ **Keyboard Avoidance** - Optional keyboard handling
🎨 **Customizable** - Custom headers, themes, and styling
🚀 **Performance** - Built with Reanimated 3 for 60fps animations
📱 **Safe Areas** - Respects device safe areas automatically
🎭 **Portal Based** - Renders above all content using portal system

## Installation

```bash
npm install react-native-adaptive-bottom-sheet
# or
yarn add react-native-adaptive-bottom-sheet
# or
pnpm install react-native-adaptive-bottom-sheet
```

### Peer Dependencies

This library requires the following peer dependencies:

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-worklets react-native-svg
```

Make sure to follow the setup instructions for each:
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)

**Important:** Your app must have `GestureHandlerRootView` and `SafeAreaProvider` set up at the root level.

## Usage

### Basic Setup

First, ensure your app has the required providers at the root level:

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

**Note:** If you already have `GestureHandlerRootView` and `SafeAreaProvider` in your app (which is common), you can just add `AdaptiveBottomSheetProvider` inside them.

### Automatic Dependency Validation

The library automatically validates that all required peer dependencies are installed and properly configured. If any dependency is missing or not configured correctly, you'll receive a helpful error message with instructions on how to fix it.

This ensures you don't run into runtime errors due to missing dependencies!

### Basic Example

```tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { 
  useBottomSheet, 
  AdaptiveBottomSheet 
} from 'react-native-adaptive-bottom-sheet';

function MyComponent() {
  const bottomSheet = useBottomSheet();

  return (
    <View style={styles.container}>
      <Button 
        title="Open Bottom Sheet" 
        onPress={() => bottomSheet.openSheet()} 
      />

      <AdaptiveBottomSheet bottomSheetInstance={bottomSheet}>
        <View style={styles.content}>
          <Text style={styles.title}>Hello Bottom Sheet!</Text>
          <Text>This content adapts to its size automatically.</Text>
        </View>
      </AdaptiveBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
```

### Advanced Examples

#### Fixed Height Bottom Sheet

```tsx
<AdaptiveBottomSheet 
  bottomSheetInstance={bottomSheet}
  fixedHeight={400}
>
  <YourContent />
</AdaptiveBottomSheet>
```

#### With Max Height

```tsx
<AdaptiveBottomSheet 
  bottomSheetInstance={bottomSheet}
  maxHeight={600}
>
  <YourContent />
</AdaptiveBottomSheet>
```

#### With Custom Header

```tsx
<AdaptiveBottomSheet 
  bottomSheetInstance={bottomSheet}
  headerComponent={
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Custom Header</Text>
    </View>
  }
>
  <YourContent />
</AdaptiveBottomSheet>
```

#### With Keyboard Avoidance

```tsx
<AdaptiveBottomSheet 
  bottomSheetInstance={bottomSheet}
  avoidKeyboard={true}
>
  <TextInput placeholder="Type something..." />
  <YourContent />
</AdaptiveBottomSheet>
```

#### Disable Backdrop Dismiss

```tsx
<AdaptiveBottomSheet 
  bottomSheetInstance={bottomSheet}
  disableBackdropDismiss={true}
>
  <YourContent />
</AdaptiveBottomSheet>
```

#### With onDismiss Callback

```tsx
<AdaptiveBottomSheet 
  bottomSheetInstance={bottomSheet}
  onDismiss={() => {
    console.log('Bottom sheet was dismissed');
  }}
>
  <YourContent />
</AdaptiveBottomSheet>
```

## Style Extension Safety

`AdaptiveBottomSheet` supports style overrides via the `styles` prop (by slot). These overrides are merged with the internal defaults.

### Allowed vs reserved style keys

Some style keys are **reserved** because they are controlled by internal animations/layout. Overriding them can break transitions or gestures.

- **Reserved keys (sheet)**: `transform`, `opacity`, `position`, `zIndex`, `bottom`, `top`, `left`, `right`
- **Reserved keys (backdrop)**: `opacity`, `position`, `zIndex`, `top`, `left`, `right`, `bottom`

If you override any reserved keys, the library will emit a **development warning** indicating the slot and the forbidden keys detected.

### Good example

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={bottomSheet}
  styles={{
    sheet: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    backdrop: { backgroundColor: 'rgba(0,0,0,0.6)' },
  }}
/>
```

### Bad example (will warn in dev)

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={bottomSheet}
  styles={{
    sheet: { position: 'relative', transform: [{ translateY: 999 }] },
  }}
/>
```

## Responsive Mode (Tablet Dialog)

You can make the component responsive by switching its presentation based on screen width.

- **Phones**: behaves like the current bottom sheet.
- **Tablets**: renders as a centered dialog (same content/API, different presentation).

### Props

- `mode`: `'bottomSheet' | 'dialog' | 'auto'` (default: `auto`)
- `tabletBreakpoint`: `number` (default: `768`)
- `dialogDragToClose`: `boolean` (default: `true`)

### Example

```tsx
<AdaptiveBottomSheet
  bottomSheetInstance={bottomSheet}
  mode="auto"
  tabletBreakpoint={768}
  dialogDragToClose={false}
>
  <YourContent />
</AdaptiveBottomSheet>
```

## API Reference

### `useBottomSheet(initialValue?: boolean)`

Hook that returns a controller object for managing the bottom sheet.

**Returns:**
- `isOpen` - Boolean indicating if sheet is open
- `openSheet(callback?: Function)` - Opens the bottom sheet
- `closeSheet(callback?: Function)` - Closes the bottom sheet
- `toggleSheet(callback?: Function)` - Toggles the bottom sheet
- `instanceID` - Unique ID for the sheet instance

### `AdaptiveBottomSheet` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to display in the bottom sheet |
| `bottomSheetInstance` | `BottomSheetHook` | **required** | Controller from `useBottomSheet` |
| `maxHeight` | `number` | screen height - 90 | Maximum height for the sheet |
| `fixedHeight` | `number` | `undefined` | Fixed height (ignores content measurement) |
| `headerComponent` | `ReactNode` | `undefined` | Custom header component |
| `hideCloseButton` | `boolean` | `false` | Hide the default close button |
| `disableBackdropDismiss` | `boolean` | `false` | Prevent closing on backdrop press |
| `avoidKeyboard` | `boolean` | `false` | Enable keyboard avoidance |
| `onDismiss` | `Function` | `undefined` | Callback when sheet is dismissed |
| `darkMode` | `boolean` | `false` | Enables dark theme defaults |
| `styles` | `BottomSheetStyleOverrides` | `undefined` | Style overrides by slot (`backdrop`, `sheet`, `header`, `content`, `closeButton`) |
| `renderCloseIcon` | `(params: { isDark: boolean }) => ReactNode` | `undefined` | Custom close icon renderer |
| `closeButtonProps` | `Omit<TouchableOpacityProps, 'onPress' | 'style'>` | `undefined` | Props forwarded to the close button |
| `mode` | `'bottomSheet' \| 'dialog' \| 'auto'` | `auto` | Presentation mode (`auto` switches at `tabletBreakpoint`) |
| `tabletBreakpoint` | `number` | `768` | Width breakpoint for `auto` mode |
| `dialogDragToClose` | `boolean` | `true` | Enables drag-to-close gesture in dialog mode |

### `AdaptiveBottomSheetProvider`

Wrapper component required at the root of your app. Provides gesture handler and safe area context.

## How It Works

1. **Self-Measuring**: The bottom sheet automatically measures its content height and adjusts accordingly
2. **Gesture Control**: Drag down to close with smooth spring animations
3. **Portal Rendering**: Renders in a portal layer above all other content
4. **Safe Areas**: Automatically respects device safe areas (notches, home indicators)
5. **Keyboard Support**: Optional keyboard avoidance pushes sheet up when keyboard appears

## TypeScript Support

This library is written in TypeScript and includes complete type definitions.

## Requirements

- React Native >= 0.64.0
- React >= 16.8.0
- react-native-gesture-handler >= 2.0.0
- react-native-reanimated >= 3.0.0
- react-native-safe-area-context >= 4.0.0
- react-native-worklets >= 0.5.0
- react-native-svg >= 13.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Nabil Aparicio

## Support

If you find this library useful, please consider giving it a ⭐️ on GitHub!
