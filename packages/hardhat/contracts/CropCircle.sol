// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MemeToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100000 * 10**decimals());
    }
}

contract CropCircle is Ownable, ReentrancyGuard {
    struct Meme {
        string name;
        string imageHash;
        string description;
        address creator;
        uint256 upvotes;
        uint256 downvotes;
        uint256 timestamp;
        bool exists;
        address[] upvoters;
    }

    struct Event {
        uint256 startTime;
        uint256 endTime;
        string eventUri;  // URL of the dapp for this event
        bool active;
        uint256 memeCount;
        uint256 winningMemeId;
        address tokenAddress;
    }

    mapping(bytes32 => Event) public events;
    mapping(bytes32 => mapping(uint256 => Meme)) public memes;
    mapping(address => mapping(bytes32 => uint256)) public userCropBalance;
    mapping(bytes32 => mapping(uint256 => mapping(address => int8))) public userVotes;
    mapping(bytes32 => uint256[]) public eventMemeIds;

    uint256 constant public INITIAL_CROP_AMOUNT = 100;
    uint256 constant public SUBMISSION_COST = 60;
    uint256 constant public VOTE_COST = 1;
    uint256 constant public TOTAL_TOKEN_SUPPLY = 100000;

    event EventCreated(bytes32 indexed eventId, uint256 startTime, uint256 endTime, string eventUri);
    event MemeSubmitted(bytes32 indexed eventId, uint256 indexed memeId, address creator, string name, string imageHash);
    event VoteCast(bytes32 indexed eventId, uint256 indexed memeId, address voter, bool isUpvote);
    event EventEnded(bytes32 indexed eventId, uint256 winningMemeId, address tokenAddress);
    event VoteStatusUpdated(bytes32 indexed eventId, uint256 indexed memeId, uint256 upvotes, uint256 downvotes);

    constructor() Ownable() {}

    function createEvent(uint256 _duration, string memory _eventUri) external onlyOwner returns (bytes32) {
        require(_duration > 0, "Invalid duration");
        require(bytes(_eventUri).length > 0, "Invalid event URI");

        bytes32 eventId = keccak256(abi.encodePacked(block.timestamp, _eventUri));
        
        events[eventId] = Event({
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            eventUri: _eventUri,
            active: true,
            memeCount: 0,
            winningMemeId: 0,
            tokenAddress: address(0)
        });

        emit EventCreated(eventId, block.timestamp, block.timestamp + _duration, _eventUri);
        return eventId;
    }

    function submitMeme(
        bytes32 _eventId,
        string memory _name,
        string memory _imageHash,
        string memory _description
    ) external nonReentrant {
        Event storage event_ = events[_eventId];
        require(event_.active, "Event not active");
        require(block.timestamp <= event_.endTime, "Event ended");
        require(bytes(_name).length > 0 && bytes(_imageHash).length > 0, "Invalid input");

        // Initialize CROP balance for new users
        if (userCropBalance[msg.sender][_eventId] == 0) {
            userCropBalance[msg.sender][_eventId] = INITIAL_CROP_AMOUNT;
        }

        require(userCropBalance[msg.sender][_eventId] >= SUBMISSION_COST, "Insufficient CROP");

        userCropBalance[msg.sender][_eventId] -= SUBMISSION_COST;
        uint256 memeId = event_.memeCount + 1;

        memes[_eventId][memeId] = Meme({
            name: _name,
            imageHash: _imageHash,
            description: _description,
            creator: msg.sender,
            upvotes: 0,
            downvotes: 0,
            timestamp: block.timestamp,
            exists: true,
            upvoters: new address[](0)
        });

        event_.memeCount = memeId;
        eventMemeIds[_eventId].push(memeId);

        emit MemeSubmitted(_eventId, memeId, msg.sender, _name, _imageHash);
    }

    function vote(
        bytes32 _eventId,
        uint256 _memeId,
        bool _isUpvote
    ) external nonReentrant {
        Event storage event_ = events[_eventId];
        require(event_.active, "Event not active");
        require(block.timestamp <= event_.endTime, "Event ended");
        require(memes[_eventId][_memeId].exists, "Meme doesn't exist");
        
        // Initialize CROP balance for new users
        if (userCropBalance[msg.sender][_eventId] == 0) {
            userCropBalance[msg.sender][_eventId] = INITIAL_CROP_AMOUNT;
        }

        require(userCropBalance[msg.sender][_eventId] >= VOTE_COST, "Insufficient CROP");
        require(userVotes[_eventId][_memeId][msg.sender] == 0, "Already voted");
        require(memes[_eventId][_memeId].creator != msg.sender, "Cannot vote own meme");

        userCropBalance[msg.sender][_eventId] -= VOTE_COST;
        
        Meme storage meme = memes[_eventId][_memeId];
        if (_isUpvote) {
            meme.upvotes++;
            meme.upvoters.push(msg.sender);
            userVotes[_eventId][_memeId][msg.sender] = 1;
        } else {
            meme.downvotes++;
            userVotes[_eventId][_memeId][msg.sender] = -1;
        }

        emit VoteCast(_eventId, _memeId, msg.sender, _isUpvote);
        emit VoteStatusUpdated(_eventId, _memeId, meme.upvotes, meme.downvotes);
    }

    function endEvent(bytes32 _eventId) external onlyOwner {
        Event storage event_ = events[_eventId];
        require(event_.active, "Event not active");
        require(block.timestamp >= event_.endTime, "Event still ongoing");

        uint256 winningMemeId = getWinningMeme(_eventId);
        require(winningMemeId > 0, "No valid winner");

        event_.active = false;
        event_.winningMemeId = winningMemeId;

        // Deploy and distribute new token
        Meme memory winningMeme = memes[_eventId][winningMemeId];
        MemeToken newToken = new MemeToken(winningMeme.name, winningMeme.name);
        event_.tokenAddress = address(newToken);

        // Distribute tokens
        distributeTokens(_eventId, winningMemeId, address(newToken));

        emit EventEnded(_eventId, winningMemeId, address(newToken));
    }

    // View Functions
    function getEventDetails(bytes32 _eventId) external view returns (
        uint256 startTime,
        uint256 endTime,
        string memory eventUri,
        bool active,
        uint256 memeCount,
        uint256 winningMemeId,
        address tokenAddress
    ) {
        Event storage event_ = events[_eventId];
        return (
            event_.startTime,
            event_.endTime,
            event_.eventUri,
            event_.active,
            event_.memeCount,
            event_.winningMemeId,
            event_.tokenAddress
        );
    }

    function getMemeDetails(bytes32 _eventId, uint256 _memeId) external view returns (
        string memory name,
        string memory imageHash,
        string memory description,
        address creator,
        uint256 upvotes,
        uint256 downvotes,
        uint256 timestamp,
        bool exists
    ) {
        Meme storage meme = memes[_eventId][_memeId];
        return (
            meme.name,
            meme.imageHash,
            meme.description,
            meme.creator,
            meme.upvotes,
            meme.downvotes,
            meme.timestamp,
            meme.exists
        );
    }

    function getMemesSorted(bytes32 _eventId, bool sortByUpvotes) external view returns (uint256[] memory) {
        uint256[] memory memeIds = eventMemeIds[_eventId];
        uint256[] memory sortedIds = new uint256[](memeIds.length);
        
        // Copy IDs to sortedIds
        for (uint256 i = 0; i < memeIds.length; i++) {
            sortedIds[i] = memeIds[i];
        }
        
        // Simple bubble sort
        for (uint256 i = 0; i < sortedIds.length; i++) {
            for (uint256 j = i + 1; j < sortedIds.length; j++) {
                bool shouldSwap;
                if (sortByUpvotes) {
                    shouldSwap = memes[_eventId][sortedIds[i]].upvotes < memes[_eventId][sortedIds[j]].upvotes;
                } else {
                    // For timestamps, newer (larger timestamp) should come first
                    shouldSwap = memes[_eventId][sortedIds[i]].timestamp < memes[_eventId][sortedIds[j]].timestamp;
                }
                
                if (shouldSwap) {
                    uint256 temp = sortedIds[i];
                    sortedIds[i] = sortedIds[j];
                    sortedIds[j] = temp;
                }
            }
        }
        
        return sortedIds;
    }

    function getWinningMeme(bytes32 _eventId) public view returns (uint256) {
        uint256 highestUpvotes = 0;
        uint256 winningId = 0;
        
        for (uint256 i = 1; i <= events[_eventId].memeCount; i++) {
            if (memes[_eventId][i].upvotes > highestUpvotes) {
                highestUpvotes = memes[_eventId][i].upvotes;
                winningId = i;
            }
        }
        
        return winningId;
    }

    function distributeTokens(bytes32 _eventId, uint256 _winningMemeId, address _tokenAddress) internal {
        MemeToken token = MemeToken(_tokenAddress);
        Meme storage winningMeme = memes[_eventId][_winningMemeId];

        // Calculate total supply
        uint256 totalSupply = TOTAL_TOKEN_SUPPLY * 10**18;
        
        // 30% to creator
        uint256 creatorShare = (totalSupply * 30) / 100;
        token.transfer(winningMeme.creator, creatorShare);

        // 70% distributed among upvoters proportionally
        uint256 upvoterShare = (totalSupply * 70) / 100;
        uint256 totalUpvotes = winningMeme.upvotes;
        
        if (totalUpvotes > 0) {
            uint256 tokensPerVote = upvoterShare / totalUpvotes;
            for (uint256 i = 0; i < winningMeme.upvoters.length; i++) {
                token.transfer(winningMeme.upvoters[i], tokensPerVote);
            }
        }
    }
}