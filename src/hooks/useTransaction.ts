import { Hex, P256, Signature } from "ox";
import type { Address, Hex as HexAddress } from "viem";
import { toHex } from "viem";
import { useAccount, useChainId, useSendCalls } from "wagmi";

export type TransactionCall = {
  to: HexAddress;
  data?: HexAddress;
  value?: bigint;
};

export type TransactionProps = {
  calls: TransactionCall[];
};

export function useTransaction() {
  const { connector, address } = useAccount();
  const chainId = useChainId();
  const { sendCallsAsync } = useSendCalls();

  // Get session key from localStorage
  const getSessionKeyPair = (): { publicKey: string; privateKey: string } | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("porto.sessionKey.")
      );
      if (keys.length > 0) {
        const keyData = localStorage.getItem(keys[0]);
        if (keyData) {
          const parsed = JSON.parse(keyData);
          if (parsed.publicKey && parsed.privateKey) {
            return { publicKey: parsed.publicKey, privateKey: parsed.privateKey };
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  };

  async function execute(props: TransactionProps) {
    console.log("executing transaction...");
    const { calls } = props;

    // Try to use session key first
    const keyPair = getSessionKeyPair();
    
    if (keyPair && connector && address) {
      try {
        console.log("using session key to bypass confirmation...");
        return await executeWithSessionKey(calls, keyPair);
      } catch (sessionError) {
        console.log("session-key-error: ", sessionError);
        // Fall back to passkey if session key fails
        return await executeWithPasskey(calls);
      }
    } else {
      // No session key available, use passkey (will show confirmation modal)
      return await executeWithPasskey(calls);
    }
  }

  async function executeWithPasskey(calls: TransactionCall[]) {
    console.log("executing using passkey....");
    try {
      const result = await sendCallsAsync({
        calls,
        version: "1",
      } as any);

      console.log("transaction-success:: ", result);

      return {
        success: true,
        error: null,
        data: result,
      };
    } catch (error) {
      console.log("transaction-error: ", error);

      return {
        success: false,
        error,
        data: null,
      };
    }
  }

  async function executeWithSessionKey(
    calls: TransactionCall[],
    keyPair: { publicKey: string; privateKey: string }
  ) {
    console.log("executing using sessionkey....");
    try {
      if (!connector) throw new Error("No connector available");
      if (!address) throw new Error("No address available");

      const provider = (await connector.getProvider()) as any;

      // Convert calls to the format expected by the API (value must be hex string)
      const formattedCalls = calls.map((call) => ({
        ...call,
        value: call.value ? toHex(call.value) : undefined,
      }));

      const intentParams = [
        {
          calls: formattedCalls,
          chainId: Hex.fromNumber(chainId),
          from: address,
          atomicRequired: true,
          key: {
            publicKey: keyPair.publicKey,
            type: "p256",
          },
        },
      ];

      // Prepare calls to simulate and estimate fees
      const { digest, capabilities, ...request } = await provider.request({
        method: "wallet_prepareCalls",
        params: intentParams,
      });

      // Sign the intent with session key (no confirmation needed!)
      const signature = Signature.toHex(
        P256.sign({
          payload: digest as `0x${string}`,
          privateKey: keyPair.privateKey as Address,
        })
      );

      // Send calls with session key signature
      const result = await provider.request({
        method: "wallet_sendPreparedCalls",
        params: [
          {
            ...request,
            ...(capabilities ? { capabilities } : {}),
            signature,
          },
        ],
      });

      let resp = result;
      if (Array.isArray(result) && result.length !== 0) {
        resp = result[0];
      }

      console.log("session-key-transaction-success:: ", resp);

      return {
        success: true,
        error: null,
        data: { ...resp, usedSessionKey: true },
      };
    } catch (error) {
      console.log("execute-with-sessionkey-error:: ", error);
      return {
        success: false,
        error,
        data: null,
      };
    }
  }

  return {
    execute,
  };
}

