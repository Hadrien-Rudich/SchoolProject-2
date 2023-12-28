const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const {
  deployVotingFixtureAtVotingSessionStart,
  deployVotingFixtureAtProposalRegisteringStart,
} = require("./Fixtures");

describe("addProposal", function () {
  it("Should NOT be available to users other than voters", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
      "You're not a voter"
    );
  });

  it("Should NOT be available outside of Proposal Registration Start", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );
    let proposalDescription = "Default proposal description";
    await expect(
      voting.connect(addr1).addProposal(proposalDescription)
    ).to.be.revertedWith("Proposals are not allowed yet");
  });
  it("Should NOT allow an empty proposal description", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    let emptyProposalDescription = "";

    await expect(
      voting.connect(addr1).addProposal(emptyProposalDescription)
    ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
  });

  it("Should add a proposal", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    let proposalDescription = "This is a default proposal description";
    await voting.connect(addr1).addProposal(proposalDescription);

    const verifiedProposal = await voting.connect(addr2).getOneProposal(1);
    expect(verifiedProposal.description).to.equal(proposalDescription);
    expect(verifiedProposal.voteCount).to.equal(0);
  });

  it("Should emit a broadcast at Proposal Registration", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    let proposalDescription = "This is a default proposal description";

    await expect(voting.connect(addr1).addProposal(proposalDescription))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(1);
  });
});
