import { useState, useEffect } from "react";
import { getFhevmInstance } from "../config/fhevm";

export const useFhevm = () => {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFhevm = async () => {
      try {
        const fhevmInstance = await getFhevmInstance();
        setInstance(fhevmInstance);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize FHEVM");
      } finally {
        setLoading(false);
      }
    };

    initializeFhevm();
  }, []);

  return { instance, loading, error };
};
