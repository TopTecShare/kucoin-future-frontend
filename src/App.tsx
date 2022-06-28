import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
// import BeatLoader from "react-spinners/BeatLoader";
import WalletConnectionModal from "./components/walletmodal";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { formatEther, parseEther } from "@ethersproject/units";
import {
  useEthers,
  useToken,
  useTokenBalance,
  useTokenAllowance,
} from "@usedapp/core";
import {
  useMint,
  useRedeem,
  useApprove,
  useLiquidity,
} from "./hooks/useFunctions";

import useEstimateGas from "./hooks/useEstimateGas";
import Histories from "./containers/History";
import Navbar from "./components/Navbar";
import "./styles/App.css";
import { ReactComponent as CopySVG } from "./svg/copy.svg";
import { ReactComponent as CheckSVG } from "./svg/check.svg";
import { BUSD, mainnetContract } from "./global/constants";
const App = () => {
  const [wallet, setWallet] = useState(false);
  const { account } = useEthers();
  // const BUSDtoken = useToken(BUSD);
  const token = useToken(mainnetContract);
  const BUSDtokenBalance = useTokenBalance(BUSD, account);
  const tokenBalance = useTokenBalance(mainnetContract, account);
  const tokenAllowance = useTokenAllowance(BUSD, account, mainnetContract);
  const [redeemAmount, setRedeem] = useState("");
  const [mintAmount, setMint] = useState("");
  const liquidity = useLiquidity();
  const { mintGas, redeemGas, approveGas } = useEstimateGas();
  const { mint, mintState } = useMint();
  const { redeem, redeemState } = useRedeem();
  const { approve, approveState } = useApprove();
  const [check, setCheck] = useState(false);
  const referer = useMemo(() => {
    return account
      ? window.location.href + "?ref=" + account
      : window.location.href;
  }, [account]);

  const toastMsg = (state: any) => {
    if (state.status === "PendingSignature")
      toast.info("Waiting for signature", {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      });

    if (state.status === "Exception")
      toast.warning("User denied signature", {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      });

    if (state.status === "Mining")
      toast.info("Pending transaction", {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      });

    if (state.status === "Success")
      toast.success("Successfully confirmed", {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      });
  };

  useEffect(() => {
    toastMsg(mintState);
  }, [mintState]);

  useEffect(() => {
    toastMsg(redeemState);
  }, [redeemState]);

  useEffect(() => {
    toastMsg(approveState);
  }, [approveState]);

  return (
    <div className="container mt-3">
      <WalletConnectionModal open={wallet} onClose={() => setWallet(false)} />
      <div
        className="referer"
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          Referer: <input readOnly value={referer} onChange={() => {}} />
          <button
            style={{
              width: "30px",
              cursor: "pointer",
              border: "1px solid rgba(118, 118, 118, 0.3)",
            }}
            onClick={() => {
              setCheck(true);
              navigator.clipboard.writeText(referer);
              setTimeout(() => setCheck(false), 500);
            }}
          >
            {check ? <CheckSVG /> : <CopySVG />}
          </button>
        </div>
        <p
          onClick={() => {
            setWallet(true);
          }}
        >
          {account ? account : "Connect Wallet"}
        </p>
      </div>
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <input
            value={mintAmount}
            onChange={(e) => {
              setMint(e.target.value);
            }}
            inputMode="numeric"
          />{" "}
          {Number(mintAmount) &&
            token?.totalSupply &&
            liquidity &&
            (Number(mintAmount) / Number(token?.totalSupply)) *
              liquidity *
              1.025}{" "}
          BUSD is required.{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              BUSDtokenBalance &&
                token?.totalSupply &&
                liquidity &&
                setMint(
                  String(
                    Number(
                      BUSDtokenBalance.mul(liquidity).div(token?.totalSupply)
                    ) /
                      10 ** 18 /
                      1.025
                  )
                );
            }}
          >
            Max
          </span>{" "}
          {tokenAllowance &&
          mintAmount &&
          Number(tokenAllowance) >= Number(parseEther(mintAmount)) ? (
            <button
              style={{
                cursor: "pointer",
                border: "1px solid rgba(118, 118, 118, 0.3)",
              }}
              onClick={async () => {
                try {
                  const estimatedGas = await mintGas(parseEther(mintAmount));
                  mint(parseEther(mintAmount), {
                    gasLimit: estimatedGas.mul(2),
                  });
                } catch (error: any) {
                  toast.error(
                    error.error
                      ? error.error.message
                          .split("execution reverted: ")
                          .join("")
                      : error.split("execution reverted: ").join(""),
                    {
                      position: toast.POSITION.BOTTOM_RIGHT,
                      hideProgressBar: true,
                    }
                  );
                }
              }}
            >
              Mint
            </button>
          ) : (
            <button
              style={{
                cursor: "pointer",
                border: "1px solid rgba(118, 118, 118, 0.3)",
              }}
              onClick={async () => {
                try {
                  const estimatedGas = await approveGas(
                    mainnetContract,
                    parseEther("10000000000000000000000000")
                  );
                  approve(
                    mainnetContract,
                    parseEther("10000000000000000000000000"),
                    {
                      gasLimit: estimatedGas.mul(2),
                    }
                  );
                } catch (error: any) {
                  console.log(error);
                  toast.error(
                    error.error
                      ? error.error.message
                          .split("execution reverted: ")
                          .join("")
                      : error,
                    {
                      position: toast.POSITION.BOTTOM_RIGHT,
                      hideProgressBar: true,
                    }
                  );
                }
              }}
            >
              Approve
            </button>
          )}
        </div>
        <div>
          <input
            value={redeemAmount}
            onChange={(e) => {
              setRedeem(e.target.value);
            }}
            inputMode="numeric"
          />{" "}
          {Number(redeemAmount) &&
            token?.totalSupply &&
            liquidity &&
            (Number(redeemAmount) / Number(token?.totalSupply)) *
              liquidity *
              0.975}{" "}
          BUSD is refunded.{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              tokenBalance && setRedeem(formatEther(tokenBalance));
            }}
          >
            Max
          </span>{" "}
          <button
            style={{
              cursor: "pointer",
              border: "1px solid rgba(118, 118, 118, 0.3)",
            }}
            onClick={async () => {
              try {
                const estimatedGas = await redeemGas(parseEther(redeemAmount));
                redeem(parseEther(redeemAmount), {
                  gasLimit: estimatedGas.mul(2),
                });
              } catch (error: any) {
                toast.error(
                  error.error
                    ? error.error.message.split("execution reverted: ").join("")
                    : error.split("execution reverted: ").join(""),
                  {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    hideProgressBar: true,
                  }
                );
              }
            }}
          >
            Redeem
          </button>
        </div>
      </div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Histories />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
