import React, { useReducer, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Collapse } from 'react-collapse'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useWallet from 'hooks/useWallet'
import Account from 'components/Account/Account'
import { toNumber } from 'utils/common'
import CountTimeDown from 'components/CountTimeDown/CountTimeDown'
import { addresses, ZERO } from 'utils/constants'
import { reducer, initState } from './store'
import styles from './Layout.module.css'
import Page from '../pages/Page1'


const FETCH_TIME = 2
let balanceTimer = null

const networkLabels = {
  1: 'Ethereum Network',
  4: 'Rinkeby Testnet',
  3: 'Ropsten Testnet',
  5: 'Goreli Testnet',
  42: 'Kovan Testnet',
  56: 'Binance Network',
  97: 'Binance Testnet',
}

export function accountBalance(library, dispatch) {
  if (!library || !library.initiated) return
  const account = library.wallet.address
  const fromWei = (value, decimals = 18) =>
    decimals < 18 ? value / 10 ** decimals : library.web3.utils.fromWei(value)
  if (!addresses[library.wallet.network] || !account) {
    return
  }
  Promise.all([library.web3.eth.getBalance(account)])
    .then(([_balance]) => {
      const balance = toNumber(fromWei(_balance))

      dispatch({
        type: 'balance',
        payload: {
          balance,
        },
      })
    })
    .catch(console.log)
}

export default function Layout({ children, router: { route }, networks }) {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initState)
  const [loading, connectWallet, disconnectWallet, library] =
    useWallet(dispatch)
  const [restored, setRestored] = useState(false)
  const [isCollapse, setIsCollapse] = useState(false)
  const [isLive, setIsLive] = useState(false)

  const handleLive = () => {
    setIsLive(true)
  }

  const scrollFunction = () => {
    const scrollBtn = document.getElementById('scrollBtn')
    if (scrollBtn) {
      if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
      ) {
        scrollBtn.style.display = 'flex'
      } else {
        scrollBtn.style.display = 'none'
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', scrollFunction)
    return () => window.removeEventListener('scroll', scrollFunction)
  }, [route, library])

  useEffect(() => {
    document.addEventListener('mouseup', (e: any) => {
      const container = document.getElementById('collapse-content')
      if (container && !container.contains(e.target)) {
        setIsCollapse(false)
      }
    })
  }, [])

  useEffect(() => {
    // disconnectWallet()
    if (!library) {
      connectWallet()
    }

    setIsCollapse(false)
    setTimeout(() => {
      if (location.hash) location = location
    }, 0)
  }, [router, library])

  const getBalance = () => {
    accountBalance(library, dispatch)
  }

  useEffect(() => {
    if (library && state.account.address) {
      if (balanceTimer) clearInterval(balanceTimer)
      balanceTimer = setInterval(getBalance, FETCH_TIME * 1000)
      getBalance()
    }
    return () => balanceTimer && clearInterval(balanceTimer)
  }, [library, state.account.address])

  useEffect(() => {
    if (
      window.ethereum &&
      library &&
      library.wallet.network &&
      !networks.includes(library.wallet.network) &&
      state.account.address
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
    }
  }, [library && library.wallet.network])

  const checkTransactions = () => {
    const { transactions } = state
    Promise.all(
      transactions.map(
        (transaction) =>
          new Promise((resolve) => {
            library.web3.eth
              .getTransactionReceipt(transaction[0])
              .then(() => resolve(transaction[0]))
              .catch(() => resolve(transaction[0]))
          })
      )
    ).then((receipts) => {
      dispatch({
        type: 'txHash',
        payload: [receipts.filter((hash) => hash), true],
      })
    })
  }

  useEffect(() => {
    if (!restored && library) {
      setRestored(true)
      checkTransactions()
    }
  }, [library, state.transactions, state.account.address])

  return (
    <>
      <Head>
        <title>NFC</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="apple-mobile-web-app-title" content="NFC" />
        <meta name="application-name" content="NFC" />
        <meta name="thumbnail" content="" />
        <meta name="title" content="NFC - NFT" />
        <meta name="description" content="NFC" />
        <link rel="canonical" href="" />
        <meta property="og:title" content="NFC" />
        <meta property="og:image" content="" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="NFC" />
        <meta property="og:url" content="" />
        <meta property="og:site_name" content="NFC" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="NFC" />
        <meta property="twitter:description" content="NFC" />
        <meta property="twitter:image" content="/feature-meta.jpg" />
        <meta name="twitter:site" content="@NFCNFT" />
        <meta name="twitter:creator" content="@NFCNFT" />
        <meta property="twitter:url" content="" />
        <meta property="og:title" content="NFC" />
        <meta name="twitter:title" content="NFC" />
        <link rel="icon" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"
        />
        <script
          type="text/javascript"
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        ></script>
        <script
          type="text/javascript"
          src="https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='ADDRESS';ftypes[3]='address';fnames[4]='PHONE';ftypes[4]='phone';fnames[5]='MMERGE5';ftypes[5]='text';fnames[6]='MMERGE6';ftypes[6]='text';fnames[7]='MMERGE7';ftypes[7]='text';fnames[8]='MMERGE8';ftypes[8]='text';fnames[9]='MMERGE9';ftypes[9]='text';fnames[10]='MMERGE10';ftypes[10]='text';fnames[11]='MMERGE11';ftypes[11]='text';}(jQuery));var $mcj = jQuery.noConflict(true);
          `,
          }}
        />
      </Head>
      {/* <div className={styles.countdownWrapper}>
        {!isLive && <CountTimeDown onLive={handleLive} />}
      </div> */}
      <main className={`${styles.main}`}>
        <ToastContainer />
        {/*<div className={styles.leftSide}>
          <div className={styles.topBar} />
          <div className={styles.secondBar} />
          <div className={styles.notify}>
            NON-FunGible Conference is offering something special
          </div>
          <div className={styles.title}>NON-FUNGIBLE</div>
          <div className={styles.title}>CONFERENCE</div>
          <div className={styles.date}>APRIL 4-5th 2022, LISBON</div>
          <div className={styles.mintLive}>MINT IS LIVE</div>
          <img src="/assets/logo.png" alt="logo" />
          <div className={styles.powered}>
            <div className={styles.brand}>POWERED BY</div>
            <a href="https://www.solidity.io" target="_blank">
              <img src="/assets/brand.png" alt="crystal" />
            </a>
          </div>
        </div>
        <div className={styles.rightSide}>
          <div className={styles.walletConnectWrap}>
            <div>
              <div className={styles.nftAddressLabel}>NFC NFT</div>
              <a
                className={styles.nftAddress}
                href={`${
                  process.env.APP_ENV === 'dev'
                    ? 'https://ropsten.etherscan.io'
                    : 'https://etherscan.io'
                }/address/${
                  addresses[process.env.APP_ENV === 'dev' ? 4 : 1].Advisor
                }`}
                target="_blank"
              >
                {addresses[
                  process.env.APP_ENV === 'dev' ? 4 : 1
                ].Advisor.substr(0, 10)}
                ...
              </a>
            </div>
            <Account
              library={library}
              {...state}
              loading={loading}
              dispatch={dispatch}
              connectWallet={connectWallet}
            />
          </div>
          {React.cloneElement(children, {
            state,
            dispatch,
            library,
            networks,
            connectWallet,
            isLive,
          })}
        </div>*/}
        <Page children={children} library={library}
              state={state}
              loading={loading}
              dispatch={dispatch}
              connectWallet={connectWallet}
              networks={networks}
              isLive={isLive}
        />
      </main>
    </>
  )
}
