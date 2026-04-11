import { useEffect, useState } from "react";

const STORAGE_KEY = "purchaseMode";
const listeners = new Set();

export const getPurchaseMode = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || false;
  } catch {
    return false;
  }
};

export const setPurchaseMode = (value) => {
  const next = Boolean(value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn(next));
};

export const clearPurchaseMode = () => setPurchaseMode(false);

export function usePurchaseMode() {
  const [value, setValue] = useState(getPurchaseMode);

  useEffect(() => {
    listeners.add(setValue);
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setValue(getPurchaseMode());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(setValue);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = () => setPurchaseMode(!getPurchaseMode());
  return [value, setPurchaseMode, toggle];
}
