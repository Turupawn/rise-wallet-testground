import { WalletConnection } from "./components/WalletConnection";
import { SessionKey } from "./components/SessionKey";
import { SendWithPasskey } from "./components/SendWithPasskey";
import { WalletProvider } from "./providers/WalletProvider";
import "./style.css";

function App() {
  return (
    <WalletProvider>
      <div>
        <h1>RISE Wallet Testground</h1>
        <div style={{ marginTop: "20px" }}>
          <WalletConnection />
        </div>
        <SendWithPasskey />
        <SessionKey />
      </div>
    </WalletProvider>
  );
}

export default App;

