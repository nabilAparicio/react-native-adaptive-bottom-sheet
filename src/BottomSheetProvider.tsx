import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from './utils';

interface PortalComponent {
	id: string;
	component: ReactNode;
}

interface PortalContextType {
	addComponent: (id: string, component: ReactNode) => void;
	removeComponent: (id: string) => void;
	components: PortalComponent[];
}

const PortalContext = React.createContext<PortalContextType>({
	addComponent: () => {},
	removeComponent: () => {},
	components: []
});

export const usePortal = () => {
	const context = React.useContext(PortalContext);
	if (!context) {
		throw new Error('usePortal must be used within a PortalProvider');
	}
	return context;
};

export default function BottomSheetProvider({ children }: { children: ReactNode }) {
	return (
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<PortalProvider>{children}</PortalProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	portalContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 9999
	},
	portalItem: {
		flex: 1
	}
});
