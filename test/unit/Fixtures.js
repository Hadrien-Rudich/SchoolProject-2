const { ethers } = require("hardhat");

async function deployVotingFixtureAtDefaultWorkflowStatus() {
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
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  const contract = await ethers.getContractFactory("Voting");
  const voting = await contract.deploy();

  // adding addr1 & addr2 as registered voters at contract deployment
  await voting.addVoter(addr1.address);
  await voting.addVoter(addr2.address);
  await voting.addVoter(addr3.address);

  // changing workflow status
  await voting.startProposalsRegistering();

  // add a proposal
  const proposalDescription = "Default proposal";
  await voting.connect(addr1).addProposal(proposalDescription);

  await voting.endProposalsRegistering();
  await voting.startVotingSession();

  return { voting, owner, addr1, addr2, addr3 };
}

async function deployVotingFixtureAtVotingSessionEnd() {
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

  // all votes to proposal 1
  await voting.connect(addr1).setVote(1);
  await voting.connect(addr2).setVote(1);

  await voting.endVotingSession();

  return { voting, owner, addr1, addr2 };
}

module.exports = {
  deployVotingFixtureAtDefaultWorkflowStatus,
  deployVotingFixtureAtProposalRegisteringStart,
  deployVotingFixtureAtVotingSessionEnd,
  deployVotingFixtureAtVotingSessionStart,
};
