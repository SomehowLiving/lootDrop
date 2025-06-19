// pages/ActiveGiveaways.jsx
// 💡 Same logic, new drip
import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function ActiveGiveaways({ signer }) {
  const [giveaways, setGiveaways] = useState([]);
  const [joiningGiveawayId, setJoiningGiveawayId] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    if (!signer) return;
    signer.getAddress().then(setUserAddress);
  }, [signer]);

  const loadActiveGiveaways = async () => {
    try {
      const contract = getContract(signer);
      const activeIds = await contract.getActiveGiveaways();

      const all = await Promise.all(
        activeIds.map(async (id) => {
          const g = await contract.giveaways(id);
          const participants = await contract.getParticipants(id);

          return {
            id: g.id.toString(),
            name: g.name,
            prizeAmount: ethers.utils.formatEther(g.prizeAmount),
            participants: participants.length,
            maxParticipants: g.maxParticipants.toString(),
            endTime: new Date(Number(g.endTime) * 1000).toLocaleString(),
            endTimestamp: Number(g.endTime),
            isCreator: g.creator.toLowerCase() === userAddress.toLowerCase(),
            showParticipants: false,
            numWinners: g.numWinners.toString(),
            participantList: [],
            finalizing: false,
          };
        })
      );

      setGiveaways(all);
    } catch (err) {
      console.error("Error loading giveaways", err);
    }
  };

  useEffect(() => {
    if (signer) {
      loadActiveGiveaways();
    }
  }, [signer, refreshToggle, userAddress]);

  const joinGiveaway = async (giveawayId) => {
    try {
      setJoiningGiveawayId(giveawayId);
      const contract = getContract(signer);
      const tx = await contract.joinGiveaway(giveawayId);
      await tx.wait();
      alert("✅ Joined the giveaway!");
      setRefreshToggle(!refreshToggle);
    } catch (err) {
      console.error("Join failed", err);
      alert(err?.reason || "Join failed. Already joined?");
    } finally {
      setJoiningGiveawayId(null);
    }
  };

  const fetchParticipants = async (giveawayId) => {
    try {
      const contract = getContract(signer);
      const participants = await contract.getParticipants(giveawayId);
      setGiveaways((prev) =>
        prev.map((g) =>
          g.id === giveawayId
            ? { ...g, showParticipants: true, participantList: participants }
            : g
        )
      );
    } catch (err) {
      console.error("Failed to fetch participants", err);
    }
  };

  const finalizeGiveaway = async (giveawayId) => {
    try {
      const contract = getContract(signer);
      setGiveaways((prev) =>
        prev.map((g) => (g.id === giveawayId ? { ...g, finalizing: true } : g))
      );
      // const tx = await contract.requestRandomWinner(giveawayId);
      // await tx.wait();
      try {
        const tx = await contract.requestRandomWinner(giveawayId, false);
        await tx.wait();
      } catch (err) {
        console.error("Finalize failed", err);

        const reason = err?.error?.message || err?.reason || err?.message || "Unknown error";
        alert("❌ Finalize failed:\n" + reason);
      }

      alert("🔮 Randomness requested!");
    } catch (err) {
      console.error("Finalize failed", err);
      alert(err?.error?.message || err?.reason || "Giveaway might still be live.");
    } finally {
      setGiveaways((prev) =>
        prev.map((g) => (g.id === giveawayId ? { ...g, finalizing: false } : g))
      );
    }
  };

  useEffect(() => {
    if (!signer) return;
    const contract = getContract(signer);

    const handleWinnersSelected = async (giveawayId) => {
      try {
        const tx = await contract.payoutWinners(giveawayId);
        await tx.wait();
        alert("💰 Payout complete!");
        setRefreshToggle((r) => !r);
      } catch (err) {
        console.error("Payout error", err);
      }
    };

    contract.on("WinnersSelected", handleWinnersSelected);
    return () => contract.off("WinnersSelected", handleWinnersSelected);
  }, [signer]);

  return (
    <div className="mt-5">
      <h2 className="mb-4 text-center">🎉 Active Giveaways</h2>
      {giveaways.length === 0 ? (
        <p className="text-center">No active giveaways... yet. 👀</p>
      ) : (
        giveaways.map((g) => (
          <div key={g.id} className="card mb-4 shadow-sm">
            <div className="card-body">
              <h4 className="card-title">{g.name}</h4>
              <p className="card-text">
                💰 Prize: <strong>{g.prizeAmount} ETH</strong><br />
                👥 Participants: {g.participants}/{g.maxParticipants}<br />
                ⏳ Ends In: {Math.floor((g.endTimestamp - Date.now() / 1000))}s<br />
                🏆 Winners: {g.numWinners}
              </p>

              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => joinGiveaway(g.id)} disabled={joiningGiveawayId === g.id}>
                  {joiningGiveawayId === g.id ? "Joining..." : "Join Giveaway"}
                </button>

                <button className="btn btn-secondary" onClick={() => fetchParticipants(g.id)}>
                  Show Participants
                </button>

                {g.isCreator && (
                  <button className="btn btn-danger" onClick={() => finalizeGiveaway(g.id)} disabled={g.finalizing}>
                    {g.finalizing ? "Finalizing..." : "Finalize Giveaway"}
                  </button>
                )}
              </div>

              {g.showParticipants && (
                <ul className="mt-3 list-group">
                  {g.participantList.map((addr, i) => (
                    <li key={i} className="list-group-item small">
                      {addr}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { getContract } from "../utils/contract";
// import { ethers } from "ethers";

// export default function ActiveGiveaways({ signer }) {
//   const [giveaways, setGiveaways] = useState([]);
//   const [joiningGiveawayId, setJoiningGiveawayId] = useState(null);
//   const [refreshToggle, setRefreshToggle] = useState(false);
//   const [userAddress, setUserAddress] = useState("");

//   useEffect(() => {
//     if (!signer) return;
//     signer.getAddress().then(setUserAddress);
//   }, [signer]);

//   const loadActiveGiveaways = async () => {
//     try {
//       const contract = getContract(signer);
//       const activeIds = await contract.getActiveGiveaways();

//       const all = await Promise.all(
//         activeIds.map(async (id) => {
//           const g = await contract.giveaways(id);
//           const participants = await contract.getParticipants(id);

//           return {
//             id: g.id.toString(),
//             name: g.name,
//             prizeAmount: ethers.utils.formatEther(g.prizeAmount),
//             participants: participants.length,
//             maxParticipants: g.maxParticipants.toString(),
//             endTime: new Date(Number(g.endTime) * 1000).toLocaleString(),
//             endTimestamp: Number(g.endTime),
//             isCreator: g.creator.toLowerCase() === userAddress.toLowerCase(),
//             showParticipants: false,
//             numWinners: g.numWinners.toString(),
//             participantList: [],
//             finalizing: false,
//           };
//         })
//       );

//       setGiveaways(all);
//     } catch (err) {
//       console.error("Error loading giveaways", err);
//     }
//   };

//   useEffect(() => {
//     if (signer) {
//       loadActiveGiveaways();
//     }
//   }, [signer, refreshToggle, userAddress]);

//   const joinGiveaway = async (giveawayId) => {
//     try {
//       setJoiningGiveawayId(giveawayId);
//       const contract = getContract(signer);
//       const tx = await contract.joinGiveaway(giveawayId);
//       await tx.wait();
//       alert("Successfully joined the giveaway!");
//       setRefreshToggle(!refreshToggle);
//     } catch (err) {
//       console.error("Join failed", err);
//       alert(err?.reason || "Join failed. Maybe already joined or not allowed.");
//     } finally {
//       setJoiningGiveawayId(null);
//     }
//   };

//   const fetchParticipants = async (giveawayId) => {
//     try {
//       const contract = getContract(signer);
//       const participants = await contract.getParticipants(giveawayId);
//       setGiveaways((prev) =>
//         prev.map((g) =>
//           g.id === giveawayId
//             ? { ...g, showParticipants: true, participantList: participants }
//             : g
//         )
//       );
//     } catch (err) {
//       console.error("Failed to fetch participants", err);
//     }
//   };

//   const finalizeGiveaway = async (giveawayId) => {
//     try {
//       const contract = getContract(signer);
//       setGiveaways((prev) =>
//         prev.map((g) => (g.id === giveawayId ? { ...g, finalizing: true } : g))
//       );
//       const tx = await contract.requestRandomWinner(giveawayId, { gasLimit: 200000 });
//       await tx.wait();
//       alert("Randomness requested!");
//     } catch (err) {
//       console.error("Finalize failed", err);
//         alert(
//             err?.error?.message ||
//             err?.reason ||
//             "Giveaway may still be active or have too few participants."
//         );
//     } finally {
//       setGiveaways((prev) =>
//         prev.map((g) => (g.id === giveawayId ? { ...g, finalizing: false } : g))
//       );
//     }
//   };

//   // 👇 Auto-payout on Chainlink callback
//   useEffect(() => {
//     if (!signer) return;

//     const contract = getContract(signer);

//     const handleWinnersSelected = async (giveawayId, winners) => {
//       try {
//         const tx = await contract.payoutWinners(giveawayId);
//         await tx.wait();
//         alert("Prizes paid out!");
//         setRefreshToggle((r) => !r);
//       } catch (err) {
//         console.error("Auto payout failed", err);
//       }
//     };

//     contract.on("WinnersSelected", handleWinnersSelected);

//     return () => {
//       contract.off("WinnersSelected", handleWinnersSelected);
//     };
//   }, [signer]);

//   return (
//     <div>
//       <h2>Active Giveaways</h2>
//       {giveaways.length === 0 ? (
//         <p>No active giveaways yet.</p>
//       ) : (
//         giveaways.map((g) => (
//           <div
//             key={g.id}
//             style={{
//               border: "1px solid #ccc",
//               marginBottom: "1rem",
//               padding: "1rem",
//             }}
//           >
//             <h3>{g.name}</h3>
//             <p>Prize: {g.prizeAmount} ETH</p>
//             <p>
//               Participants: {g.participants}/{g.maxParticipants}
//             </p>
//             <p>Ends At: {g.endTime}</p>
//             <p>Giveaway ID: {g.id}</p>

//             <button
//               onClick={() => joinGiveaway(g.id)}
//               disabled={joiningGiveawayId === g.id}
//             >
//               {joiningGiveawayId === g.id ? "Joining..." : "Join Giveaway"}
//             </button>

//             <button onClick={() => fetchParticipants(g.id)} style={{ marginLeft: "10px" }}>
//               Show Participants
//             </button>

//             <p>Ends In: {Math.floor((g.endTimestamp - Date.now() / 1000))} seconds</p>
//             <p>Num Winners: {g.numWinners}</p>
//             <p>Creator View: {g.isCreator ? "Yes" : "No"}</p>


//             {g.showParticipants && (
//               <ul style={{ marginTop: "10px" }}>
//                 {g.participantList.map((addr, i) => (
//                   <li key={i}>{addr}</li>
//                 ))}
//               </ul>
//             )}

//             {g.isCreator && (
//               <button
//                 onClick={() => finalizeGiveaway(g.id)}
//                 disabled={g.finalizing}
//                 style={{ display: "block", marginTop: "10px" }}
//               >
//                 {g.finalizing ? "Finalizing..." : "Finalize Giveaway"}
//               </button>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { getContract } from "../utils/contract";
// import { ethers } from "ethers";

// export default function ActiveGiveaways({ signer }) {
//   const [giveaways, setGiveaways] = useState([]);
//   const [joiningGiveawayId, setJoiningGiveawayId] = useState(null); // Track active join
//   const [refreshToggle, setRefreshToggle] = useState(false); // To trigger re-fetch

//   const loadActiveGiveaways = async () => {
//     try {
//       const contract = getContract(signer);
//       const activeIds = await contract.getActiveGiveaways();

//       const all = await Promise.all(
//         activeIds.map(async (id) => {
//           const g = await contract.giveaways(id);
//           const participants = await contract.getParticipants(id);

//           return {
//             id: g.id.toString(),
//             name: g.name,
//             prizeAmount: ethers.utils.formatEther(g.prizeAmount),
//             participants: participants.length,
//             maxParticipants: g.maxParticipants.toString(),
//             endTime: new Date(Number(g.endTime) * 1000).toLocaleString(),
//           };
//         })
//       );

//       setGiveaways(all);
//     } catch (err) {
//       console.error("Error loading giveaways", err);
//     }
//   };

//   useEffect(() => {
//     if (signer) {
//       loadActiveGiveaways();
//     }
//   }, [signer, refreshToggle]);

//   const joinGiveaway = async (giveawayId) => {
//     try {
//       setJoiningGiveawayId(giveawayId);
//       const contract = getContract(signer);
//       const tx = await contract.joinGiveaway(giveawayId);
//       await tx.wait();
//       alert("Successfully joined the giveaway!");
//       setRefreshToggle(!refreshToggle); // Re-fetch updated data
//     } catch (err) {
//       console.error("Join failed", err);
//       alert(err?.reason || "Join failed. Maybe already joined or not allowed.");
//     } finally {
//       setJoiningGiveawayId(null);
//     }
//   };

//   return (
//     <div>
//       <h2>Active Giveaways</h2>
//       {giveaways.length === 0 ? (
//         <p>No active giveaways yet.</p>
//       ) : (
//         giveaways.map((g) => (
//           <div key={g.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
//             <h3>{g.name}</h3>
//             <p>Prize: {g.prizeAmount} ETH</p>
//             <p>Participants: {g.participants}/{g.maxParticipants}</p>
//             <p>Ends At: {g.endTime}</p>
//             <p>Giveaway ID: {g.id}</p>
//             <button
//               onClick={() => joinGiveaway(g.id)}
//               disabled={joiningGiveawayId === g.id}
//             >
//               {joiningGiveawayId === g.id ? "Joining..." : "Join Giveaway"}
//             </button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }
