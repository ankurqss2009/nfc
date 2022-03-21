import React,{useEffect,useState} from "react";

import { useMoralis,useMoralisWeb3Api } from "react-moralis";
import {toast} from "react-toastify";

import NoRecordFound from '../components/NoRecordFound';
import LinkConfirmModal from "./Modal/LinkConfirmModal";

const handleTransaction =
    (type, dispatch, ...args) =>
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

const handleNFTList = async({library,networks,state,connectWallet,Web3Api, nfts, setNfts}) => {
    const account = library ? library.wallet.address:null;
    if(!account){
        setNfts([])
        return;
    }

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

        const options = {
            chain: process.env.APP_ENV === 'dev' ? "rinkeby" : 'Mainnet',
            address:  account
        };
        const nftsList = await Web3Api.account.getNFTs(options);

        //console.log("nftsList----",nftsList)
        const loadNftImage = async(nft)=>{
            const fixeUrl = (token_uri)=>{
                return token_uri+ '?format=json';
            }
            let url = fixeUrl(nft.token_uri)
            if(url.startsWith('http') || url.startsWith('https') || url.startsWith('ipfs')){
                const response = await fetch(url);
                const urlObj = await response.json();
                if(urlObj.image.startsWith('ipfs')){
                    return "https://ipfs.moralis.io:2053/ipfs/"+ urlObj.image.split("ipfs://")[1]
                }
                return urlObj.image;
            }
            else{
                return  nft.token_uri
            }
        }

        const attachNftImage = async(list)=>{
            let response = [];
            /*list.result.forEach(async(nft, index)=>{
                console.log("--index---",index)
                let res = await loadNftImage(nft);
                console.log("----res----",res)
                let  obj = Object.assign({},{...nft},{image:res})
                response.push(obj)
            });*/
            for (const nft of list.result) {
                let res = await loadNftImage(nft);
                let  obj = Object.assign({},{...nft},{image:res})
                //console.log(obj);
                response.push(obj)
            }
            return response
        }
        const list = await attachNftImage(nftsList)
        //console.log("method respinse",nftsList)
        setNfts([...list]);

    }
}

const linkNFTWithToken = async({library,networks,
                                   dispatch,state,connectWallet,
                                   selectedNFT,ticketId,
                                   setLinkConfirmOpen,setSelectedNFT,setTicketId}) => {
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
    } else {
        const { linkToken } = library.methods.Advisor;
        try{
            const transaction = await linkToken(selectedNFT.token_address,ticketId,selectedNFT.token_id)
            //console.log("transaction",transaction)
            setLinkConfirmOpen(false)
            setSelectedNFT({token_id:null,token_address:null})
            setTicketId(null)
            handleTransaction('buy',dispatch, 'nfc' )(transaction.send({from:account}), () => {});
        }
        catch (e){
            console.log("error",e)

        }

    }
}

function  NFT({record, isLinked,selected,handleSelect}){
    return (<div className="col-md-4">
        <div className={selected  ? 'box ticketSelected':'box'}>
            <div className="box_img_btn">
                <img width='168' height='198' src={record.image} alt="" />
                <div className={selected? "btn_overlay fullOpacity":"btn_overlay"}>
                    {!isLinked && <button onClick={()=>{handleSelect(record)}}>{selected? 'SELECTED':'SELECT'}</button>}
                </div>
            </div>
            <div className="nft_ticket_title nft_token_title">
                <p>
                    TOKEN:&nbsp;<span>{record.token_address}</span>
                </p>
                <p>
                    ID:&nbsp;<span>{record.token_id}</span>
                </p>
            </div>
        </div>
    </div>)
}

function WalletNFTList({library,networks,dispatch,state,connectWallet,ticketId,setTicketId, moveBack}){
    //console.log("----ticketId---- in walletlist",ticketId)
    const [nfts, setNfts] = useState([])
    const [selectedNFT, setSelectedNFT] = useState({token_id:null,token_address:null});
    const [linkConfirmOpen, setLinkConfirmOpen] = useState(false);


    const handleSelect = ({token_address,token_id})=>{
        setSelectedNFT({token_address,token_id})
    };

    const handleRegister = ()=>{
        setLinkConfirmOpen(true)
    }
    const handleRegisterConfirm = ()=>{
        linkNFTWithToken({library,networks,dispatch,state,connectWallet,selectedNFT,ticketId,setLinkConfirmOpen,setSelectedNFT,setTicketId})
    }

    const Web3Api = useMoralisWeb3Api();
     useEffect(()=>{
        handleNFTList({library,networks,state,connectWallet, Web3Api,nfts,setNfts})
    },[state,library])

    return(
        <div className="slider_inner">
            <div className="slider_heading">
                <p><span>NFC NFT</span><span> <a onClick={()=>{moveBack(1)}}>Link Another Token</a></span></p>

            </div>
            <div className="slider_inner_box slider_token_inner_box">
                <div className="container">
                    <div className="row">
                        {!nfts.length && <NoRecordFound message={'No NFT Found for this wallet'}/>}
                        {

                            nfts.map((record, index)=>{
                                return <NFT  key={index} record={record} isLinked={false} selected={selectedNFT?.token_id===record?.token_id}  handleSelect={handleSelect}/>
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="slider_bottom_section">
                <div className="nft_connect_btn">
                    <button onClick={handleRegister} className={(!selectedNFT.token_id || !ticketId) && 'ticketDisabled'}>
                        <img src="./Crystal.png" alt="Crystal" />
                        REGISTER
                    </button>
                </div>
            </div>
            <LinkConfirmModal
                isOpen={linkConfirmOpen}
                onClose={() => setLinkConfirmOpen(false)}
                onOk={handleRegisterConfirm}
            />
        </div>
    )
}
export  default  WalletNFTList