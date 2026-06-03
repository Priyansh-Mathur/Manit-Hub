import { createContext, useContext } from "react";

export const CommandContext = createContext(null);

export function useCommand() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error("useCommand must be used within CommandProvider");
  return ctx;
}
