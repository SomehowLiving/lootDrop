// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

// Chainlink VRF
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {VRFCoordinatorV2Interface} from  "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

// OpenZeppelin utils
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title lootDrop - A verifiable ETH-based giveaway system using Chainlink VRF
 */
contract lootDrop is VRFConsumerBaseV2Plus, ReentrancyGuard {
    // --- Chainlink VRF Config ---
    uint64 private immutable s_subscriptionId;
    bytes32 private immutable keyHash;

    uint32 private constant callbackGasLimit = 250000;
    uint16 private constant requestConfirmations = 3;
    uint32 private constant numWords = 1;

    uint256 public lastRequestId;

    // --- Structs and Enums ---
    enum PrizeType {
        ETH,
        NFT,
        Token
    }

    struct Giveaway {
        uint256 id;
        string name;
        PrizeType prizeType;
        uint256 prizeAmount; // Total ETH
        uint256 startTime;
        uint256 endTime;
        address creator;
        uint32 numWinners;
        uint32 maxParticipants;
        address[] participants;
        address[] winners;
        bool isActive;
        bool randomnessRequested;
        bool paidOut;
    }

    // --- State ---
    uint256 public nextGiveawayId;
    mapping(uint256 => Giveaway) public giveaways;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => uint256) public requestIdToGiveaway;

    // --- Events ---
    event GiveawayCreated(uint256 indexed id, string name, address indexed creator);
    event JoinedGiveaway(uint256 indexed id, address indexed participant);
    event WinnersSelected(uint256 indexed id, address[] winners);
    event PrizePaidOut(uint256 indexed id, address[] winners, uint256 amountEach);
    event RandomnessRequested(uint256 indexed id, uint256 requestId);

    // --- Constructor ---
    constructor(uint64 subscriptionId, address vrfCoordinator, bytes32 _keyHash)
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
    }

    // --- Create Giveaway ---
    function createGiveaway(
        string memory _name,
        PrizeType _prizeType,
        uint256 _prizeAmount,
        uint32 _numWinners,
        uint32 _maxParticipants,
        uint256 _durationInSeconds
    ) public payable {
        require(_numWinners > 0, "Must have at least one winner");
        require(_maxParticipants >= _numWinners, "Max participants must be >= number of winners");
        require(_durationInSeconds > 0, "Duration must be > 0");
        require(_prizeType == PrizeType.ETH, "Only ETH prizes supported in MVP");
        require(msg.value == _prizeAmount, string(abi.encodePacked("Expected: ", Strings.toString(_prizeAmount), ", Got: ", Strings.toString(msg.value))));

        Giveaway storage g = giveaways[nextGiveawayId];
        g.id = nextGiveawayId;
        g.name = _name;
        g.prizeType = _prizeType;
        g.prizeAmount = _prizeAmount;
        g.numWinners = _numWinners;
        g.maxParticipants = _maxParticipants;
        g.startTime = block.timestamp;
        g.endTime = block.timestamp + _durationInSeconds;
        g.creator = msg.sender;
        g.isActive = true;

        emit GiveawayCreated(nextGiveawayId, _name, msg.sender);
        nextGiveawayId++;
    }

    // --- Join Giveaway ---
    function joinGiveaway(uint256 _giveawayId) public {
        Giveaway storage g = giveaways[_giveawayId];
        require(g.isActive, "Giveaway is not active");
        require(block.timestamp <= g.endTime, "Giveaway has ended");
        require(!hasJoined[_giveawayId][msg.sender], "Already joined");
        require(g.participants.length < g.maxParticipants, "Giveaway is full");
        require(g.creator != msg.sender, "Creator cannot join");

        g.participants.push(msg.sender);
        hasJoined[_giveawayId][msg.sender] = true;
        emit JoinedGiveaway(_giveawayId, msg.sender);
    }

    // --- Request Random Winners ---
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

    // --- Chainlink Callback ---
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 giveawayId = requestIdToGiveaway[requestId];
        Giveaway storage g = giveaways[giveawayId];

        uint256 participantsLength = g.participants.length;
        uint256 rand = randomWords[0];

        for (uint256 i = 0; i < g.numWinners; i++) {
            uint256 winnerIndex = uint256(keccak256(abi.encode(rand, i))) % participantsLength;
            address winner = g.participants[winnerIndex];
            g.winners.push(winner);

            uint256 lastIndex = participantsLength - 1;
            if (winnerIndex != lastIndex) {
                g.participants[winnerIndex] = g.participants[lastIndex];
            }
            g.participants.pop();
            participantsLength--;
        }

        emit WinnersSelected(giveawayId, g.winners);
    }

    // --- Distribute Prize ---
    function payoutWinners(uint256 _giveawayId) public nonReentrant {
        Giveaway storage g = giveaways[_giveawayId];
        require(!g.isActive, "Giveaway still active");
        require(!g.paidOut, "Already paid");
        require(g.winners.length == g.numWinners, "Winners not finalized");

        uint256 amountPerWinner = g.prizeAmount / g.numWinners;
        for (uint256 i = 0; i < g.winners.length; i++) {
            (bool success, ) = payable(g.winners[i]).call{value: amountPerWinner}("");
            require(success, "Transfer failed");
        }

        g.paidOut = true;
        emit PrizePaidOut(_giveawayId, g.winners, amountPerWinner);
    }

    // --- View Functions ---
    function getParticipants(uint256 _giveawayId) external view returns (address[] memory) {
        return giveaways[_giveawayId].participants;
    }

    function getWinners(uint256 _giveawayId) external view returns (address[] memory) {
        return giveaways[_giveawayId].winners;
    }

    function getActiveGiveaways() external view returns (uint256[] memory activeIds) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextGiveawayId; i++) {
            if (giveaways[i].isActive) count++;
        }

        activeIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextGiveawayId; i++) {
            if (giveaways[i].isActive) {
                activeIds[index++] = i;
            }
        }
    }
}

