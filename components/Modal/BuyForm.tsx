import { useState } from "react";
import BigNumber from "bignumber.js";
import { TMap } from "types";
// import ProgressBar from '@ramonak/react-progress-bar'
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";
import Button from "components/Button/Button";
import TxLoader from "components/TxLoader/TxLoader";
import styles from "./Modal.module.css";
import { toFixed } from "utils/number";
import EmailConfirmModal from "components/Modal/EmailConfirmModal";

interface IBuyForm {
  account: string;
  network: number;
  balance: number;
  nftInfo: any;
  disabled: string;
  onSubmit: Function;
  onFreeMintSubmit: Function;
  onNextPage: Function;
}

const defaults = {
  code: 0,
  signature: "",
  nftAmount: 1,
};

export default function BuyForm({
  account,
  network,
  balance,
  nftInfo,
  disabled,
  onSubmit,
  onFreeMintSubmit,
  onNextPage,
}: IBuyForm) {
  const sellCount = 1500;
  const nftPrice = 0.2;
  const nftAmount = 1;
  const currentNetwork = process.env.APP_ENV === "dev" ? 4 : 1;

  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [form, setForm] = useState<TMap>(defaults);
  const [isFreeMint, setIsFreeMint] = useState(false);

  const { code, signature } = form;

  const handlePublicMint = (e) => {
    e.preventDefault();
    if (+(nftInfo.totalSupply || 0) !== sellCount) {
      onSubmit({ ethAmount: nftAmount * nftPrice, amount: nftAmount });
    }
  };

  const handleFreeMint = (e) => {
    e.preventDefault();
    if (+(nftInfo.totalSupply || 0) !== sellCount) {
      setIsConfirmModal(true);
    }
  };

  const handleCodeInput = (e) => {
    let value = (e.target.value || "").replace(/[^.\d]/g, "");
    if (value.endsWith(".")) {
      value = value.replace(/\./g, "") + ".";
    }
    setForm({ ...form, [e.target.name]: value.toString() });
  };

  const handleSignatureInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProcess = () => {
    setIsConfirmModal(false);
    onFreeMintSubmit({ code, signature });
  };

  return (
    <div className={styles.buyForm}>
      <form className={styles.form}>
        <div className={styles.description1}>
          In publishing and graphic design, Lorem ipsum is a placeholder text
          commonly used to demonstrate the visual form of a document or a
          typeface without relying on meaningful content.
        </div>
        <div className={styles.progressBar}>
          <Progress
            theme={{
              success: {
                color: "green",
              },
              active: {
                color: "linear-gradient(180deg, #3C11B0 0%, #230C56 100%)",
              },
            }}
            percent={new BigNumber(nftInfo.totalSupply || 0)
              .div(sellCount)
              .times(100)
              .dp(5, 1)
              .toString()}
          />
          <div
            className={` d-flex justify-content-between ${styles.progressText}`}
          >
            <div className={styles.label}>
              {nftInfo.totalSupply || 0}/{sellCount}
            </div>
            <div>1 NFC costs {nftPrice} ETH</div>
          </div>
        </div>
        <div className={styles.mintWrap}>
          <div className={styles.mintForm}>
            <div className={styles.brand}>
              <img src="/assets/logo.png" alt="logo" />
            </div>
            <div className={styles.mintBtnWrap}>
              <Button
                className="flex-center justify-center"
                disabled={
                  disabled ||
                  +(nftInfo.totalSupply || 0) === sellCount ||
                  !account ||
                  new BigNumber(nftAmount * nftPrice).isGreaterThanOrEqualTo(
                    balance
                  ) ||
                  new BigNumber(balance).isZero() ||
                  network !== currentNetwork
                }
                onClick={handlePublicMint}
              >
                <img src="/assets/crystal.png" alt="crystal" />
                {+(nftInfo.totalSupply || 0) === sellCount
                  ? "Sold out"
                  : "MINT"}
              </Button>
              <div className={styles.openseaWrap}>
                FIND ON&nbsp;
                <a href="" target="_blank">
                  OPENSEA
                </a>
              </div>
              <Button
                className="flex-center justify-center"
                disabled={
                  disabled ||
                  +(nftInfo.totalSupply || 0) === sellCount ||
                  !account ||
                  new BigNumber(balance).isZero() ||
                  network !== currentNetwork
                }
                onClick={(e) => {
                  e.preventDefault();
                  setIsFreeMint(true);
                }}
              >
                <img src="/assets/crystal.png" alt="crystal" />
                FREE-MINT
              </Button>
            </div>
            {isFreeMint && (
              <div className={styles.freeMintWrap}>
                <div
                  className={`${styles.inputWrapper} ${styles.codeInputWrapper} flex-center`}
                >
                  <label>ID: </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={handleCodeInput}
                  />
                </div>
                <div className={`${styles.inputWrapper} flex-center`}>
                  <label>SIGNATURE: </label>
                  <input
                    id="signature"
                    name="signature"
                    type="text"
                    value={signature}
                    onChange={handleSignatureInput}
                  />
                </div>
                <div className={`flex-all`}>
                  <Button
                    className="flex-center justify-center"
                    disabled={
                      disabled ||
                      +(nftInfo.totalSupply || 0) === sellCount ||
                      !account ||
                      new BigNumber(balance).isZero() ||
                      network !== currentNetwork ||
                      code === "" ||
                      !signature
                    }
                    onClick={handleFreeMint}
                  >
                    MINT
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.mintDescriptionWrap}>
            <div className="flex-center d-flex align-items-center">
              <div className={styles.mintDescription}>
                <p>
                  In publishing and graphic design, Lorem ipsum is a placeholder
                  text commonly used to demonstrate the visual form of a
                  document or a typeface without relying on meaningful content.{" "}
                </p>
                <p>
                  In publishing and graphic design, Lorem ipsum is a placeholder
                  text commonly .
                </p>
              </div>
              <img
                src="/assets/play.png"
                alt="r"
                onClick={() => {
                  onNextPage(1);
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.transactionNote}>
          <div className={styles.title}>
            Please make sure you are connected to the right network
          </div>
          <div className={styles.description}>
            We have set the gas limit to 285000 for the contract to successfully
            mint your NFT. We recommend that you dont lower the gas limit.
          </div>
        </div>
      </form>
      <EmailConfirmModal
        isOpen={isConfirmModal}
        onClose={() => setIsConfirmModal(false)}
        onOk={handleProcess}
      />
    </div>
  );
}
