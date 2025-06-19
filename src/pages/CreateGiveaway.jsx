import { useState } from "react";
import { ethers } from "ethers"; 
import { getContract } from "../utils/contract";

export default function CreateGiveaway({ signer }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [winners, setWinners] = useState(1);
  const [maxParticipants, setMax] = useState(10);
  const [duration, setDuration] = useState(3600); // seconds

  const create = async () => {
    try {
      if (!name || !amount || Number(amount) <= 0) {
        alert("Please enter valid giveaway name and amount.");
        return;
      }

      const contract = getContract(signer);

      const tx = await contract.createGiveaway(
        name,
        0, // PrizeType.ETH
        ethers.utils.parseEther(amount),
        winners,
        maxParticipants,
        duration,
        { value: ethers.utils.parseEther(amount) }
      );

      await tx.wait();
      alert("🎉 Giveaway Created!");
    } catch (err) {
      console.error("Create Giveaway Error:", err);
      alert("Failed to create giveaway.");
    }
  };

  return (
    <div>
      <h2>Create Giveaway</h2>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Amount in ETH" onChange={e => setAmount(e.target.value)} />
      <input placeholder="Winners" type="number" onChange={e => setWinners(Number(e.target.value))} />
      <input placeholder="Max Participants" type="number" onChange={e => setMax(Number(e.target.value))} />
      <input placeholder="Duration (seconds)" type="number" onChange={e => setDuration(Number(e.target.value))} />
      <button onClick={create}>Create</button>
    </div>
  );
}