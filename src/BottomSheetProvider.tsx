import React, { ReactNode } from "react";
import { PortalProvider } from "./utils";
import DependencyValidator from "./utils/DependencyValidator";

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
  components: [],
});

export const usePortal = () => {
  const context = React.useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
};

/**
 * Provider component for AdaptiveBottomSheet.
 * Wraps the app to enable bottom sheet functionality with automatic dependency validation.
 *
 * @example
 * ```tsx
 * <AdaptiveBottomSheetProvider>
 *   <YourApp />
 * </AdaptiveBottomSheetProvider>
 * ```
 */
export default function BottomSheetProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DependencyValidator>
      <PortalProvider>{children}</PortalProvider>
    </DependencyValidator>
  );
}
