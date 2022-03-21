import {Carousel} from "react-bootstrap";
import React,{useEffect,useState} from "react";
import {toast} from "react-toastify";
import NoRecordFound from '../components/NoRecordFound';


const handleTokenList = async({library,networks,state,connectWallet, setTickets}) => {
    const account = library ? library.wallet.address:null;
    if(!account){
        setTickets([])
        return;
    }
    console.log("account",account)
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
        const { walletOfOwner } = library.methods.Advisor;
        const response = await walletOfOwner(account)
        setTickets(response)

    }
}
const tokenIsLinkedWithNft = async({library,networks,state,connectWallet,ticketId})=>{
    //console.log("------handleTokenList----")
    const account = library ? library.wallet.address:null;
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
        return false;
    } else {
        const { tokenIsLinked } = library.methods.Advisor;
        const response = await tokenIsLinked(ticketId)
       // console.log("response of ticket link ticketId",ticketId,response)
        return !!response;
    }

}

function  Token({library, networks, state, connectWallet, ticketId, selected, handleSelect}){
    const [isLinked,setIsLinked] = useState(false);
    useEffect(()=>{
        tokenIsLinkedWithNft({library, networks, state, connectWallet, ticketId}).then((res)=>{
            setIsLinked(res)
        })
    },[state])
    return (<div className="col-md-4" >
        <div className={isLinked ? 'box ticketDisabled': (selected ? 'box ticketSelected': 'box')}>
            <div className="box_img_btn">
                <img src="./ticket.png" alt="" />
                <div className={selected? "btn_overlay fullOpacity":"btn_overlay"}>
                    {!isLinked && <button onClick={()=>{handleSelect(ticketId)}}>{selected? 'SELECTED':'SELECT'}</button>}
                </div>
            </div>
            <div className="nft_ticket_title">
                <p>NFC TICKET #{ticketId}</p>
            </div>
        </div>
    </div>)
}

function TokenList({library,networks,state,connectWallet,connectNFT,selectedTicket,setSelectedTicket}){
    const [tickets, setTickets] = useState([])
    //const [selectedToken, setSelectedToken] = useState(null);
    const handleSelect = (ticket_id)=>{
        //setSelectedToken(ticket_id)
        setSelectedTicket(ticket_id)
    }
    useEffect(()=>{
        handleTokenList({library,networks,state,connectWallet, setTickets})
    },[state])

    return(
        <div className="slider_inner">
            <div className="slider_heading">
                <p>NFC NFT</p>
            </div>
            <div className="slider_inner_box">
                <div className="container">
                    <div className="row">
                        {!tickets.length && <NoRecordFound message={null}/>}
                        {
                            tickets.map((ticketId)=>{
                                return <Token  key={ticketId} library={library} networks={networks} state={state} connectWallet={connectWallet} selected={selectedTicket===ticketId} ticketId={ticketId} handleSelect={handleSelect}/>
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="slider_bottom_section">
                <div className="nft_connect_btn">
                    <button  onClick={()=>{connectNFT(2)}} className={!selectedTicket && 'ticketDisabled'}>
                        <img src="./Crystal.png" alt="Crystal" />
                        CONNECT YOUR NFT
                    </button>
                </div>
            </div>
        </div>
    )
}

export  default  TokenList