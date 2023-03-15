//SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Broadcasters is Ownable {
    struct Broadcaster {
        uint256 id;
        string name;
        uint256 primaryChainId;
        uint256[] secondaryChainIds;
        string website;
        string discord;
        address owner;
        bool isActive;
        bool isApproved;
    }

    // Broadcasters id increment
    uint256 lastBroadcasterId = 0;

    // How many broadcaster records a single address can create
    uint16 constant MAX_BROADCASTERS_PER_ADDRESS = 3;

    // Main broadcasters state
    mapping(uint256 => Broadcaster) public broadcasters;
    // Keep track of how many broadcasters are owned by a specific address
    mapping(address => uint16) private _broadcastersPerAddress;
    // Keep track of used broadcaster names to ensure their uniqueness
    mapping(string => bool) private _broadcasterNames;

    event BroadcasterCreated(
        uint256 id,
        string name,
        uint256 primaryChainId,
        uint256[] secondaryChainIds,
        string website,
        string discord,
        address owner
    );

    constructor() {}

    /**
     * Create a broadcaster record.
     */
    function createBroadcaster(
        string memory name,
        uint256 primaryChainId,
        uint256[] memory secondaryChainIds,
        string memory website,
        string memory discord
    ) public returns (uint256 broadcasterId) {
        require(
            _broadcastersPerAddress[_msgSender()] <
                MAX_BROADCASTERS_PER_ADDRESS,
            "Maximum allowed created Broadcasters reached"
        );
        require(bytes(name).length > 0, "name cannot be empty");
        require(
            !_broadcasterNames[name],
            "name has already been used - choose a different one"
        );
        require(
            !_broadcasterNames[name],
            "name has already been used - choose a different one"
        );

        // Check if sender has created a broadcaster before and increment
        if (_broadcastersPerAddress[_msgSender()] > 0) {
            _broadcastersPerAddress[_msgSender()] += 1;
        } else {
            _broadcastersPerAddress[_msgSender()] = 1;
        }

        // Prepare the Broadcaster record
        lastBroadcasterId += 1;
        Broadcaster storage broadcaster = broadcasters[lastBroadcasterId];
        broadcaster.id = lastBroadcasterId;
        broadcaster.name = name;
        broadcaster.primaryChainId = primaryChainId;
        broadcaster.secondaryChainIds = secondaryChainIds;
        broadcaster.website = website;
        broadcaster.discord = discord;
        broadcaster.owner = _msgSender();
        // FIXME: MVP activate and approve new broadcasters by default
        broadcaster.isActive = true;
        broadcaster.isApproved = true;

        // Dispatch Broadcaster created event
        emit BroadcasterCreated(
            broadcaster.id,
            broadcaster.name,
            broadcaster.primaryChainId,
            broadcaster.secondaryChainIds,
            broadcaster.website,
            broadcaster.discord,
            broadcaster.owner
        );

        return lastBroadcasterId;
    }

    /**
     * Approves a broadcaster to operate, owner only can invoke this.
     *
     * @param broadcasterId The id of the broadcaster.
     */
    function approveBroadcaster(uint256 broadcasterId) public onlyOwner {
        Broadcaster storage broadcaster = broadcasters[broadcasterId];
        broadcaster.isActive = true;
        broadcaster.isApproved = true;
    }
}
