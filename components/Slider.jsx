import React, { useState } from "react";
import { Carousel } from "react-bootstrap";
import TokenList from "../components/TokenList";
import WalletNFTList from "./WalletNFTList";

function Slider({
  children,
  state,
  dispatch,
  library,
  networks,
  connectWallet,
  isLive,
}) {
  const [index, setIndex] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="cart_slider">
      <Carousel activeIndex={index} onSelect={handleSelect} interval={null}>
        <Carousel.Item>
          {React.cloneElement(children, {
            state,
            dispatch,
            library,
            networks,
            connectWallet,
            isLive,
            onNextPage:handleSelect
          })}
        </Carousel.Item>
        <Carousel.Item>
          <TokenList
            state={state}
            dispatch={dispatch}
            library={library}
            networks={networks}
            connectWallet={connectWallet}
            connectNFT={handleSelect}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
          />
        </Carousel.Item>
        <Carousel.Item>
          <WalletNFTList
            state={state}
            dispatch={dispatch}
            library={library}
            networks={networks}
            connectWallet={connectWallet}
            ticketId={selectedTicket}
            setTicketId={setSelectedTicket}
            moveBack={handleSelect}

          />
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export { Slider };
