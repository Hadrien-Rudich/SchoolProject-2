const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { deployVotingFixtureAtProposalRegisteringStart } = require("./Fixtures");

describe("getVoter", function () {
  it("Should NOT be available to users other than voters", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
      "You're not a voter"
    );
  });
  it("Should return the voter with matching address", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    const voterDetails = await voting.connect(addr1).getVoter(addr2.address);

    expect(voterDetails.isRegistered).to.equal(true);
  });
});

describe("getOneProposal", function () {
  it("Should NOT be available to users other than voters", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
      "You're not a voter"
    );
  });
  it("Should return the proposal with matching id", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    let newProposalDescription = "Test Proposal";
    await voting.connect(addr1).addProposal(newProposalDescription);

    const foundProposal = await voting.connect(addr2).getOneProposal(1);

    expect(foundProposal.description).to.equal(newProposalDescription);
    expect(foundProposal.voteCount).to.equal(0);
  });
});
