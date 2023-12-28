const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const {
  deployVotingFixtureAtProposalRegisteringStart,
  deployVotingFixtureAtDefaultWorkflowStatus,
} = require("./Fixtures");

describe("addVoter", function () {
  it("Should NOT be available to users other than owner", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );
    await expect(voting.connect(addr1).addVoter(addr2.address))
      .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should NOT be available outside of Voter Registration", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    await expect(voting.addVoter(addr1.address)).to.be.revertedWith(
      "Voters registration is not open yet"
    );
  });
  it("Should NOT add an already registered voter address", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );
    await voting.addVoter(addr1.address);
    await expect(voting.addVoter(addr1.address)).to.be.revertedWith(
      "Already registered"
    );
  });
  it("Should allow owner to register new voters", async function () {
    const { voting, addr1, addr2 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );

    await voting.addVoter(addr1.address);
    await voting.addVoter(addr2.address);

    const voterDetails = await voting.connect(addr1).getVoter(addr2.address);

    expect(voterDetails.isRegistered).to.equal(true);
  });

  it("Should emit a broadcast at voter registration", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );
    await expect(voting.addVoter(addr1.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(addr1.address);
  });
});
