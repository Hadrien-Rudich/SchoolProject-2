# Voting Contract

## Overview

This smart contract test suite is a school project making basic use of the hardhat environment to implement an appropriate test strategy.
The aim was to get a coverage of 100%.

## Features

- **loadFixtures**: I used fixtures to emulate different stages and configurations of the voting process, reducing a lot of boilerplate code in the process

- **expect vs assert**: Upon research, I decided to pick _expect_ throughout my project. It is my understanding modern Ethereum smart contract development leans towards using _expect_, due to its readability and expressive nature. Key takeaway being the syntax is easier to understand and maintain

## Test Coverage %

| File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| ------------- | ------- | -------- | ------- | ------- | --------------- |
| contracts/    | 100     | 95.83    | 100     | 100     |                 |
| Voting.sol    | 100     | 95.83    | 100     | 100     |                 |
| **All files** | 100     | 95.83    | 100     | 100     |                 |

This is my final coverage, obtained through the following command:

```shell
npx hardhat coverage
```

## Challenges

- I could have probably used fixtures to a bigger extent, reducing even more some of the boilerplate code that had to be declarer in particular test cases. However in this scenario, making things more intelligible helped me grasp the ins and outs of the smart contract

- During workflow testing, perhaps I should have ensured that ANY incorrect workflow status change caused a revert, as opposed to checking it against only one

i.e endVotingSession should not be available when voting process is in:

- RegisteringVoters,
- ProposalsRegistrationStarted,
- ProposalsRegistrationEnded,
- VotingSessionEnded,
- VotesTallied

Ultimately I didn't do it because it felt extremely redundant and time consuming to do so for each and every status.
However for the sake of thoroughness, perhaps is it the better approach

- In the smart contract, proposalsArray is not public and has no getter declared, thus I couldn't verify some of the contract logic?

- Testing that a proposal with an invalid ID cannot be voted for proved troublesome in the current smart contract implementation. I got the following error message when attempting to getOneProposal with an invalid ID:

_Error: VM Exception while processing transaction: reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)_

The point of this function call is to demonstrate the proposal doesn't exist before we attempt to vote for it, but ultimately I had to comment it out for lake of a workaround

- I am confident there is a better way to break down that file into smaller targeted testing suites, however I was not sure if that was allowed so I didn't do it

- As you can see from the previous section, I ended up with 4.17% uncovered Branch Testing. I understand that means there is at least 1 particular condition that is not tested, however I couldn't find what was overlooked
