import { createContext, useContext } from "react";
import { StoreMobx } from "../store/store.mobx";

export let store: StoreMobx;
export const StoreContext = createContext(null);

export function useStore(): StoreMobx {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context as unknown as StoreMobx;
}

export function StoreProvider({
  children,
  initialState: initialData,
}: {
  children: JSX.Element;
  initialState: any;
}) {
  const store = initializeStore(initialData);
  return (
    // @ts-ignore
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

function initializeStore(initialData = {}) {
  const _store = store ?? new StoreMobx();

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
}
