// WalletConnect.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState("");

  async function connectWallet() {
    if (!window.ethereum) return alert("🦊 MetaMask not found!");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    setAddress(addr);
    onConnect(signer);
  }

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        setAddress(addr);
        onConnect(signer);
      } else {
        setAddress("");
        onConnect(null);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <div className="d-flex justify-content-center mt-3">
      {address ? (
        <div className="alert alert-success" style={{ fontSize: "0.9rem" }}>
          🦊 Connected: <strong>{address.slice(0, 6)}...{address.slice(-4)}</strong>
        </div>
      ) : (
        <button className="btn btn-outline-dark" onClick={connectWallet}>
          🔌 Connect Wallet
        </button>
      )}
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { ethers } from "ethers";

// export default function WalletConnect({ onConnect }) {
//   const [address, setAddress] = useState("");

//   async function connectWallet() {
//     if (!window.ethereum) return alert("Install MetaMask");

//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     const signer = provider.getSigner();
//     const addr = await signer.getAddress();

//     setAddress(addr);
//     onConnect(signer);
//   }

//   useEffect(() => {
//     if (!window.ethereum) return;

//     const handleAccountsChanged = async (accounts) => {
//       if (accounts.length > 0) {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const addr = await signer.getAddress();
//         setAddress(addr);
//         onConnect(signer);
//       } else {
//         setAddress("");
//         onConnect(null);
//       }
//     };

//     window.ethereum.on("accountsChanged", handleAccountsChanged);

//     return () => {
//       window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
//     };
//   }, []);

//   return (
//     <div>
//       {address ? (
//         <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
//       ) : (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { ethers } from "ethers";

// export default function WalletConnect({ onConnect }) {
//   const [address, setAddress] = useState("");

//   async function connectWallet() {
//     if (!window.ethereum) return alert("Install MetaMask");

//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     const signer = provider.getSigner();
//     const addr = await signer.getAddress();

//     setAddress(addr);
//     onConnect(signer);
//   }

//   return (
//     <div>
//       {address ? (
//         <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
//       ) : (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//     </div>
//   );
// }
