"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";
import type { NormalizedApiError } from "@/lib/parse-api-error";
import {
  parseErrorFromResponse,
  parseErrorFromUnknown,
} from "@/lib/parse-api-error";

export type UIContextValue = {
  /** Show the global error modal with a normalized payload */
  showError: (error: NormalizedApiError) => void;
  /** Parse a failed `fetch` Response and show the modal */
  showErrorFromResponse: (response: Response) => Promise<void>;
  /** Handle thrown errors and network failures */
  showErrorFromUnknown: (error: unknown) => void;
  dismissError: () => void;
};

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const showError = useCallback((next: NormalizedApiError) => {
    setError(next);
  }, []);

  const showErrorFromResponse = useCallback(
    async (response: Response) => {
      const normalized = await parseErrorFromResponse(response);
      showError(normalized);
    },
    [showError]
  );

  const showErrorFromUnknown = useCallback(
    (err: unknown) => {
      showError(parseErrorFromUnknown(err));
    },
    [showError]
  );

  const value = useMemo<UIContextValue>(
    () => ({
      showError,
      showErrorFromResponse,
      showErrorFromUnknown,
      dismissError,
    }),
    [showError, showErrorFromResponse, showErrorFromUnknown, dismissError]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <ErrorModal open={!!error} onClose={dismissError} error={error} />
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return ctx;
}
