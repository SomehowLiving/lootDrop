require("dotenv").config();
const { execSync } = require("child_process");

const subscriptionId = process.env.SUBSCRIPTION_ID;
const vrfCoordinator = process.env.VRF_COORDINATOR;
const keyHash = process.env.KEY_HASH;

if (!subscriptionId || !vrfCoordinator || !keyHash) {
  console.error("❌ Missing .env values: check SUBSCRIPTION_ID, VRF_COORDINATOR, or KEY_HASH");
  process.exit(1);
}

const paramString = `subscriptionId=${subscriptionId},vrfCoordinator=${vrfCoordinator},keyHash=${keyHash}`;

const network = "sepolia";

const cmd = `npx hardhat ignition deploy ignition/modules/LootDropModule.js --network ${network} --parameters "${paramString}"`;

console.log("🚀 Deploying with:");
console.log(paramString);
console.log(`🔧 Running: ${cmd}`);

try {
  execSync(cmd, { stdio: "inherit" });
} catch (err) {
  console.error("❌ Deployment failed:", err.message);
}
