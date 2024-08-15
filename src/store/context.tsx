import { createContext, useState, useContext, FC, ReactNode } from "react";
import type { FeatureCollection } from "geojson";

interface AppState {
  collection: FeatureCollection;
}

interface AppContextProps {
  state: AppState;
  setCollection: (feature: FeatureCollection) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    collection: {
      type: "FeatureCollection",
      features: [],
    },
  });

  const setCollection = (feature: FeatureCollection) =>
    setState((prevState) => ({ ...prevState, collection: feature }));

  return (
    <AppContext.Provider value={{ state, setCollection }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
