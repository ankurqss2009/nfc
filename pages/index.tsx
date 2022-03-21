import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { getNFTInfo } from 'utils/library'
//import ScrollAnimation from 'react-animate-on-scroll'
import styles from 'styles/Home.module.css'
import BuyForm from 'components/Modal/BuyForm'
import TxModal from 'components/Modal/TxModal'
import Button from 'components/Button/Button'

const FETCH_TIME = 3
let nftTimer = null
let imageTimer = null

export default function Home({
  library,
  state,
  networks,
  dispatch,
  connectWallet,
  onNextPage
}) {
  const [collapses, setCollapses] = useState({})
  const [currentImgIndex, setCurrentImageIndex] = useState(1)
  const [assetInfo, setAssetInfo] = useState({ symbol: 'nfc' })

  useEffect(() => {
    if (imageTimer) clearInterval(imageTimer)
    imageTimer = setInterval(() => {
      setCurrentImageIndex(((currentImgIndex + 1) % 3) + 1)
    }, 500)
    return () => imageTimer && clearInterval(imageTimer)
  }, [currentImgIndex])

  const { transactions, requests } = state
  const network = library ? library.wallet.network : ''
  const toWei = (value, decimals = 18) =>
    decimals < 18
      ? new BigNumber(value).times(10 ** decimals).toString(10)
      : library.web3.utils.toWei(value)
  const account = library ? library.wallet.address : ''

  const loadInfo = () => {
    getNFTInfo(library, dispatch)
  }

  useEffect(() => {
    if (library) {
      if (nftTimer) clearInterval(nftTimer)
      nftTimer = setInterval(loadInfo, FETCH_TIME * 3000)
      loadInfo()
    }
    return () => nftTimer && clearInterval(nftTimer)
  }, [library])

  const transactionMap = transactions.reduce(
    ([stakes], [hash, type, ...args]) => {
      const transaction = {
        stakes: {},
      }
      switch (type) {
        case 'buy':
          transaction.stakes[args[0]] = hash
          break
        default:
          break
      }
      return [{ ...stakes, ...transaction.stakes }]
    },
    new Array(4).fill({})
  )

  const handleTransaction =
    (type, ...args) =>
    (transaction, callback = () => {}) => {
      dispatch({
        type: 'txRequest',
        payload: [type, true, ...args],
      })
      transaction
        .on('transactionHash', function (hash) {
          dispatch({
            type: 'txHash',
            payload: [hash, false, type, ...args],
          })
        })
        .on('receipt', function (receipt) {
          dispatch({
            type: 'txHash',
            payload: [receipt.transactionHash, true, type, callback()],
          })
        })
        .on('error', (err, receipt) => {
          if (err && err.message) {
            console.log(err.message)
          }
          if (receipt) {
            dispatch({
              type: 'txHash',
              payload: [receipt.transactionHash, true, type],
            })
          } else {
            dispatch({
              type: 'txRequest',
              payload: [type, false, ...args],
            })
          }
        })
    }

  const handleBuy = (form) => {
    if (!library) return null
    if (
      window.ethereum &&
      !networks.includes(state.account.network) &&
      account
    ) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `You are conected to wrong network. Please connect to ${
          process.env.APP_ENV === 'dev' ? 'Rinkeby Testnet' : 'Ethereum Mainnet'
        }!`,
        options
      )
    } else if (!account) {
      connectWallet()
    } else {
      const { ethAmount, amount } = form
      setAssetInfo({ symbol: 'nfc' })
      const { publicMint } = library.methods.Advisor
      const transaction = publicMint(amount, {
        type: '0x2',
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        gas: 285000,
        from: account,
        value: toWei(ethAmount.toString(10), 18),
      })
      handleTransaction('buy', 'nfc')(transaction.send(), () => {})
    }
  }

  const handleFreeMint = (form) => {
    if (!library) return null
    if (
      window.ethereum &&
      !networks.includes(state.account.network) &&
      account
    ) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `You are conected to wrong network. Please connect to ${
          process.env.APP_ENV === 'dev' ? 'Rinkeby Testnet' : 'Ethereum Mainnet'
        }!`,
        options
      )
    } else if (!account) {
      connectWallet()
    } else {
      const { code, signature } = form
      console.log('form', form)
      setAssetInfo({ symbol: 'nfc' })
      const { whitelistMint } = library.methods.Advisor
      const transaction = whitelistMint(code, signature, {
        type: '0x2',
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        gas: 285000,
        from: account,
      })
      handleTransaction('buy', 'nfc')(transaction.send(), () => {})
    }
  }

  return (
    <section className={`${styles.content}`}>
      <div
        className={`${styles.buyFormWrapper} flex-center justify-between limited`}
      >
        <div className={`flex-end ${styles.buyWrapper}`}>
          <BuyForm
            account={account}
            balance={state.balance}
            nftInfo={state.nftInfo || {}}
            network={network}
            disabled={assetInfo && transactionMap[0][assetInfo.symbol]}
            onSubmit={handleBuy}
            onFreeMintSubmit={handleFreeMint}
            onNextPage={onNextPage}
          />
        </div>
        <TxModal
          network={network}
          pending={assetInfo && requests.buy === assetInfo.symbol}
          disabled={assetInfo && transactionMap[0][assetInfo.symbol]}
          onClose={() => setAssetInfo(null)}
        />
      </div>
    </section>
  )
}
