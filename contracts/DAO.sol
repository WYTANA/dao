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
    mapping(address => mapping(uint256 => bool)) public votes;

    event Propose(
        uint256 id,
        uint256 amount,
        address recipient,
        address creator
    );

    event Vote(uint256 id, address investor);

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

    // Cast a vote if you hold a token
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
}
