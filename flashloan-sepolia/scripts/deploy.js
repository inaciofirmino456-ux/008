const hre = require("hardhat");

async function main() {
  const provider = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";
  const Factory = await hre.ethers.getContractFactory("SepoliaFlashLoanTest");
  const contract = await Factory.deploy(provider);
  await contract.waitForDeployment();

  console.log("Deployed:", await contract.getAddress());
  console.log("Owner:", (await hre.ethers.getSigners())[0].address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
