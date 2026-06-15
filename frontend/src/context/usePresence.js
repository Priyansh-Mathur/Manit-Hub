import { useContext } from "react";
import { PresenceContext } from "./PresenceContext";

export const usePresence = () => useContext(PresenceContext);
