const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const {
  deployVotingFixtureAtVotingSessionStart,
  deployVotingFixtureAtProposalRegisteringStart,
} = require("./Fixtures");

describe("setVote", function () {
  it("Should NOT be available to users other than voters", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    await expect(voting.setVote(1)).to.be.revertedWith("You're not a voter");
  });

  it("Should NOT be available outside of Voting Session Start", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith(
      "Voting session havent started yet"
    );
  });

  it("Should NOT allow more than 1 vote", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );
    // voter before vote is cast
    let verifiedVoter = await voting.connect(addr2).getVoter(addr1.address);
    expect(verifiedVoter.votedProposalId).to.equal(0);
    expect(verifiedVoter.hasVoted).to.equal(false);

    await voting.connect(addr1).setVote(1);

    // voter after vote is cast
    verifiedVoter = await voting.connect(addr2).getVoter(addr1.address);
    expect(verifiedVoter.votedProposalId).to.equal(1);
    expect(verifiedVoter.hasVoted).to.equal(true);

    await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith(
      "You have already voted"
    );
  });

  it("Should NOT allow votes for an invalid proposalId", async function () {
    const { voting, addr1, addr2, addr3 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    // verify that proposal doesn't exist
    // let invalidProposalId = await voting.connect(addr3).getOneProposal(99);
    // this is actually returning an error and should be handled in the smart contract
    // Error: VM Exception while processing transaction: reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)

    await expect(voting.connect(addr3).setVote(99)).to.be.revertedWith(
      "Proposal not found"
    );
  });

  it("Should increment the proposal's vote count after a vote is cast", async function () {
    const { voting, addr1, addr2, addr3 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    // proposal votecount before vote is cast
    let verifiedProposal = await voting.connect(addr2).getOneProposal(1);
    expect(verifiedProposal.voteCount).to.equal(0);

    await voting.connect(addr1).setVote(1);
    await voting.connect(addr2).setVote(1);
    await voting.connect(addr3).setVote(1);

    // proposal votecount after vote is cast
    verifiedProposal = await voting.connect(addr2).getOneProposal(1);
    expect(verifiedProposal.voteCount).to.equal(3);
  });
  it("Should update the voter's status after a vote is cast", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    // voter before vote is cast
    let verifiedVoter = await voting.connect(addr1).getVoter(addr2.address);
    expect(verifiedVoter.votedProposalId).to.equal(0);
    expect(verifiedVoter.hasVoted).to.equal(false);

    await voting.connect(addr2).setVote(1);

    // voter after vote is cast
    verifiedVoter = await voting.connect(addr1).getVoter(addr2.address);
    expect(verifiedVoter.votedProposalId).to.equal(1);
    expect(verifiedVoter.hasVoted).to.equal(true);
  });

  it("Should emit a broadcast at vote submission", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    await expect(voting.connect(addr1).setVote(1))
      .to.emit(voting, "Voted")
      .withArgs(addr1.address, 1);
  });
});
