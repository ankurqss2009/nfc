import React, { useReducer, useState } from 'react'
import { Slider } from "../components/Slider";
import Account from 'components/Account/Account'
import { MoralisProvider } from "react-moralis";

const Page1 = ({library,state,loading,dispatch,connectWallet, children, networks, isLive}) => {
  return (
    <div className="section_first">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="ps-0 pe-0 col-xl-5 left_blue_block">
            <div className="top_green_line"></div>
            <div className="box_inner_content">
              <p>NON-FunGible Conference is offering something special</p>
              <h2>NON-FUNGIBLE CONFERENCE</h2>
              <h3>APRIL 4-5th 2022, LISBON</h3>
              <div className="mint_live_btn">
                <button>MINT IS LIVE</button>
              </div>
              <img className="logo" src="./logo.png" alt="Logo" />
              <h4 className="powered_by">POWERED BY</h4>
              <img
                className="powered_by_img"
                src="./powered_by.png"
                alt="Powered By Logo"
              />
            </div>
          </div>
          <div className="col-xl-7 ps-0 pe-0 right_slide_block">
            <div className="right_inner_content">
              <div className="container slide_header">
                <Account
                    library={library}
                    {...state}
                    loading={loading}
                    dispatch={dispatch}
                    connectWallet={connectWallet}
                />

                {/*<div className="row">
                  <div className="col-6">
                    <div className="wallet_code">
                      <h5>NFC NFT</h5>
                      <p>0xbe1b007b93555555555555</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="wallet_connect">
                      <div className="meta_wallet">
                        <img className="meta_img" src="./MetaMask.png" alt="" />
                        <img className="wallet_img" src="./wallet.png" alt="" />
                      </div>
                      <div className="connect_text">
                        <span className="connect_dot"></span>
                        <p>CONNECTED</p>
                      </div>
                    </div>
                  </div>
                </div>*/}
              </div>
              <MoralisProvider serverUrl={process.env.APP_SERVER_URL} appId={process.env.APP_MORALIS_ID}>
              <Slider children={children} state={state} dispatch={dispatch}
                      library={library}  networks={networks}
                      connectWallet={connectWallet}
                      isLive={isLive}
              />
              </MoralisProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page1;
