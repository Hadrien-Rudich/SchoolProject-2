// const {
//   loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { ethers } = require("hardhat");
// const { expect, assert } = require("chai");

// async function deployVotingFixtureAtDefaultWorkflowStatus() {
//   const [owner, addr1, addr2, addr3] = await ethers.getSigners();
//   let contract = await ethers.getContractFactory("Voting");
//   voting = await contract.deploy();
//   return { voting, owner, addr1, addr2, addr3 };
// }

// async function deployVotingFixtureAtProposalRegisteringStart() {
//   const [owner, addr1, addr2] = await ethers.getSigners();
//   const contract = await ethers.getContractFactory("Voting");
//   const voting = await contract.deploy();

//   // adding addr1 & addr2 as registered voters at contract deployment
//   await voting.addVoter(addr1.address);
//   await voting.addVoter(addr2.address);

//   // changing workflow status
//   await voting.startProposalsRegistering();

//   return { voting, owner, addr1, addr2 };
// }

// async function deployVotingFixtureAtVotingSessionStart() {
//   const [owner, addr1, addr2, addr3] = await ethers.getSigners();
//   const contract = await ethers.getContractFactory("Voting");
//   const voting = await contract.deploy();

//   // adding addr1 & addr2 as registered voters at contract deployment
//   await voting.addVoter(addr1.address);
//   await voting.addVoter(addr2.address);
//   await voting.addVoter(addr3.address);

//   // changing workflow status
//   await voting.startProposalsRegistering();

//   // add a proposal
//   const proposalDescription = "Default proposal";
//   await voting.connect(addr1).addProposal(proposalDescription);

//   await voting.endProposalsRegistering();
//   await voting.startVotingSession();

//   return { voting, owner, addr1, addr2, addr3 };
// }

// async function deployVotingFixtureAtVotingSessionEnd() {
//   const [owner, addr1, addr2] = await ethers.getSigners();
//   const contract = await ethers.getContractFactory("Voting");
//   const voting = await contract.deploy();

//   // adding addr1 & addr2 as registered voters at contract deployment
//   await voting.addVoter(addr1.address);
//   await voting.addVoter(addr2.address);

//   // changing workflow status
//   await voting.startProposalsRegistering();

//   // add a proposal
//   const proposalDescription = "Default proposal";
//   await voting.connect(addr1).addProposal(proposalDescription);

//   await voting.endProposalsRegistering();
//   await voting.startVotingSession();

//   // all votes to proposal 1
//   await voting.connect(addr1).setVote(1);
//   await voting.connect(addr2).setVote(1);

//   await voting.endVotingSession();

//   return { voting, owner, addr1, addr2 };
// }

// describe("Voting Contract Test", function () {
//   describe("Deployment", function () {
//     it("Should set the right owner", async function () {
//       const { voting, owner } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );

//       expect(await voting.owner()).to.equal(owner.address);
//     });
//     it("Should start in the RegisteringVoters status", async function () {
//       expect(await voting.workflowStatus()).to.equal(0);
//     });
//   });

//   describe("addVoter", function () {
//     it("Should NOT be available to users other than owner", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );
//       await expect(voting.connect(addr1).addVoter(addr2.address))
//         .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
//         .withArgs(addr1.address);
//     });

//     it("Should NOT be available outside of Voter Registration", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       await expect(voting.addVoter(addr1.address)).to.be.revertedWith(
//         "Voters registration is not open yet"
//       );
//     });
//     it("Should NOT add an already registered voter address", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );
//       await voting.addVoter(addr1.address);
//       await expect(voting.addVoter(addr1.address)).to.be.revertedWith(
//         "Already registered"
//       );
//     });
//     it("Should allow owner to register new voters", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );

//       await voting.addVoter(addr1.address);
//       await voting.addVoter(addr2.address);

//       const voterDetails = await voting.connect(addr1).getVoter(addr2.address);

//       expect(voterDetails.isRegistered).to.equal(true);
//     });

//     it("Should emit a broadcast at voter registration", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );
//       await expect(voting.addVoter(addr1.address))
//         .to.emit(voting, "VoterRegistered")
//         .withArgs(addr1.address);
//     });
//   });

//   describe("addProposal", function () {
//     it("Should NOT be available to users other than voters", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
//         "You're not a voter"
//       );
//     });

//     it("Should NOT be available outside of Proposal Registration Start", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );
//       let proposalDescription = "Default proposal description";
//       await expect(
//         voting.connect(addr1).addProposal(proposalDescription)
//       ).to.be.revertedWith("Proposals are not allowed yet");
//     });
//     it("Should NOT allow an empty proposal description", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       let emptyProposalDescription = "";

//       await expect(
//         voting.connect(addr1).addProposal(emptyProposalDescription)
//       ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
//     });

//     it("Should add a proposal", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       let proposalDescription = "This is a default proposal description";
//       await voting.connect(addr1).addProposal(proposalDescription);

//       const verifiedProposal = await voting.connect(addr2).getOneProposal(1);
//       expect(verifiedProposal.description).to.equal(proposalDescription);
//       expect(verifiedProposal.voteCount).to.equal(0);
//     });

//     it("Should emit a broadcast at Proposal Registration", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       let proposalDescription = "This is a default proposal description";

//       await expect(voting.connect(addr1).addProposal(proposalDescription))
//         .to.emit(voting, "ProposalRegistered")
//         .withArgs(1);
//     });
//   });

//   describe("setVote", function () {
//     it("Should NOT be available to users other than voters", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       await expect(voting.setVote(1)).to.be.revertedWith("You're not a voter");
//     });

//     it("Should NOT be available outside of Voting Session Start", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith(
//         "Voting session havent started yet"
//       );
//     });

//     it("Should NOT allow more than 1 vote", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );
//       // voter before vote is cast
//       let verifiedVoter = await voting.connect(addr2).getVoter(addr1.address);
//       expect(verifiedVoter.votedProposalId).to.equal(0);
//       expect(verifiedVoter.hasVoted).to.equal(false);

//       await voting.connect(addr1).setVote(1);

//       // voter after vote is cast
//       verifiedVoter = await voting.connect(addr2).getVoter(addr1.address);
//       expect(verifiedVoter.votedProposalId).to.equal(1);
//       expect(verifiedVoter.hasVoted).to.equal(true);

//       await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith(
//         "You have already voted"
//       );
//     });

//     it("Should NOT allow votes for an invalid proposalId", async function () {
//       const { voting, addr1, addr2, addr3 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       // verify that proposal doesn't exist
//       // let invalidProposalId = await voting.connect(addr3).getOneProposal(99);
//       // this is actually returning an error and should be handled in the smart contract
//       // Error: VM Exception while processing transaction: reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)

//       await expect(voting.connect(addr3).setVote(99)).to.be.revertedWith(
//         "Proposal not found"
//       );
//     });

//     it("Should increment the proposal's vote count after a vote is cast", async function () {
//       const { voting, addr1, addr2, addr3 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       // proposal votecount before vote is cast
//       let verifiedProposal = await voting.connect(addr2).getOneProposal(1);
//       expect(verifiedProposal.voteCount).to.equal(0);

//       await voting.connect(addr1).setVote(1);
//       await voting.connect(addr2).setVote(1);
//       await voting.connect(addr3).setVote(1);

//       // proposal votecount after vote is cast
//       verifiedProposal = await voting.connect(addr2).getOneProposal(1);
//       expect(verifiedProposal.voteCount).to.equal(3);
//     });
//     it("Should update the voter's status after a vote is cast", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       // voter before vote is cast
//       let verifiedVoter = await voting.connect(addr1).getVoter(addr2.address);
//       expect(verifiedVoter.votedProposalId).to.equal(0);
//       expect(verifiedVoter.hasVoted).to.equal(false);

//       await voting.connect(addr2).setVote(1);

//       // voter after vote is cast
//       verifiedVoter = await voting.connect(addr1).getVoter(addr2.address);
//       expect(verifiedVoter.votedProposalId).to.equal(1);
//       expect(verifiedVoter.hasVoted).to.equal(true);
//     });

//     it("Should emit a broadcast at vote submission", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       await expect(voting.connect(addr1).setVote(1))
//         .to.emit(voting, "Voted")
//         .withArgs(addr1.address, 1);
//     });
//   });

//   describe("startProposalsRegistering", function () {
//     it("Should NOT be available to users other than owner", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );
//       await expect(voting.connect(addr1).startProposalsRegistering())
//         .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
//         .withArgs(addr1.address);
//     });

//     it("Should NOT be available outside of Voters Registration", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       await expect(voting.startProposalsRegistering()).to.be.revertedWith(
//         "Registering proposals cant be started now"
//       );
//     });
//     it("Should change the status to ProposalsRegistrationStarted", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );

//       await voting.startProposalsRegistering();

//       expect(await voting.workflowStatus()).to.equal(1);
//     });

//     it("Should add the GENESIS proposal when starting Proposal Registration", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );

//       await voting.addVoter(addr1.address);
//       await voting.startProposalsRegistering();

//       // Retrieve the first proposal
//       const genesisProposal = await voting.connect(addr1).getOneProposal(0);

//       expect(genesisProposal.description).to.equal("GENESIS");
//     });

//     it("Should emit a broadcast at workflow status change", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );

//       await expect(voting.startProposalsRegistering())
//         .to.emit(voting, "WorkflowStatusChange")
//         .withArgs(0, 1);
//     });
//   });

//   describe("endProposalsRegistering", function () {
//     it("Should NOT be available to users other than owner", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       await expect(voting.connect(addr1).endProposalsRegistering())
//         .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
//         .withArgs(addr1.address);
//     });

//     it("Should NOT be available outside of Proposals Registration", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       await expect(voting.endProposalsRegistering()).to.be.revertedWith(
//         "Registering proposals havent started yet"
//       );
//     });

//     it("Should change the status to ProposalsRegistrationEnded", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtDefaultWorkflowStatus
//       );

//       await voting.startProposalsRegistering();
//       await voting.endProposalsRegistering();

//       expect(await voting.workflowStatus()).to.equal(2);
//     });

//     it("Should emit a broadcast at workflow status change", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       await expect(voting.endProposalsRegistering())
//         .to.emit(voting, "WorkflowStatusChange")
//         .withArgs(1, 2);
//     });
//   });

//   describe("tallyVotes", function () {
//     it("Should not be available to users other than owner", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionEnd
//       );
//       await expect(voting.connect(addr1).tallyVotes())
//         .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
//         .withArgs(addr1.address);
//     });

//     it("Should NOT be available before Vote Submission has ended", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );
//       await expect(voting.tallyVotes()).to.be.revertedWith(
//         "Current status is not voting session ended"
//       );
//     });

//     it("Should tally votes and update the winning proposal", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionEnd
//       );

//       // Retrieve the winning proposal ID before votes are tallied
//       let winningProposalID = await voting.winningProposalID();
//       expect(winningProposalID).to.equal(0);

//       await voting.tallyVotes();

//       // Retrieve the winning proposal ID after votes are tallied
//       winningProposalID = await voting.winningProposalID();
//       expect(winningProposalID).to.equal(1);
//     });
//   });
//   it("Should change the status to VotesTallied", async function () {
//     const { voting } = await loadFixture(deployVotingFixtureAtVotingSessionEnd);

//     await voting.tallyVotes();

//     expect(await voting.workflowStatus()).to.equal(5);
//   });
//   it("Should emit a broadcast at workflow status change", async function () {
//     const { voting } = await loadFixture(
//       deployVotingFixtureAtVotingSessionStart
//     );

//     // ensure the proper workflow
//     await voting.endVotingSession();

//     await expect(voting.tallyVotes())
//       .to.emit(voting, "WorkflowStatusChange")
//       .withArgs(4, 5);
//   });

//   describe("startVotingSession", function () {
//     it("Should NOT be available to users other than owner", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       // ensure the proper workflow
//       await voting.endProposalsRegistering();

//       await expect(voting.connect(addr1).startVotingSession())
//         .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
//         .withArgs(addr1.address);
//     });

//     it("Should NOT be available outside of Proposal Registration End", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       await expect(voting.startVotingSession()).to.be.revertedWith(
//         "Registering proposals phase is not finished"
//       );
//     });

//     it("Should change the status to VotingSessionStarted", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       await voting.endProposalsRegistering();
//       await voting.startVotingSession();

//       expect(await voting.workflowStatus()).to.equal(3);
//     });
//     it("Should emit a broadcast at workflow status change", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       // ensure the proper workflow
//       await voting.endProposalsRegistering();

//       await expect(voting.startVotingSession())
//         .to.emit(voting, "WorkflowStatusChange")
//         .withArgs(2, 3);
//     });
//   });

//   describe("endVotingSession", function () {
//     it("Should NOT be available to users other than owner", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );
//       await expect(voting.connect(addr1).endVotingSession())
//         .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
//         .withArgs(addr1.address);
//     });

//     it("Should NOT be available outside of Vote Submission Start", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       await expect(voting.endVotingSession()).to.be.revertedWith(
//         "Voting session havent started yet"
//       );
//     });
//     it("Should change the status to VotingSessionEnded", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       await voting.endVotingSession();

//       expect(await voting.workflowStatus()).to.equal(4);
//     });

//     it("Should emit a broadcast at workflow status change", async function () {
//       const { voting } = await loadFixture(
//         deployVotingFixtureAtVotingSessionStart
//       );

//       await expect(voting.endVotingSession())
//         .to.emit(voting, "WorkflowStatusChange")
//         .withArgs(3, 4);
//     });
//   });

//   describe("getVoter", function () {
//     it("Should NOT be available to users other than voters", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
//         "You're not a voter"
//       );
//     });
//     it("Should return the voter with matching address", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       const voterDetails = await voting.connect(addr1).getVoter(addr2.address);

//       expect(voterDetails.isRegistered).to.equal(true);
//     });
//   });

//   describe("getOneProposal", function () {
//     it("Should NOT be available to users other than voters", async function () {
//       const { voting, addr1 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );
//       await expect(voting.getVoter(addr1.address)).to.be.revertedWith(
//         "You're not a voter"
//       );
//     });
//     it("Should return the proposal with matching id", async function () {
//       const { voting, addr1, addr2 } = await loadFixture(
//         deployVotingFixtureAtProposalRegisteringStart
//       );

//       let newProposalDescription = "Test Proposal";
//       await voting.connect(addr1).addProposal(newProposalDescription);

//       const foundProposal = await voting.connect(addr2).getOneProposal(1);

//       expect(foundProposal.description).to.equal(newProposalDescription);
//       expect(foundProposal.voteCount).to.equal(0);
//     });
//   });
// });
