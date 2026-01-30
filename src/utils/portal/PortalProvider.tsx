import React, { useCallback, useState } from 'react';
import PortalContext from './PortalContext';
interface PortalProviderProps {
	children: React.ReactNode;
}
interface Element {
	name: string;
	component: React.ReactNode;
}
const PortalProvider: React.FC<PortalProviderProps> = ({ children }) => {
	const [components, setComponents] = useState<Record<string, React.ReactNode>>({});
	const addComponent = useCallback(({ name, component }: Element) => {
		setComponents((prevComponents) => ({
			...prevComponents,
			[name]: component
		}));
	}, []);
	const removeComponent = useCallback((name: string) => {
		setComponents((prevComponents) => {
			const newComponents = { ...prevComponents };
			delete newComponents[name];
			return newComponents;
		});
	}, []);
	return (
		<PortalContext.Provider value={{ addComponent, removeComponent }}>
			<React.Fragment>{children}</React.Fragment>
			<React.Fragment>
				{Object.entries(components).map(([name, Component]) => Component)}
			</React.Fragment>
		</PortalContext.Provider>
	);
};
export default PortalProvider;
