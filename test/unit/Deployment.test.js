const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { deployVotingFixtureAtDefaultWorkflowStatus } = require("./Fixtures");

describe("Deployment", function () {
  it("Should set the right owner", async function () {
    const { voting, owner } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );

    expect(await voting.owner()).to.equal(owner.address);
  });
  it("Should start in the RegisteringVoters status", async function () {
    expect(await voting.workflowStatus()).to.equal(0);
  });
});
