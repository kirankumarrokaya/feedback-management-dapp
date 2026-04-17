// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FeedbackContract {

    // =====================
    // ENUMS
    // =====================
    enum FeedbackCategory { TEACHING, FACILITIES, ADMIN, OTHER }
    enum FeedbackStatus { PENDING, REVIEWED, RESOLVED }

    // =====================
    // STRUCTS
    // =====================
    struct Feedback {
        uint id;
        string text;
        FeedbackCategory category;
        FeedbackStatus status;
        address submittedBy;
        string response;
        uint timestamp;
    }

    // =====================
    // STATE VARIABLES
    // =====================
    address public owner;
    uint public feedbackCount;
    mapping(uint => Feedback) private feedbacks;

    // =====================
    // EVENTS
    // =====================
    event FeedbackSubmitted(uint indexed id, address indexed wallet, FeedbackCategory category);
    event FeedbackResponded(uint indexed id, address indexed admin, string response);
    event StatusUpdated(uint indexed id, FeedbackStatus newStatus);

    // =====================
    // MODIFIERS
    // =====================
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Admin only");
        _;
    }

    modifier feedbackExists(uint _id) {
        require(_id > 0 && _id <= feedbackCount, "Feedback does not exist");
        _;
    }

    // =====================
    // CONSTRUCTOR
    // =====================
    constructor() {
        owner = msg.sender;
        feedbackCount = 0;
    }

    // =====================
    // STUDENT FUNCTIONS
    // =====================
    function submitFeedback(
        string memory _text,
        uint _category
    ) public returns (uint) {
        require(bytes(_text).length > 0, "Feedback text cannot be empty");
        require(_category <= 3, "Invalid category");

        feedbackCount++;

        feedbacks[feedbackCount] = Feedback({
            id: feedbackCount,
            text: _text,
            category: FeedbackCategory(_category),
            status: FeedbackStatus.PENDING,
            submittedBy: msg.sender,
            response: "",
            timestamp: block.timestamp
        });

        emit FeedbackSubmitted(feedbackCount, msg.sender, FeedbackCategory(_category));
        return feedbackCount;
    }

    // =====================
    // ADMIN FUNCTIONS
    // =====================
    function respondToFeedback(
        uint _id,
        string memory _response
    ) public onlyOwner feedbackExists(_id) {
        require(bytes(_response).length > 0, "Response cannot be empty");

        feedbacks[_id].response = _response;
        feedbacks[_id].status = FeedbackStatus.REVIEWED;

        emit FeedbackResponded(_id, msg.sender, _response);
    }

    function updateStatus(
        uint _id,
        uint _newStatus
    ) public onlyOwner feedbackExists(_id) {
        require(_newStatus <= 2, "Invalid status");

        FeedbackStatus currentStatus = feedbacks[_id].status;
        FeedbackStatus newStatus = FeedbackStatus(_newStatus);

        require(
            uint(newStatus) > uint(currentStatus),
            "Cannot go back to previous status"
        );

        feedbacks[_id].status = newStatus;
        emit StatusUpdated(_id, newStatus);
    }

    // =====================
    // READ FUNCTIONS
    // =====================
    function getFeedbackById(
        uint _id
    ) public view feedbackExists(_id) returns (Feedback memory) {
        return feedbacks[_id];
    }

    function getAllFeedback() public view returns (Feedback[] memory) {
        Feedback[] memory allFeedback = new Feedback[](feedbackCount);
        for (uint i = 1; i <= feedbackCount; i++) {
            allFeedback[i - 1] = feedbacks[i];
        }
        return allFeedback;
    }

    function getFeedbackCount() public view returns (uint) {
        return feedbackCount;
    }

    function isOwner(address _wallet) public view returns (bool) {
        return _wallet == owner;
    }
}