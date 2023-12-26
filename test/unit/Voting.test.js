const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

async function deployVotingFixtureAtDefaultStatus() {
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  let contract = await ethers.getContractFactory("Voting");
  voting = await contract.deploy();
  return { voting, owner, addr1, addr2, addr3 };
}

async function deployVotingFixtureAtProposalRegisteringStart() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  const contract = await ethers.getContractFactory("Voting");
  const voting = await contract.deploy();

  // adding addr1 & addr2 as registered voters at contract deployment
  await voting.addVoter(addr1.address);
  await voting.addVoter(addr2.address);

  // changing workflow status
  await voting.startProposalsRegistering();

  return { voting, owner, addr1, addr2 };
}

async function deployVotingFixtureAtVotingSessionStart() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  const contract = await ethers.getContractFactory("Voting");
  const voting = await contract.deploy();

  // adding addr1 & addr2 as registered voters at contract deployment
  await voting.addVoter(addr1.address);
  await voting.addVoter(addr2.address);

  // changing workflow status
  await voting.startProposalsRegistering();

  // add a proposal
  const proposalDescription = "Default proposal";
  await voting.connect(addr1).addProposal(proposalDescription);

  await voting.endProposalsRegistering();
  await voting.startVotingSession();

  return { voting, owner, addr1, addr2 };
}

describe("Voting Contract Test", function () {
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { voting, owner } = await loadFixture(
        deployVotingFixtureAtDefaultStatus
      );

      expect(await voting.owner()).to.equal(owner.address);
    });
    it("should start in the RegisteringVoters status", async function () {
      expect(await voting.workflowStatus()).to.equal(0);
    });
  });

  describe("Add Voter", function () {
    it("Should NOT be available to users other than owner", async function () {
      const { voting, addr1, addr2 } = await loadFixture(
        deployVotingFixtureAtDefaultStatus
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
        deployVotingFixtureAtDefaultStatus
      );
      await voting.addVoter(addr1.address);
      await expect(voting.addVoter(addr1.address)).to.be.revertedWith(
        "Already registered"
      );
    });
    it("Should allow owner to register voters", async function () {
      const { voting, addr1, addr2 } = await loadFixture(
        deployVotingFixtureAtDefaultStatus
      );

      await voting.addVoter(addr1.address);
      await voting.addVoter(addr2.address);

      const voterDetails = await voting.connect(addr1).getVoter(addr2.address);

      expect(voterDetails.isRegistered).to.equal(true);
    });

    it("Should emit a broadcast at voter registration", async function () {
      const { voting, addr1 } = await loadFixture(
        deployVotingFixtureAtDefaultStatus
      );
      await expect(voting.addVoter(addr1.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(addr1.address);
    });
  });

  describe("Add Proposal", function () {
    it("Should NOT be available to users other than voters", async function () {
      const { voting, addr1 } = await loadFixture(
        deployVotingFixtureAtProposalRegisteringStart
      );
      await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
        "You're not a voter"
      );
    });

    it("Should NOT be available outside of Proposal Registration", async function () {
      const { voting, addr1 } = await loadFixture(
        deployVotingFixtureAtVotingSessionStart
      );
      let proposalDescription = "Default proposal description";
      await expect(
        voting.connect(addr1).addProposal(proposalDescription)
      ).to.be.revertedWith("Proposals are not allowed yet");
    });
    it("Should NOT add an empty proposal description", async function () {
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
    it("Should emit a broadcast at proposal registration", async function () {
      const { voting, addr1 } = await loadFixture(
        deployVotingFixtureAtProposalRegisteringStart
      );
      let proposalDescription = "This is a default proposal description";

      await expect(voting.connect(addr1).addProposal(proposalDescription))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(1); // Expecting the second proposal's index, which should be 1
    });
  });

  describe("Set Vote", function () {
    it("Should NOT be available to users other than voters", async function () {
      const { voting } = await loadFixture(
        deployVotingFixtureAtVotingSessionStart
      );

      await expect(voting.setVote(1)).to.be.revertedWith("You're not a voter");
    });

    it("Should NOT be available outside of Voting", async function () {
      const { voting, addr1 } = await loadFixture(
        deployVotingFixtureAtProposalRegisteringStart
      );
      await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
    it("Should NOT allow more than 1 vote", async function () {
      const { voting, addr2 } = await loadFixture(
        deployVotingFixtureAtVotingSessionStart
      );
      await voting.connect(addr2).setVote(1);

      await expect(voting.connect(addr2).setVote(1)).to.be.revertedWith(
        "You have already voted"
      );
    });
    it("Should submit a vote", async function () {
      const { voting, addr2 } = await loadFixture(
        deployVotingFixtureAtVotingSessionStart
      );

      let verifiedProposal = await voting.connect(addr2).getOneProposal(1);
      expect(verifiedProposal.voteCount).to.equal(0);

      await voting.connect(addr2).setVote(1);

      verifiedProposal = await voting.connect(addr2).getOneProposal(1);
      expect(verifiedProposal.voteCount).to.equal(1);
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

  describe("startProposalsRegistering", function () {
    it("Should NOT be available to users other than owner", async function () {
      const { voting, addr1, addr2 } = await loadFixture(
        deployVotingFixtureAtDefaultStatus
      );
      await expect(voting.connect(addr1).startProposalsRegistering())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("Should NOT be available outside of Proposals Registration", async function () {
      const { voting } = await loadFixture(
        deployVotingFixtureAtVotingSessionStart
      );

      await expect(voting.startProposalsRegistering()).to.be.revertedWith(
        "Registering proposals cant be started now"
      );
    });
    it("Should emit a broadcast at workflow status change", async function () {
      const { voting, addr1 } = await loadFixture(
        deployVotingFixtureAtDefaultStatus
      );

      await expect(voting.startProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(0, 1);
    });
  });

  describe("endProposalsRegistering", function () {
    it("Should NOT be available to users other than owner", async function () {
      const { voting, addr1, addr2 } = await loadFixture(
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

    it("Should NOT be available outside of Vote Submission", async function () {
      const { voting } = await loadFixture(
        deployVotingFixtureAtProposalRegisteringStart
      );

      await expect(voting.startVotingSession()).to.be.revertedWith(
        "Registering proposals phase is not finished"
      );
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

    it("Should NOT be available outside of Vote Submission", async function () {
      const { voting } = await loadFixture(
        deployVotingFixtureAtProposalRegisteringStart
      );

      await expect(voting.endVotingSession()).to.be.revertedWith(
        "Voting session havent started yet"
      );
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

  describe("GetVoter", function () {
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
});
