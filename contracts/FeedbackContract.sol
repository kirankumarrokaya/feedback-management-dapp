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
    struct Response {
        address adminWallet;
        string responseText;
        uint timestamp;
    }

    struct EditHistory {
        string oldText;
        string newText;
        uint timestamp;
    }

    struct Feedback {
        uint id;
        string text;
        FeedbackCategory category;
        FeedbackStatus status;
        address submittedBy;
        uint timestamp;
        uint upvotes;
        uint downvotes;
        Response[] responses;
        EditHistory[] editHistory;
    }

    // =====================
    // STATE VARIABLES
    // =====================
    address public owner;
    uint public feedbackCount;
    mapping(uint => Feedback) private feedbacks;
    mapping(uint => mapping(address => bool)) private hasVoted;

    // =====================
    // EVENTS
    // =====================
    event FeedbackSubmitted(uint indexed id, address indexed wallet, FeedbackCategory category);
    event FeedbackEdited(uint indexed id, string oldText, string newText);
    event ResponseAdded(uint indexed id, address indexed admin, string responseText);
    event StatusUpdated(uint indexed id, FeedbackStatus newStatus);
    event Upvoted(uint indexed id, address indexed voter);
    event Downvoted(uint indexed id, address indexed voter);

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

    modifier notVoted(uint _id) {
        require(!hasVoted[_id][msg.sender], "Already voted on this feedback");
        _;
    }

    modifier onlySubmitter(uint _id) {
        require(feedbacks[_id].submittedBy == msg.sender, "Not your feedback");
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

        Feedback storage f = feedbacks[feedbackCount];
        f.id = feedbackCount;
        f.text = _text;
        f.category = FeedbackCategory(_category);
        f.status = FeedbackStatus.PENDING;
        f.submittedBy = msg.sender;
        f.timestamp = block.timestamp;
        f.upvotes = 0;
        f.downvotes = 0;

        emit FeedbackSubmitted(feedbackCount, msg.sender, FeedbackCategory(_category));
        return feedbackCount;
    }

    function editFeedback(
        uint _id,
        string memory _newText
    ) public feedbackExists(_id) onlySubmitter(_id) {
        require(bytes(_newText).length > 0, "New text cannot be empty");
        require(
            feedbacks[_id].status == FeedbackStatus.PENDING,
            "Can only edit pending feedback"
        );

        string memory oldText = feedbacks[_id].text;

        feedbacks[_id].editHistory.push(EditHistory({
            oldText: oldText,
            newText: _newText,
            timestamp: block.timestamp
        }));

        feedbacks[_id].text = _newText;

        emit FeedbackEdited(_id, oldText, _newText);
    }

    // =====================
    // VOTING FUNCTIONS
    // =====================
    function upvoteFeedback(
        uint _id
    ) public feedbackExists(_id) notVoted(_id) {
        require(
            feedbacks[_id].submittedBy != msg.sender,
            "Cannot vote on your own feedback"
        );

        feedbacks[_id].upvotes++;
        hasVoted[_id][msg.sender] = true;

        emit Upvoted(_id, msg.sender);
    }

    function downvoteFeedback(
        uint _id
    ) public feedbackExists(_id) notVoted(_id) {
        require(
            feedbacks[_id].submittedBy != msg.sender,
            "Cannot vote on your own feedback"
        );

        feedbacks[_id].downvotes++;
        hasVoted[_id][msg.sender] = true;

        emit Downvoted(_id, msg.sender);
    }

    function getVoteScore(uint _id) public view feedbackExists(_id) returns (int) {
        return int(feedbacks[_id].upvotes) - int(feedbacks[_id].downvotes);
    }

    function hasUserVoted(uint _id, address _user) public view returns (bool) {
        return hasVoted[_id][_user];
    }

    // =====================
    // ADMIN FUNCTIONS
    // =====================
    function addResponse(
        uint _id,
        string memory _responseText
    ) public onlyOwner feedbackExists(_id) {
        require(bytes(_responseText).length > 0, "Response cannot be empty");

        feedbacks[_id].responses.push(Response({
            adminWallet: msg.sender,
            responseText: _responseText,
            timestamp: block.timestamp
        }));

        if (feedbacks[_id].status == FeedbackStatus.PENDING) {
            feedbacks[_id].status = FeedbackStatus.REVIEWED;
        }

        emit ResponseAdded(_id, msg.sender, _responseText);
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
    function getFeedbackById(uint _id)
        public view feedbackExists(_id)
        returns (
            uint id,
            string memory text,
            uint category,
            uint status,
            address submittedBy,
            uint timestamp,
            uint upvotes,
            uint downvotes
        )
    {
        Feedback storage f = feedbacks[_id];
        return (
            f.id,
            f.text,
            uint(f.category),
            uint(f.status),
            f.submittedBy,
            f.timestamp,
            f.upvotes,
            f.downvotes
        );
    }

    function getResponses(uint _id)
        public view feedbackExists(_id)
        returns (Response[] memory)
    {
        return feedbacks[_id].responses;
    }

    function getEditHistory(uint _id)
        public view feedbackExists(_id)
        returns (EditHistory[] memory)
    {
        return feedbacks[_id].editHistory;
    }

    function getAllFeedback()
        public view
        returns (
            uint[] memory ids,
            string[] memory texts,
            uint[] memory categories,
            uint[] memory statuses,
            address[] memory submitters,
            uint[] memory timestamps,
            uint[] memory upvotesArr,
            uint[] memory downvotesArr
        )
    {
        ids = new uint[](feedbackCount);
        texts = new string[](feedbackCount);
        categories = new uint[](feedbackCount);
        statuses = new uint[](feedbackCount);
        submitters = new address[](feedbackCount);
        timestamps = new uint[](feedbackCount);
        upvotesArr = new uint[](feedbackCount);
        downvotesArr = new uint[](feedbackCount);

        for (uint i = 1; i <= feedbackCount; i++) {
            Feedback storage f = feedbacks[i];
            ids[i-1] = f.id;
            texts[i-1] = f.text;
            categories[i-1] = uint(f.category);
            statuses[i-1] = uint(f.status);
            submitters[i-1] = f.submittedBy;
            timestamps[i-1] = f.timestamp;
            upvotesArr[i-1] = f.upvotes;
            downvotesArr[i-1] = f.downvotes;
        }
    }

    function getFeedbackCount() public view returns (uint) {
        return feedbackCount;
    }

    function isOwner(address _wallet) public view returns (bool) {
        return _wallet == owner;
    }
}