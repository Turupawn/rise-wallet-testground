import { PERMISSIONS } from "../config/permissions";
import { P256, PublicKey } from "ox";
import { useCallback, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toHex, parseEther } from "viem";

export function useSessionKey() {
  const { address, isConnected, connector } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);

  const createSessionKey = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!connector) {
      throw new Error("No connector available");
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Generate key pair
      const privateKey = P256.randomPrivateKey();
      const publicKey = PublicKey.toHex(P256.getPublicKey({ privateKey }), {
        includePrefix: false,
      });

      // Store in localStorage
      localStorage.setItem(
        `porto.sessionKey.${publicKey}`,
        JSON.stringify({ privateKey, publicKey })
      );

      // Store the public key and key pair in state
      setSessionKey(publicKey);
      setKeyPair({ publicKey, privateKey });

      // Get provider and call grantPermissions directly
      const provider = (await connector.getProvider()) as any;

      // Convert permissions to the format expected by the API
      const permissions = {
        calls: PERMISSIONS.calls,
        spend: PERMISSIONS.spend.map((spend) => ({
          ...spend,
          limit: toHex(spend.limit), // Convert bigint to hex string
        })),
      };

      const permissionParams = {
        key: { publicKey, type: "p256" as const },
        expiry: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        feeToken: {
          limit: "1", // Decimal string format (not hex)
          symbol: "ETH",
        },
        permissions,
      };

      // Call wallet_grantPermissions directly via provider
      const result = await provider.request({
        method: "wallet_grantPermissions",
        params: [permissionParams],
      });

      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      return result;
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.shortMessage || "Failed to create session key";
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [isConnected, address, connector]);

  // Load session key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("porto.sessionKey.")
      );
      if (keys.length > 0) {
        try {
          const keyData = localStorage.getItem(keys[0]);
          if (keyData) {
            const parsed = JSON.parse(keyData);
            if (parsed.publicKey && parsed.privateKey) {
              setSessionKey(parsed.publicKey);
              setKeyPair({ publicKey: parsed.publicKey, privateKey: parsed.privateKey });
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }, []);

  return {
    createSessionKey,
    isCreating,
    error,
    success,
    sessionKey,
    keyPair,
  };
}

