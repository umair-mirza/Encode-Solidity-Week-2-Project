import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as CustomBallotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
// eslint-disable-next-line node/no-missing-import
import { CustomBallot } from "../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
    const wallet =
      process.env.MNEMONIC && process.env.MNEMONIC.length > 0
        ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
        : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
    console.log(`Using address ${wallet.address}`);
    const provider = ethers.providers.getDefaultProvider("ropsten");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
      throw new Error("Not enough ether");
    }
    if (process.argv.length < 3) throw new Error("Ballot address missing");
    const ballotAddress = process.argv[2];
    if (process.argv.length < 4) throw new Error("Proposal index is missing");
    const proposal = process.argv[3];
    if (process.argv.length < 5) throw new Error("Voting amount is missing");
    const amount = process.argv[4];

    console.log(
      `Attaching ballot contract interface to address ${ballotAddress}`
    );
    const ballotContract: CustomBallot = new Contract(
      ballotAddress,
      CustomBallotJson.abi,
      signer
    ) as CustomBallot;


    const selectedProposal = await (await ballotContract.proposals(proposal)).name;
    const selectedProposalName = ethers.utils.parseBytes32String(selectedProposal);
    const prevCount = await (await ballotContract.proposals(proposal)).voteCount.toNumber();

    console.log(`Selected Proposal: ${selectedProposalName}, Previous Count: ${prevCount}`);
    
    const votingPower = await ballotContract.votingPower();
    console.log(`Current Voting Power: ${ethers.utils.formatEther(votingPower)}`);
    if(votingPower.toNumber() < Number(amount)) throw new Error("Not enough Voting power");
    console.log(votingPower.toNumber());
    console.log(Number(amount));

    const votingTx = await ballotContract.vote(proposal, amount);
    await votingTx.wait();
    console.log("Transaction completed");

    const nextCount = await (await ballotContract.proposals(proposal)).voteCount.toNumber();

    console.log(`Selected Proposal: ${selectedProposalName}, New Count: ${nextCount}`);

  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });