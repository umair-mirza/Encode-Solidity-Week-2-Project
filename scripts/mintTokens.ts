import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as MyTokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
// eslint-disable-next-line node/no-missing-import
import { MyToken } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
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
  if (process.argv.length < 3) throw new Error("Token Address missing");
  const tokenAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("To Address missing");
  const toAddress = process.argv[3];
  if (process.argv.length < 5) throw new Error("Token amount missing");
  const amount = process.argv[4];
  console.log(
    `Attaching token contract interface to address ${tokenAddress}`
  );
  const tokenContract: MyToken = new Contract(
    tokenAddress,
    MyTokenJson.abi,
    signer
  ) as MyToken;

  const minterRole = await tokenContract.hasRole(await tokenContract.MINTER_ROLE(), wallet.address);

  if(!minterRole) throw new Error("Signer does not have MINTER ROLE");

  const mintTx = await tokenContract.mint(toAddress, amount);
  await mintTx.wait();

  console.log(`${amount} Tokens have been minted to ${toAddress}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
