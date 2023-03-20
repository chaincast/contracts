//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Broadcasters.sol";

contract Broadcasts is Ownable, Broadcasters {
    struct Category {
        uint16 id;
        bytes32 name;
        // Duration Threshold expressed in days
        uint16 durationThreshold;
        bool enabled;
    }

    struct Broadcast {
        uint256 id;
        uint16 categoryId;
        uint256 broadcasterId;
        string url;
        string checksum;
        uint256 timestamp;
    }

    // Categories Mapping
    mapping(uint16 => Category) public categories;
    uint16 public nextCategoryId = 1;

    // Broadcasts Mapping
    mapping(uint256 => Broadcast) public broadcasts;
    uint256 public nextBroadcastId = 1;

    event BroadcastCreated(
        uint256 id,
        uint16 categoryId,
        uint256 broadcasterId,
        string url,
        string checksum,
        uint256 timestamp
    );

    constructor() {
        // Define initial categories
        Category[] memory initialCategories = new Category[](7);
        initialCategories[0] = Category({
            id: 1,
            name: "Daily Update",
            durationThreshold: 1,
            enabled: true
        });
        initialCategories[1] = Category({
            id: 2,
            name: "Weekly Update",
            durationThreshold: 7,
            enabled: true
        });
        initialCategories[2] = Category({
            id: 3,
            name: "Quarterly Update",
            durationThreshold: 85,
            enabled: true
        });
        initialCategories[3] = Category({
            id: 4,
            name: "Vote Needed",
            durationThreshold: 7,
            enabled: true
        });
        initialCategories[4] = Category({
            id: 5,
            name: "Significant Vote Needed",
            durationThreshold: 85,
            enabled: true
        });
        initialCategories[5] = Category({
            id: 6,
            name: "Security",
            durationThreshold: 180,
            enabled: true
        });
        initialCategories[6] = Category({
            id: 7,
            name: "Action Needed",
            durationThreshold: 180,
            enabled: true
        });

        // Store initial categories
        for (uint i = 0; i < initialCategories.length; i++) {
            categories[initialCategories[i].id] = initialCategories[i];
        }

        // Update the next id
        nextCategoryId = 8;
    }

    // Add more categories
    function categoryCreate(
        bytes32 name,
        uint16 durationThreshold,
        bool enabled
    ) public onlyOwner {
        Category memory newCategory = Category({
            id: nextCategoryId,
            name: name,
            durationThreshold: durationThreshold,
            enabled: enabled
        });
        categories[nextCategoryId] = newCategory;
        nextCategoryId++;
    }

    /**
     * Checks if a category id exists.
     *
     * @param categoryId The category id to check.
     * @return bool Yes or no.
     */
    function categoryExists(uint16 categoryId) public view returns (bool) {
        return categories[categoryId].id != 0;
    }

    /**
     * Creates and publishes a new broadcast.
     *
     * @param categoryId The category id of the broadcast.
     * @param broadcasterId Who performs broadcast.
     * @param url The url of the broadcast.
     * @param checksum The checksum of the broadcast.
     * @return uint256 The id of the created broadcast.
     */
    function broadcastCreate(
        uint16 categoryId,
        uint256 broadcasterId,
        string memory url,
        string memory checksum
    ) public returns (uint256) {
        require(bytes(url).length > 0, "Argument 'url' cannot be empty");
        require(
            bytes(checksum).length > 0,
            "Argument 'checksum' cannot be empty"
        );
        require(
            categoryExists(categoryId),
            "The category does not exist, check your 'categoryId' argument"
        );
        require(
            broadcasterExists(broadcasterId),
            "The broadcaster does not exist, check your 'broadcasterId' argument"
        );
        // Get the broadcaster data and check for privileges of the sender
        Broadcaster memory broadcaster = broadcasters[broadcasterId];
        require(
            msg.sender == broadcaster.owner,
            "No privileges to post as the broadcaster you selected, check your 'broadcasterId' argument"
        );

        // Assign and store the values of the new broadcast
        Broadcast storage broadcast = broadcasts[nextBroadcastId];
        broadcast.id = nextBroadcastId;
        broadcast.categoryId = categoryId;
        broadcast.broadcasterId = broadcasterId;
        broadcast.url = url;
        broadcast.checksum = checksum;
        broadcast.timestamp = block.timestamp;
        nextBroadcastId++;

        // Emit the broadcast created event
        emit BroadcastCreated(
            broadcast.id,
            broadcast.categoryId,
            broadcast.broadcasterId,
            broadcast.url,
            broadcast.checksum,
            broadcast.timestamp
        );

        return nextBroadcastId;
    }
}
