// pages/About.jsx
export default function About() {
  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4">📖 About lootDrop</h1>

      <p className="lead">
        lootDrop is a provably fair, fully on-chain raffle system for the brave, the curious, and the community-driven.  
        Whether you're a DAO, a gaming guild, a uni club, or a fan club, lootDrop lets you run **transparent giveaways with magical randomness**.
      </p>

      <p>
        🍀 Powered by <strong>Chainlink VRF</strong>, you can say goodbye to shady winner picks and hello to on-chain verifiability.  
        Want to reward NFT holders only? Set eligibility rules.  
        Want to drop ETH or even in-game loot? You got it.
      </p>

      <p>
        We’re starting simple (ETH raffles) but the future is modular: NFT rewards, ERC-20 tokens, access passes, and even win-to-mint badges.  
        <strong>lootDrop = web3-powered generosity</strong>.
      </p>

      <p className="text-muted">
        Smart contract address: <code>0xYourContractAddressHere</code>  
        — deployed on [your network]
      </p>

      <hr className="my-4" />

      <h4 className="mb-3">🛠 Our Tech Stack</h4>
      <ul>
        <li>🔗 Chainlink VRF for randomness</li>
        <li>⚙️ Solidity + Hardhat for smart contracts</li>
        <li>🦊 Ethers.js for wallet interactions</li>
        <li>⚛️ Vite + React for the frontend</li>
      </ul>

      <div className="mt-5 text-center">
        <p className="fw-bold">Made with 🎁, ❤️, and a sprinkle of VRF randomness.</p>
        <a
          href="https://github.com/your-username/lootdrop"
          className="btn btn-outline-dark"
          target="_blank"
          rel="noreferrer"
        >
          🧪 View Code on GitHub
        </a>
      </div>
    </div>
  );
}
