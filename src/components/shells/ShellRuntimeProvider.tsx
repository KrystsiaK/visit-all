"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ShellRuntimeState = Record<string, unknown>;

interface ShellRuntimeContextValue {
  shellId: string;
  state: ShellRuntimeState;
  setValue: (key: string, value: unknown) => void;
  patchState: (patch: Partial<ShellRuntimeState>) => void;
  resetState: () => void;
  registerScrollContainer: (element: HTMLElement | null) => void;
  registerWidgetElement: (widgetKey: string, element: HTMLElement | null) => void;
  scrollWidgetToCenter: (widgetKey: string) => void;
}

const ShellRuntimeContext = createContext<ShellRuntimeContextValue | null>(null);

export function ShellRuntimeProvider({
  shellId,
  initialState,
  children,
}: {
  shellId: string;
  initialState?: ShellRuntimeState;
  children: ReactNode;
}) {
  const resolvedInitialState = useMemo(
    () => initialState ?? {},
    [initialState]
  );
  const [state, setState] = useState<ShellRuntimeState>(resolvedInitialState);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const widgetElementsRef = useRef(new Map<string, HTMLElement>());

  const setValue = useCallback((key: string, value: unknown) => {
    setState((currentState) => {
      if (currentState[key] === value) {
        return currentState;
      }

      return {
        ...currentState,
        [key]: value,
      };
    });
  }, []);

  const patchState = useCallback((patch: Partial<ShellRuntimeState>) => {
    setState((currentState) => ({
      ...currentState,
      ...patch,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(resolvedInitialState);
  }, [resolvedInitialState]);

  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    scrollContainerRef.current = element;
  }, []);

  const registerWidgetElement = useCallback((widgetKey: string, element: HTMLElement | null) => {
    if (!element) {
      widgetElementsRef.current.delete(widgetKey);
      return;
    }

    widgetElementsRef.current.set(widgetKey, element);
  }, []);

  const scrollWidgetToCenter = useCallback((widgetKey: string) => {
    const scrollContainer = scrollContainerRef.current;
    const widgetElement = widgetElementsRef.current.get(widgetKey);

    if (!scrollContainer || !widgetElement) {
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const widgetRect = widgetElement.getBoundingClientRect();
    const containerCenterY = containerRect.height / 2;
    const widgetCenterY = widgetRect.top - containerRect.top + widgetRect.height / 2;
    const nextTop = scrollContainer.scrollTop + widgetCenterY - containerCenterY;

    scrollContainer.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    });
  }, []);

  const value = useMemo(
    () => ({
      shellId,
      state,
      setValue,
      patchState,
      resetState,
      registerScrollContainer,
      registerWidgetElement,
      scrollWidgetToCenter,
    }),
    [patchState, registerScrollContainer, registerWidgetElement, resetState, scrollWidgetToCenter, setValue, shellId, state]
  );

  return (
    <ShellRuntimeContext.Provider value={value}>
      {children}
    </ShellRuntimeContext.Provider>
  );
}

export function useShellRuntime() {
  const context = useContext(ShellRuntimeContext);

  if (!context) {
    throw new Error("useShellRuntime must be used within a ShellRuntimeProvider");
  }

  return context;
}

export function useShellRuntimeValue<T>(key: string, fallback: T): T {
  const { state } = useShellRuntime();
  const value = state[key];

  return (value === undefined ? fallback : (value as T));
}

export function useShellRuntimeActions() {
  const {
    setValue,
    patchState,
    resetState,
    registerScrollContainer,
    registerWidgetElement,
    scrollWidgetToCenter,
  } = useShellRuntime();

  return {
    setValue,
    patchState,
    resetState,
    registerScrollContainer,
    registerWidgetElement,
    scrollWidgetToCenter,
  };
}
