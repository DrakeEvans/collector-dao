pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./wrapped-eth.sol";

contract CollectorDao {
    enum Vote {
        NullVote,
        YesVote,
        NoVote
    }

    struct Proposal {
        bool isExecuted;
        uint256 quorumDeadline;
        uint256 deadline;
        uint256 value;
        bytes signature;
        address contractAddress;
        uint256 yesTotal;
        uint256 noTotal;
        mapping(address => Vote) votesByMember;
    }

    struct Member {
        uint256 startDate;
        address delegateTo;
        address originalAddress;
        uint256 votingPower;
    }

    struct NFT {
        address _operator;
        address _from;
        uint256 _tokenId;
        bytes _data;
    }

    NFT[] public nfts;
    address wrappedEthAddress;
    uint256 public nextProposalId = 0;
    mapping(address => Member) public members;
    mapping(uint256 => Proposal) public proposals;
    uint256 public totalMembers;

    modifier onlyMember() {
        require(members[msg.sender].startDate > 0, "Must be a member of the DAO");
        _;
    }

    constructor() {}

    function setWrappedEthAddress(address _address) external {
        wrappedEthAddress = _address;
    }

    function buyMembership() external {
        bool sentWeth = WrappedEth(wrappedEthAddress).transferFrom(msg.sender, address(this), 1 ether);
        require(sentWeth, "WETH transfer failed");
        require(members[msg.sender].startDate == 0, "Member already a part of DAO");
        totalMembers += 1;
        members[msg.sender] = Member({
            startDate: block.timestamp,
            delegateTo: msg.sender,
            originalAddress: msg.sender,
            votingPower: 1
        });
    }

    function delegateVote(address to) external onlyMember {
        Member storage member = members[msg.sender];
        require(member.votingPower > 0, "No votes to delegate");
        Member storage delegateToMember = members[to];
        require(delegateToMember.startDate > 0, "delegateToAddress is not a member");
        delegateToMember.votingPower += 1;
        member.votingPower -= 1;
        member.delegateTo = to;
    }

    function unDelegateVote() external onlyMember {
        Member storage member = members[msg.sender];
        address from = member.delegateTo;
        Member storage delegateFromMember = members[from];
        require(delegateFromMember.startDate > 0, "delegateFromAddress is not a member");

        // Make sure the votes you want back have not already been cast, maybe it is better to just manipulate the actual live proposal vote counts instead
        for (uint256 i = 0; i < nextProposalId; i++) {
            if (block.timestamp < proposals[i].deadline) {
                require(
                    proposals[i].votesByMember[from] == Vote.NullVote,
                    "Can only undelegate votes when delegatee is not in the middle of voting"
                );
            }
        }

        delegateFromMember.votingPower -= 1;
        member.votingPower += 1;
        member.delegateTo = msg.sender;
    }

    function submitProposal(
        address contractAddress,
        bytes calldata signature,
        uint256 quorumDeadline
    ) external onlyMember returns (uint256 proposalId) {
        proposalId = nextProposalId;

        Proposal storage proposal = proposals[proposalId];
        proposal.quorumDeadline = quorumDeadline;
        proposal.signature = signature;
        proposal.contractAddress = contractAddress;

        nextProposalId += 1;
    }

    function castVote(uint256 proposalId, bool vote) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        Vote currentVote = proposal.votesByMember[msg.sender];
        require(currentVote == Vote.NullVote, "Members can only vote once");
        if (vote) {
            proposal.votesByMember[msg.sender] = Vote.YesVote;
            proposal.yesTotal += members[msg.sender].votingPower;
        } else {
            proposal.votesByMember[msg.sender] = Vote.NoVote;
            proposal.noTotal += members[msg.sender].votingPower;
        }

        // Update if quroum has been reached
        if (
            proposal.deadline == 0 &&
            proposal.quorumDeadline > block.timestamp &&
            (proposal.yesTotal + proposal.noTotal) > totalMembers / 4
        ) {
            proposal.deadline = block.timestamp + 604800; // 7 days
        }
    }

    function executeProposal(uint256 proposalId) external returns (bool sent) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.deadline > block.timestamp, "Proposal not passed deadline");
        require(proposal.yesTotal > proposal.noTotal, "Proposal did not pass");
        require(proposal.isExecuted == false, "Proposal already executed");

        (sent, ) = proposal.contractAddress.call{ value: proposal.value }(proposal.signature);
        require(sent, "Executing metatransaction failed");
    }

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external returns (bytes4) {
        nfts.push(NFT({ _operator: _operator, _from: _from, _tokenId: _tokenId, _data: _data }));
    }
}
