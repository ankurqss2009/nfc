import * as EvmChains from 'evm-chains'
import Web3 from 'web3'
import Advisor from './ABIs/Advisor.json'

const DEFAULT_REFRESH = 5 * 1000

export const call =
  (method: (...args: any) => any) =>
  (...args: any) =>
    method(...args).call() as Promise<any>
export const send =
  (method: (...args: any) => any) =>
  (...args: any) => {
    const option = args.pop()
    const transaction = method(...args)
    return {
      estimate: (): Promise<any> =>
        transaction.estimateGas(option) as Promise<any>,
      send: (): Promise<any> => transaction.send(option) as Promise<any>,
      transaction,
    }
  }

interface Options {
  readonly onEvent?: (type: string, payload: any, error: any) => void
  readonly addresses: any
}

interface Wallet {
  address?: string
  network?: number
}

class NftLibrary {
  public initiated: boolean
  public web3: Web3
  public contracts: any
  public methods: any
  public addresses: any
  private wallet: Wallet = {}
  private options: any
  private subscriptions: any[] = []
  private timers: NodeJS.Timeout[] = []

  constructor(provider: any, options: Options) {
    this.web3 = new Web3(provider)
    this.options = options
    this.init(provider)
  }

  get onEvent() {
    return this.options.onEvent
  }

  public setProvider(provider: any) {
    this.init(provider)
  }

  public onDisconnect() {
    this.disconnect()
  }

  private reset() {
    this.subscriptions.forEach((subscription) => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe()
      } else if (subscription.deleteProperty) {
        subscription.deleteProperty()
      }
    })
    this.timers.forEach((timer) => clearInterval(timer))
  }

  private async setupWallet() {
    let status = 0 // No updates
    const chainId = await this.web3.eth.getChainId()
    const { networkId: network } = await EvmChains.getChain(chainId)
    const [address] = await this.web3.eth.getAccounts()
    if (this.wallet.address && !address) {
      return this.disconnect()
    } else if (this.wallet.network && this.wallet.network !== network) {
      status = 1
    } else if (this.wallet.address !== address) {
      status = 2
    }
    this.wallet.network = network
    this.wallet.address = address
    if (this.wallet.network) {
      this.addresses = this.options.addresses[this.wallet.network]
    }
    return status
  }

  private async initWallet(refresh: boolean = false) {
    console.log("-----called initWallet---")
    const status = await this.setupWallet()
    if (refresh || status > 0) {
      this.onEvent({
        data: [this.wallet],
        event: 'WALLET',
        status,
      })
    }
  }

  private connect() {
    this.initWallet(true)
  }

  private disconnect() {
    if (this.web3.givenProvider && this.web3.givenProvider.disconnect) {
      this.web3.givenProvider.disconnect()
    }
    delete this.wallet.address
    this.reset()
    this.onEvent({
      event: 'WALLET',
      status: 3,
    })
  }

  private async init(givenProvider?: any) {
    this.initiated = false
    if (givenProvider) {
      this.web3 = new Web3(givenProvider)
    }
    const provider = givenProvider || this.web3.givenProvider
    this.reset()
    const status = await this.setupWallet()
    const { addresses, onEvent } = this
    this.subscriptions = [
      provider.on && provider.on('accountsChanged', () => this.initWallet()),
      provider.on && provider.on('chainChanged', () => this.init()),
      provider.on && provider.on('connect', () => this.connect()),
      provider.on && provider.on('disconnect', () => this.disconnect()),
    ].filter((item) => !!item)

    if (addresses) {
      this.contracts = {
        Advisor: new this.web3.eth.Contract(Advisor as any, addresses.Advisor),
      }

      this.timers = [
       /* setInterval(
          () => this.initWallet(),
          this.options.interval || DEFAULT_REFRESH
        ),*/
      ]

      this.methods = {
        Advisor: {
          totalSupply: call(this.contracts.Advisor.methods.totalSupply),
          publicMint: send(this.contracts.Advisor.methods.publicMint),
          whitelistMint: send(this.contracts.Advisor.methods.whitelistMint),
          walletOfOwner:call(this.contracts.Advisor.methods.walletOfOwner),
          linkToken:this.contracts.Advisor.methods.linkToken,
          tokenIsLinked:call(this.contracts.Advisor.methods.tokenIsLinked),
          //whitelistMint:call(this.contracts.Advisor.methods.whitelistMint)
        },
        web3: {
          getBlock: (field: string = 'timestamp') =>
            new Promise((resolve, reject) =>
              this.web3.eth
                .getBlock('latest')
                .then((block: any) => {
                  if (field) {
                    resolve(block[field])
                  } else {
                    resolve(block)
                  }
                })
                .catch(reject)
            ),
        },
      }
    }

    this.onEvent({
      data: [this.wallet],
      event: 'WALLET',
      status,
    })
    this.initiated = true
  }
}

export default NftLibrary
