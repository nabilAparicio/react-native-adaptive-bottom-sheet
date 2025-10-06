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

## Usage

### Basic Setup

Wrap your app with the `AdaptiveBottomSheetProvider`:

```tsx
import { AdaptiveBottomSheetProvider } from 'react-native-adaptive-bottom-sheet';

export default function App() {
  return (
    <AdaptiveBottomSheetProvider>
      {/* Your app content */}
    </AdaptiveBottomSheetProvider>
  );
}
```

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

- React Native >= 0.81.4
- React >= 19.1.0
- react-native-gesture-handler >= 2.28.0
- react-native-reanimated >= 4.1.2
- react-native-safe-area-context >= 5.6.0
- react-native-worklets >= 0.5.1
- react-native-svg >= 15.13.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Nabil Aparicio

## Support

If you find this library useful, please consider giving it a ⭐️ on GitHub!
