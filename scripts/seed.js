const hre = require("hardhat")
const config = require("../src/config.json")

const tokens = (n) => {
  return hre.ethers.utils.parseUnits(n.toString(), "ether")
}

const ether = tokens

async function main() {
  console.log(`Fetching accounts and network ...\n`)

  const accounts = await hre.ethers.getSigners()
  const funder = accounts[0]
  const investor1 = accounts[1]
  const investor2 = accounts[2]
  const investor3 = accounts[3]
  const recipient = accounts[4]

  let transaction

  // Fetch network
  const { chainId } = await hre.ethers.provider.getNetwork()

  console.log(`\nFetching token and transferring to accounts ...\n`)

  // Fetch deployed token
  const token = await hre.ethers.getContractAt(
    "Token",
    config[chainId].token.address
  )
  console.log(`Token fetched: ${token.address}\n`)

  // Send tokens to investors - 20% each
  transaction = await token.transfer(investor1.address, tokens(200000))
  await transaction.wait()

  transaction = await token.transfer(investor2.address, tokens(200000))
  await transaction.wait()

  transaction = await token.transfer(investor3.address, tokens(200000))
  await transaction.wait()

  console.log(`Fetching DAO ...\n`)

  // Fetch deployed DAO
  const dao = await hre.ethers.getContractAt("DAO", config[chainId].dao.address)
  console.log(`DAO fetched: ${dao.address}\n`)

  // Funder sends ETH to DAO treasury
  transaction = await funder.sendTransaction({
    to: dao.address,
    value: ether(1000),
  })
  await transaction.wait()
  console.log("Transaction value:", transaction.value.toString())

  console.log(`\nSent funds to DAO treasury ...\n`)

  for (let i = 0; i < 3; i++) {
    // Create proposal
    transaction = await dao
      .connect(investor1)
      .createProposal(`Proposal ${i + 1}`, ether(100), recipient.address)
    await transaction.wait()

    // Vote1
    transaction = await dao.connect(investor1).vote(i + 1)
    await transaction.wait()

    // Vote2
    transaction = await dao.connect(investor2).vote(i + 1)
    await transaction.wait()

    // Vote3
    transaction = await dao.connect(investor3).vote(i + 1)
    await transaction.wait()

    // Finalize
    transaction = await dao.connect(investor1).finalizeProposal(i + 1)
    await transaction.wait()

    console.log(`Created and Finalized Proposal ${i + 1}\n`)
  }

  console.log(`Creating one more proposal ...\n`)

  // Create one more proposal
  transaction = await dao
    .connect(investor1)
    .createProposal(`Proposal 4`, ether(100), recipient.address)
  await transaction.wait()

  // Vote1
  transaction = await dao.connect(investor2).vote(4)
  await transaction.wait()

  // Vote2
  transaction = await dao.connect(investor3).vote(4)
  await transaction.wait()

  console.log(`Finished!\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
