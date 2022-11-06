const hre = require("hardhat")

async function main() {
  const NAME = "Dapp University"
  const SYMBOL = "DAPP"
  const MAX_SUPPLY = "1000000"

  // Deploy Token
  const Token = await hre.ethers.getContractFactory("Token")
  const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)

  await token.deployed()
  console.log(`Token deployed to: ${token.address}\n`)

  // Deploy DAO
  const DAO = await hre.ethers.getContractFactory("DAO")
  const dao = await DAO.deploy(token.address, "500000000000000000000001")

  await dao.deployed()
  console.log(`DAO deployed to: ${dao.address}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
