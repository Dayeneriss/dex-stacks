import "./App.css";
import ConnectWallet from "./components/WalletConnect/ConnectWallet";
import DexInterface from "./components/Dex/DexInterface";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Stacks DEX</h1>
        <ConnectWallet />
        <DexInterface />
      </header>
    </div>
  );
}

export default App;
