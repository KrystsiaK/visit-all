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

export interface TypedShellRuntime<TState extends ShellRuntimeState = ShellRuntimeState> {
  shellId: string;
  state: TState;
  setValue: <K extends string & keyof TState>(key: K, value: TState[K]) => void;
  patchState: (patch: Partial<TState>) => void;
  resetState: () => void;
  registerScrollContainer: (element: HTMLElement | null) => void;
  getScrollContainer: () => HTMLElement | null;
  registerWidgetElement: (widgetKey: string, element: HTMLElement | null) => void;
  scrollWidgetToCenter: (widgetKey: string) => void;
}

export type ShellRuntimeActions<TState extends ShellRuntimeState = ShellRuntimeState> = Omit<TypedShellRuntime<TState>, "shellId" | "state">;

interface ShellRuntimeContextValue {
  shellId: string;
  state: ShellRuntimeState;
  setValue: (key: string, value: unknown) => void;
  patchState: (patch: Partial<ShellRuntimeState>) => void;
  resetState: () => void;
  registerScrollContainer: (element: HTMLElement | null) => void;
  getScrollContainer: () => HTMLElement | null;
  registerWidgetElement: (widgetKey: string, element: HTMLElement | null) => void;
  scrollWidgetToCenter: (widgetKey: string) => void;
}

const ShellRuntimeContext = createContext<ShellRuntimeContextValue | null>(null);

export function ShellRuntimeProvider<TState extends ShellRuntimeState = ShellRuntimeState>({
  shellId,
  initialState,
  children,
}: {
  shellId: string;
  initialState?: TState;
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
    setState((currentState) => {
      const entries = Object.entries(patch);

      if (entries.every(([key, value]) => currentState[key] === value)) {
        return currentState;
      }

      return {
        ...currentState,
        ...patch,
      };
    });
  }, []);

  const resetState = useCallback(() => {
    setState(resolvedInitialState);
  }, [resolvedInitialState]);

  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    scrollContainerRef.current = element;
  }, []);

  const getScrollContainer = useCallback(() => scrollContainerRef.current, []);

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
      getScrollContainer,
      registerWidgetElement,
      scrollWidgetToCenter,
    }),
    [getScrollContainer, patchState, registerScrollContainer, registerWidgetElement, resetState, scrollWidgetToCenter, setValue, shellId, state]
  );

  return (
    <ShellRuntimeContext.Provider value={value}>
      {children}
    </ShellRuntimeContext.Provider>
  );
}

export function useShellRuntime<TState extends ShellRuntimeState = ShellRuntimeState>(): TypedShellRuntime<TState> {
  const context = useContext(ShellRuntimeContext);

  if (!context) {
    throw new Error("useShellRuntime must be used within a ShellRuntimeProvider");
  }

  return context as TypedShellRuntime<TState>;
}

export function useOptionalShellRuntime<TState extends ShellRuntimeState = ShellRuntimeState>(): TypedShellRuntime<TState> | null {
  return useContext(ShellRuntimeContext) as TypedShellRuntime<TState> | null;
}

export function useShellRuntimeValue<T>(key: string, fallback: T): T {
  const { state } = useShellRuntime();
  const value = state[key];

  return (value === undefined ? fallback : (value as T));
}

export function useShellRuntimeActions<TState extends ShellRuntimeState = ShellRuntimeState>(): ShellRuntimeActions<TState> {
  const {
    setValue,
    patchState,
    resetState,
    registerScrollContainer,
    getScrollContainer,
    registerWidgetElement,
    scrollWidgetToCenter,
  } = useShellRuntime<TState>();

  return {
    setValue,
    patchState,
    resetState,
    registerScrollContainer,
    getScrollContainer,
    registerWidgetElement,
    scrollWidgetToCenter,
  };
}

export function useOptionalShellRuntimeActions<TState extends ShellRuntimeState = ShellRuntimeState>(): ShellRuntimeActions<TState> | null {
  const context = useOptionalShellRuntime<TState>();

  if (!context) {
    return null;
  }

  const {
    setValue,
    patchState,
    resetState,
    registerScrollContainer,
    getScrollContainer,
    registerWidgetElement,
    scrollWidgetToCenter,
  } = context;

  return {
    setValue,
    patchState,
    resetState,
    registerScrollContainer,
    getScrollContainer,
    registerWidgetElement,
    scrollWidgetToCenter,
  };
}
