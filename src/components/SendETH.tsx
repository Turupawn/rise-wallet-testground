import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useTransaction } from "../hooks/useTransaction";

const RECIPIENT_ADDRESS = "0xbef34f2FCAe62dC3404c3d01AF65a7784c9c4A19" as const;
const AMOUNT_ETH = "0.00012";

export function SendETH() {
  const { address, isConnected } = useAccount();
  const { execute } = useTransaction();
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
      const amountInWei = parseEther(AMOUNT_ETH);

      const response = await execute({
        calls: [
          {
            to: RECIPIENT_ADDRESS,
            value: amountInWei,
          },
        ],
      });

      setIsPending(false);

      if (response.success) {
        const resultString = JSON.stringify(response.data, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        );
        setResult(`Transaction sent! Result: ${resultString}`);
      } else {
        setError(
          response.error?.shortMessage ||
            response.error?.message ||
            "Failed to send transaction. Please try again."
        );
      }
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
      <h2>Send ETH</h2>
      <p style={{ marginTop: "10px", color: "#666" }}>
        Send {AMOUNT_ETH} ETH to {RECIPIENT_ADDRESS.slice(0, 6)}...
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
          : `Send ${AMOUNT_ETH} ETH`}
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

