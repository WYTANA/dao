//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    address owner;
    Token public token;
    uint256 public quorum;

    struct Proposal {
        uint256 id;
        string name;
        uint256 amount;
        address payable recipient;
        uint256 votes;
        bool finalized;
    }

    uint256 public proposalCount;

    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) votes;

    event Propose(
        uint256 id,
        uint256 amount,
        address recipient,
        address creator
    );

    event Vote(uint256 id, address investor);
    event Finalize(uint256 id);

    // Quorum should be min token qty held by investors to form the quorum
    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    // Allow contract to receive Ether
    receive() external payable {}

    modifier onlyInvestor() {
        require(token.balanceOf(msg.sender) > 0, "Must hold a token!");
        _;
    }

    // Create a proposal
    function createProposal(
        string memory _name,
        uint256 _amount,
        address payable _recipient
    ) external onlyInvestor {
        require(address(this).balance >= _amount);

        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount,
            _name,
            _amount,
            _recipient,
            0,
            false
        );

        emit Propose(proposalCount, _amount, _recipient, msg.sender);
    }

    // Cast a vote for the proposal if you hold a token
    // Each vote is an affirmation while a non-vote is a negation
    function vote(uint256 _id) external onlyInvestor {
        // Fetch the proposal from mapping
        Proposal storage proposal = proposals[_id];

        // No double votes!
        require(!votes[msg.sender][_id], "Already voted!");

        // Update votes with token balances
        proposal.votes += token.balanceOf(msg.sender);

        // Track who has voted to the mapping
        votes[msg.sender][_id] = true;

        // Emit vote event
        emit Vote(_id, msg.sender);
    }

    // Finalize proposal and transfer funds
    function finalizeProposal(uint256 _id) external onlyInvestor {
        // Fetch the proposal from mapping
        Proposal storage proposal = proposals[_id];

        // Proposal cannot already be finalized
        require(!proposal.finalized, "Proposal already finalized");

        // Mark the proposal finalized
        proposal.finalized = true;

        // Check proposal votes equals a quorum
        require(proposal.votes >= quorum, "Must reach quorum for finalization");

        // Contract balance must have enough funds
        require(address(this).balance >= proposal.amount);

        // Transfer funds
        (bool sent, ) = proposal.recipient.call{value: proposal.amount}("");
        require(sent);

        // Emit event
        emit Finalize(_id);
    }
}
