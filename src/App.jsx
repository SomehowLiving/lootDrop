import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import CreateGiveaway from "./pages/CreateGiveaway";
import ActiveGiveaways from "./pages/ActiveGiveaways";
// import other pages later

function App() {
  const [signer, setSigner] = useState(null);

  return (
    <div>
      <h1>LootDrop</h1>
      <WalletConnect onConnect={setSigner} />
      {signer && (
        <>
          <CreateGiveaway signer={signer} />
          <ActiveGiveaways signer={signer} />
        </>
      )}
    </div>
  );
}

export default App;