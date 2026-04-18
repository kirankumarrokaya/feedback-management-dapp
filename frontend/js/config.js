const CONTRACT_ADDRESS = '0x8fdc1e906513f52d4e547a08D7b193ffaa4C79E8';

const CONTRACT_ABI = [
  "function submitFeedback(string memory _text, uint _category) public returns (uint)",
  "function editFeedback(uint _id, string memory _newText) public",
  "function upvoteFeedback(uint _id) public",
  "function downvoteFeedback(uint _id) public",
  "function addResponse(uint _id, string memory _responseText) public",
  "function updateStatus(uint _id, uint _newStatus) public",
  "function getFeedbackById(uint _id) public view returns (uint, string memory, uint, uint, address, uint, uint, uint)",
  "function getAllFeedback() public view returns (uint[] memory, string[] memory, uint[] memory, uint[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory)",
  "function getResponses(uint _id) public view returns (tuple(address adminWallet, string responseText, uint timestamp)[] memory)",
  "function getEditHistory(uint _id) public view returns (tuple(string oldText, string newText, uint timestamp)[] memory)",
  "function getFeedbackCount() public view returns (uint)",
  "function hasUserVoted(uint _id, address _user) public view returns (bool)",
  "function isOwner(address _wallet) public view returns (bool)"
];