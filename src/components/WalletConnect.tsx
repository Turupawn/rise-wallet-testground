import { useEffect, useState } from "react";
import { Actions } from "rise-wallet/wagmi";
import { formatEther } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { config } from "../rise-wallet.config";
import { useSessionKey } from "../hooks/useSessionKey";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { createSessionKey, isCreating, error, success } = useSessionKey();

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

