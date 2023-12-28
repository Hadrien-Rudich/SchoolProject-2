const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const {
  deployVotingFixtureAtDefaultWorkflowStatus,
  deployVotingFixtureAtVotingSessionStart,
  deployVotingFixtureAtProposalRegisteringStart,
  deployVotingFixtureAtVotingSessionEnd,
} = require("./Fixtures");

describe("startProposalsRegistering", function () {
  it("Should NOT be available to users other than owner", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );
    await expect(voting.connect(addr1).startProposalsRegistering())
      .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should NOT be available outside of Voters Registration", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    await expect(voting.startProposalsRegistering()).to.be.revertedWith(
      "Registering proposals cant be started now"
    );
  });
  it("Should change the status to ProposalsRegistrationStarted", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );

    await voting.startProposalsRegistering();

    expect(await voting.workflowStatus()).to.equal(1);
  });

  it("Should add the GENESIS proposal when starting Proposal Registration", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );

    await voting.addVoter(addr1.address);
    await voting.startProposalsRegistering();

    // Retrieve the first proposal
    const genesisProposal = await voting.connect(addr1).getOneProposal(0);

    expect(genesisProposal.description).to.equal("GENESIS");
  });

  it("Should emit a broadcast at workflow status change", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );

    await expect(voting.startProposalsRegistering())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(0, 1);
  });
});

describe("endProposalsRegistering", function () {
  it("Should NOT be available to users other than owner", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    await expect(voting.connect(addr1).endProposalsRegistering())
      .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should NOT be available outside of Proposals Registration", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    await expect(voting.endProposalsRegistering()).to.be.revertedWith(
      "Registering proposals havent started yet"
    );
  });

  it("Should change the status to ProposalsRegistrationEnded", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtDefaultWorkflowStatus
    );

    await voting.startProposalsRegistering();
    await voting.endProposalsRegistering();

    expect(await voting.workflowStatus()).to.equal(2);
  });

  it("Should emit a broadcast at workflow status change", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    await expect(voting.endProposalsRegistering())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(1, 2);
  });
});

describe("startVotingSession", function () {
  it("Should NOT be available to users other than owner", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );
    // ensure the proper workflow
    await voting.endProposalsRegistering();

    await expect(voting.connect(addr1).startVotingSession())
      .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should NOT be available outside of Proposal Registration End", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    await expect(voting.startVotingSession()).to.be.revertedWith(
      "Registering proposals phase is not finished"
    );
  });

  it("Should change the status to VotingSessionStarted", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    await voting.endProposalsRegistering();
    await voting.startVotingSession();

    expect(await voting.workflowStatus()).to.equal(3);
  });
  it("Should emit a broadcast at workflow status change", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    // ensure the proper workflow
    await voting.endProposalsRegistering();

    await expect(voting.startVotingSession())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(2, 3);
  });
});

describe("endVotingSession", function () {
  it("Should NOT be available to users other than owner", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );
    await expect(voting.connect(addr1).endVotingSession())
      .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should NOT be available outside of Vote Submission Start", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtProposalRegisteringStart
    );

    await expect(voting.endVotingSession()).to.be.revertedWith(
      "Voting session havent started yet"
    );
  });
  it("Should change the status to VotingSessionEnded", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    await voting.endVotingSession();

    expect(await voting.workflowStatus()).to.equal(4);
  });

  it("Should emit a broadcast at workflow status change", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    await expect(voting.endVotingSession())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(3, 4);
  });
});
describe("tallyVotes", function () {
  it("Should not be available to users other than owner", async function () {
    const { voting, addr1 } = await loadFixture(
      deployVotingFixtureAtVotingSessionEnd
    );
    await expect(voting.connect(addr1).tallyVotes())
      .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should NOT be available before Vote Submission has ended", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );
    await expect(voting.tallyVotes()).to.be.revertedWith(
      "Current status is not voting session ended"
    );
  });

  it("Should tally votes and update the winning proposal", async function () {
    const { voting } = await loadFixture(deployVotingFixtureAtVotingSessionEnd);

    // Retrieve the winning proposal ID before votes are tallied
    let winningProposalID = await voting.winningProposalID();
    expect(winningProposalID).to.equal(0);

    await voting.tallyVotes();

    // Retrieve the winning proposal ID after votes are tallied
    winningProposalID = await voting.winningProposalID();
    expect(winningProposalID).to.equal(1);
  });
  it("Should change the status to VotesTallied", async function () {
    const { voting } = await loadFixture(deployVotingFixtureAtVotingSessionEnd);

    await voting.tallyVotes();

    expect(await voting.workflowStatus()).to.equal(5);
  });
  it("Should emit a broadcast at workflow status change", async function () {
    const { voting } = await loadFixture(
      deployVotingFixtureAtVotingSessionStart
    );

    // ensure the proper workflow
    await voting.endVotingSession();

    await expect(voting.tallyVotes())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(4, 5);
  });
});
