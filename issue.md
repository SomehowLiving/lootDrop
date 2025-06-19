# 🐛Giveaway Fails with `UNPREDICTABLE_GAS_LIMIT` Error

## Summary

When attempting to finalize a giveaway by calling `requestRandomWinner` from the frontend, the transaction fails with a `UNPREDICTABLE_GAS_LIMIT` error, indicating a possible revert or failed internal condition. This occurs even when the giveaway has already ended and the caller is the creator.

---

## 💥 Error Details

### Console Output
```
ActiveGiveaways.jsx:101 Finalize failed Error: cannot estimate gas; transaction may fail or may require manual gas limit
[ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ]
(reason="execution reverted", method="estimateGas", transaction={
"from": "0xB60e52BF3E12A8860E7D4715e0F6D30Bea37b198",
"to": "0x8Ccf651C528B5acEc99371d35967bbBE217D5BfB",
"data": "0xa3fc2e8d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
"accessList": null
}, error={
"code": 3,
"message": "execution reverted",
"data": "0x1f6a65b6"
})
```


---

## 📜 Smart Contract Snippet

```solidity
function requestRandomWinner(uint256 _giveawayId, bool enableNativePayment) public {
    Giveaway storage g = giveaways[_giveawayId];

    require(g.creator == msg.sender, "Only creator can request winners");
    require(!g.randomnessRequested, "Randomness already requested");
    require(g.isActive, "Giveaway not active");
    require(block.timestamp > g.endTime || g.participants.length == g.maxParticipants, "Giveaway ongoing");
    require(g.participants.length >= g.numWinners, "Not enough participants");

    g.isActive = false;
    g.randomnessRequested = true;

    uint256 requestId = s_vrfCoordinator.requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: s_subscriptionId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({ nativePayment: enableNativePayment })
            )
        })
    );

    requestIdToGiveaway[requestId] = _giveawayId;
    lastRequestId = requestId;

    emit RandomnessRequested(_giveawayId, requestId);
}
```

## 🧠 Frontend Code

```javascript
const finalizeGiveaway = async (giveawayId) => {
  try {
    const contract = getContract(signer);
    setGiveaways((prev) =>
      prev.map((g) => (g.id === giveawayId ? { ...g, finalizing: true } : g))
    );

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

```

## ✅ Conditions at Time of Call
Giveaway has ended
Maximum participants reached
The caller is the creator
Chainlink VRF is used (v2+)

