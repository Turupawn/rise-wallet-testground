import { useState } from "react";
import { encodeFunctionData, parseUnits } from "viem";
import { useAccount, useSendCalls } from "wagmi";

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

export function SendWithPasskey() {
  const { isConnected } = useAccount();
  const { sendCallsAsync } = useSendCalls();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSend = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setError(null);
    setResult(null);
    setIsPending(true);

    try {
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [RECIPIENT_ADDRESS, parseUnits(AMOUNT_TOKENS, 18)],
      });

      const result = await sendCallsAsync({
        calls: [
          {
            to: TOKEN_ADDRESS,
            data,
          },
        ],
        version: "1",
      } as any);

      setIsPending(false);
      const resultString = JSON.stringify(result, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
      setResult(`Transaction sent! Result: ${resultString}`);
    } catch (err: any) {
      setIsPending(false);
      setError(
        err?.shortMessage ||
          err?.message ||
          "Failed to send transaction. Please try again."
      );
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Send with Passkey</h2>
      <p style={{ marginTop: "10px", color: "#666" }}>
        Send {AMOUNT_TOKENS} tokens to {RECIPIENT_ADDRESS.slice(0, 6)}...
        {RECIPIENT_ADDRESS.slice(-4)}
      </p>
      <button
        onClick={handleSend}
        disabled={!isConnected || isPending}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          border: "1px solid #28a745",
          borderRadius: "4px",
          background: isConnected && !isPending ? "#28a745" : "#ccc",
          color: "white",
          cursor: isConnected && !isPending ? "pointer" : "not-allowed",
          opacity: isConnected && !isPending ? 1 : 0.6,
        }}
      >
        {isPending
          ? "Sending..."
          : !isConnected
          ? "Connect Wallet First"
          : `Send ${AMOUNT_TOKENS} tokens`}
      </button>

      {result && (
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
          {result}
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
    </div>
  );
}

