import { ethers } from "ethers";
import abi from "../abi/LootDrop.json";
import { CONTRACT_ADDRESS } from "../config.js";


console.log("Loaded contract address:", CONTRACT_ADDRESS); // 👈 Add this

export const getContract = (providerOrSigner) => {
  if (!CONTRACT_ADDRESS) throw new Error("Missing CONTRACT_ADDRESS from environment!");
  return new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner);
};
