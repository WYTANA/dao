import { useEffect, useState } from "react"
import { Container } from "react-bootstrap"
import { ethers } from "ethers"

// Components
import Navigation from "./Navigation"
import Loading from "./Loading"

// Import ABI
import DAO_ABI from "../abis/DAO.json"

// Import network config
import config from "../config.json"

function App() {
  const [account, setAccount] = useState(null)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Initiate contracts
    const dao = new ethers.Contract(
      config[31337].dao.address,
      DAO_ABI,
      provider
    )
    setDao(dao)

    // Fetch treasury balance
    let treasuryBalance = await provider.getBalance(dao.address)
    treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18)
    setTreasuryBalance(treasuryBalance)

    // Fetch accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading])

  return (
    <Container>
      <Navigation account={account} />

      <h1 className="my-3 text-center">Farmer In The DAO</h1>
      <h5 className="my-2 text-center">Decentralized Funding for Ag</h5>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <hr />

          <p className="text-center">
            <strong>Treasury Balance:</strong> {treasuryBalance} ETH
          </p>

          <hr />
        </>
      )}
    </Container>
  )
}

export default App
