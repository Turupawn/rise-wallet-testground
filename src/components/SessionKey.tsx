import { useState, useEffect } from "react";
import { P256, PublicKey } from "ox";
import { useAccount } from "wagmi";
import { Hooks } from "rise-wallet/wagmi";
import { keccak256, toHex, parseEther, encodeFunctionData, parseUnits } from "viem";
import { Hex, Signature } from "ox";
import type { Address } from "viem";
import { useChainId } from "wagmi";

const TOKEN_ADDRESS = "0xC229b10f0497878Cb3D3E9663b366BC535939FE8" as const;
const RECIPIENT_ADDRESS = "0xbef34f2FCAe62dC3404c3d01AF65a7784c9c4A19" as const;
const AMOUNT_TOKENS = "50";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function SessionKey() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const grantPermissions = Hooks.useGrantPermissions();
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Load session key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const publicKey = localStorage.getItem("publicKey");
      if (publicKey) {
        setSessionKey(publicKey);
      }
    }
  }, []);

  const createSessionKey = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected");
      return;
    }

    if (!connector) {
      setError("No connector available");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const privateKey = P256.randomPrivateKey();
      const publicKey = PublicKey.toHex(P256.getPublicKey({ privateKey }), {
        includePrefix: false,
      });

      // Store key pair
      localStorage.setItem(
        `sessionKey.${publicKey}`,
        JSON.stringify({ privateKey, publicKey })
      );

      localStorage.setItem(`publicKey`, publicKey);
      setSessionKey(publicKey);

      const permissions = {
        calls: [
          {
            to: "0xC229b10f0497878Cb3D3E9663b366BC535939FE8" as `0x${string}`,
            signature: keccak256(toHex("transfer(address,uint256)")).slice(0, 10),
          },
        ],
        spend: [
          {
            limit: parseEther("50"),
            period: "minute" as const,
            token: "0xC229b10f0497878Cb3D3E9663b366BC535939FE8" as `0x${string}`,
          },
        ],
      };

      const result = await grantPermissions.mutateAsync({
        key: { publicKey, type: "p256" as const },
        expiry: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        feeToken: { limit: "1" as any, symbol: "ETH" },
        permissions,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.shortMessage || "Failed to create session key";
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const sendWithSessionKey = async () => {
    if (!isConnected) {
      setSendError("Please connect your wallet first");
      return;
    }

    if (!connector) {
      setSendError("No connector available");
      return;
    }

    if (!address) {
      setSendError("No address available");
      return;
    }

    setSendError(null);
    setSendSuccess(false);
    setIsSending(true);

    try {
      const publicKey = localStorage.getItem("publicKey");
      if (!publicKey) {
        setSendError("No session key available");
        setIsSending(false);
        setTimeout(() => setSendError(null), 5000);
        return;
      }

      const keyData = localStorage.getItem(`sessionKey.${publicKey}`);
      if (!keyData) {
        setSendError("Session key data not found");
        setIsSending(false);
        setTimeout(() => setSendError(null), 5000);
        return;
      }

      const sessionKeyData = JSON.parse(keyData);
      const privateKey = sessionKeyData.privateKey;

      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [RECIPIENT_ADDRESS, parseUnits(AMOUNT_TOKENS, 18)],
      });

      const provider = (await connector.getProvider()) as any;

      const { digest, capabilities, ...request } = await provider.request({
        method: "wallet_prepareCalls",
        params: [{
          calls: [{ to: TOKEN_ADDRESS, data }],
          chainId: Hex.fromNumber(chainId),
          from: address,
          atomicRequired: true,
          key: { publicKey: publicKey, type: "p256" },
        }],
      });

      const signature = Signature.toHex(
        P256.sign({ payload: digest as `0x${string}`, privateKey: privateKey as Address })
      );

      const result = await provider.request({
        method: "wallet_sendPreparedCalls",
        params: [{ ...request, ...(capabilities && { capabilities }), signature }],
      });

      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: any) {
      setIsSending(false);
      setSendError(
        err?.shortMessage ||
          err?.message ||
          "Failed to send transaction"
      );
      setTimeout(() => setSendError(null), 5000);
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Session Key</h2>
      
      <button
        onClick={createSessionKey}
        disabled={isCreating || !isConnected}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          border: "1px solid #28a745",
          borderRadius: "4px",
          background: isConnected && !isCreating ? "#28a745" : "#ccc",
          color: "white",
          cursor: isConnected && !isCreating ? "pointer" : "not-allowed",
          opacity: isConnected && !isCreating ? 1 : 0.6,
        }}
      >
        {isCreating ? "Creating..." : "Create Session Key"}
      </button>

      {success && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            color: "#155724",
          }}
        >
          Session key created successfully!
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          Error: {error}
        </div>
      )}

      {sessionKey && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            background: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        >
          <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
            Current Session Key:
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              wordBreak: "break-all",
              color: "#495057",
            }}
          >
            {sessionKey}
          </div>
        </div>
      )}

      <button
        onClick={sendWithSessionKey}
        disabled={!isConnected || isSending || !sessionKey}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          border: "1px solid #007bff",
          borderRadius: "4px",
          background: isConnected && !isSending && sessionKey ? "#007bff" : "#ccc",
          color: "white",
          cursor: isConnected && !isSending && sessionKey ? "pointer" : "not-allowed",
          opacity: isConnected && !isSending && sessionKey ? 1 : 0.6,
        }}
      >
        {isSending ? "Sending..." : `Send ${AMOUNT_TOKENS} tokens`}
      </button>

      {sendSuccess && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            color: "#155724",
          }}
        >
          Transaction sent successfully!
        </div>
      )}

      {sendError && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          Error: {sendError}
        </div>
      )}
    </div>
  );
}

