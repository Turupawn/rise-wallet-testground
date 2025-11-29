import { WalletConnect } from "./components/WalletConnect";
import { SendETH } from "./components/SendETH";
import { WalletProvider } from "./providers/WalletProvider";
import "./style.css";

function App() {
  return (
    <WalletProvider>
      <div>
        <h1>RISE Wallet Testground</h1>
        <div style={{ marginTop: "20px" }}>
          <WalletConnect />
        </div>
        <SendETH />
      </div>
    </WalletProvider>
  );
}

export default App;

