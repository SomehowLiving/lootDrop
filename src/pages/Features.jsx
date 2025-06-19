// pages/Features.jsx
export default function Features() {
  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4">🌟 Features</h1>

      <div className="row">
        <div className="col-md-6 mb-4">
          <h5>🧙 Custom Giveaways</h5>
          <p>Create ETH/NFT/token raffles with your own rules: number of winners, participant cap, and eligibility.</p>
        </div>

        <div className="col-md-6 mb-4">
          <h5>🔐 Token-Gated Access</h5>
          <p>Only holders of certain NFTs or ERC-20 tokens can enter select giveaways (coming soon).</p>
        </div>

        <div className="col-md-6 mb-4">
          <h5>🎲 Chainlink VRF Integration</h5>
          <p>Every winner is chosen by verifiable randomness. No centralized control. No shady logic.</p>
        </div>

        <div className="col-md-6 mb-4">
          <h5>💸 Direct ETH or Token Payouts</h5>
          <p>Winners receive ETH (and soon other tokens) directly in their wallets.</p>
        </div>

        <div className="col-md-6 mb-4">
          <h5>🪙 Winner NFTs (Coming Soon)</h5>
          <p>Winners can optionally mint an NFT badge proving they won — clout guaranteed.</p>
        </div>

        <div className="col-md-6 mb-4">
          <h5>🌐 Multi-Chain Ready</h5>
          <p>Deploy lootDrop on Ethereum, Polygon, Optimism and other EVM chains.</p>
        </div>
      </div>

      <hr className="my-5" />

      <div className="text-center">
        <h4>👥 Who's it for?</h4>
        <p>DAOs, fan clubs, NFT projects, event organizers, student communities... if you’ve got a token and a tribe, you’ve got a raffle.</p>
      </div>
    </div>
  );
}
