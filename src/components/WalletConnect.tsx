import { useEffect, useState } from "react";
import { Actions } from "rise-wallet/wagmi";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { config } from "../rise-wallet.config";
import { useSessionKey } from "../hooks/useSessionKey";
import { useTransaction } from "../hooks/useTransaction";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { createSessionKey, isCreating, error, success, sessionKey } = useSessionKey();
  const { execute } = useTransaction();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const RECIPIENT_ADDRESS = "0xbef34f2FCAe62dC3404c3d01AF65a7784c9c4A19" as const;
  const AMOUNT_ETH = "0.000069";

  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Log wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      console.log("Wallet connected:", address);
    }
  }, [isConnected, address]);

  const portoConnector = connectors.find((c) => c.id === "xyz.ithaca.porto");

  if (!mounted) {
    return <div className="skeleton">Loading...</div>;
  }

  if (!portoConnector) {
    return null;
  }

  if (isConnected && address) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <p>
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <span>|</span>
            <p style={{ color: "#666" }}>
              {balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"}{" "}
              <span style={{ fontWeight: "bold" }}>{balance?.symbol ?? "ETH"}</span>
            </p>
          </div>
          <span>|</span>
          <button
            onClick={async () => {
              try {
                await createSessionKey();
              } catch (err) {
                // Error is handled by the hook
              }
            }}
            disabled={isCreating}
            style={{
              padding: "8px 16px",
              border: "1px solid #28a745",
              borderRadius: "4px",
              background: isCreating ? "#ccc" : "#28a745",
              color: "white",
              cursor: isCreating ? "not-allowed" : "pointer",
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            {isCreating ? "Creating..." : "Create Session Key"}
          </button>
          <button
            onClick={() => {
              Actions.disconnect(config);
              disconnect();
            }}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "white",
              color: "#333",
              cursor: "pointer",
            }}
          >
            Disconnect
          </button>
        </div>
        {success && (
          <div
            style={{
              padding: "8px 12px",
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              color: "#155724",
              fontSize: "14px",
            }}
          >
            Session key created successfully!
          </div>
        )}
        {error && (
          <div
            style={{
              padding: "8px 12px",
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              color: "#721c24",
              fontSize: "14px",
            }}
          >
            Error: {error}
          </div>
        )}
        {sessionKey && (
          <div
            style={{
              padding: "12px",
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
              Session Key:
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
            <button
              onClick={async () => {
                if (!isConnected) {
                  setSendError("Please connect your wallet first");
                  return;
                }

                setSendError(null);
                setSendSuccess(false);
                setIsSending(true);

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

                  setIsSending(false);

                  if (response.success) {
                    setSendSuccess(true);
                    setTimeout(() => setSendSuccess(false), 3000);
                  } else {
                    setSendError(
                      response.error?.shortMessage ||
                        response.error?.message ||
                        "Failed to send transaction"
                    );
                    setTimeout(() => setSendError(null), 5000);
                  }
                } catch (err: any) {
                  setIsSending(false);
                  setSendError(
                    err?.shortMessage ||
                      err?.message ||
                      "Failed to send transaction"
                  );
                  setTimeout(() => setSendError(null), 5000);
                }
              }}
              disabled={!isConnected || isSending}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                border: "1px solid #007bff",
                borderRadius: "4px",
                background: isConnected && !isSending ? "#007bff" : "#ccc",
                color: "white",
                cursor: isConnected && !isSending ? "pointer" : "not-allowed",
                opacity: isConnected && !isSending ? 1 : 0.6,
                fontSize: "14px",
              }}
            >
              {isSending
                ? "Sending..."
                : `Send ${AMOUNT_ETH} ETH`}
            </button>
            {sendSuccess && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "6px 10px",
                  background: "#d4edda",
                  border: "1px solid #c3e6cb",
                  borderRadius: "4px",
                  color: "#155724",
                  fontSize: "12px",
                }}
              >
                Transaction sent successfully!
              </div>
            )}
            {sendError && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "6px 10px",
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                  color: "#721c24",
                  fontSize: "12px",
                }}
              >
                Error: {sendError}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: portoConnector })}
      disabled={isPending}
      style={{
        padding: "8px 16px",
        minWidth: "160px",
        border: "1px solid #007bff",
        borderRadius: "4px",
        background: "#007bff",
        color: "white",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? "Connecting..." : "Connect via Passkey"}
    </button>
  );
}

