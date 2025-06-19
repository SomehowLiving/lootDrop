const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LootDropModule", (m) => {
  const subscriptionId = m.getParameter("subscriptionId", 9159);
  const vrfCoordinator = m.getParameter("vrfCoordinator", "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B");
  const keyHash = m.getParameter("keyHash", "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae");

  const lootDrop = m.contract("lootDrop", [subscriptionId, vrfCoordinator, keyHash]);

  return { lootDrop };
});


// const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// module.exports = buildModule("LootDropModule", (m) => {
//   const subscriptionId = m.getParameter("subscriptionId");
//   const vrfCoordinator = m.getParameter("vrfCoordinator");
//   const keyHash = m.getParameter("keyHash");

//   const lootDrop = m.contract("lootDrop", [subscriptionId, vrfCoordinator, keyHash]);

//   return { lootDrop };
// });
