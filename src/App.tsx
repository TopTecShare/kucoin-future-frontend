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
  useClaim,
  useApprove,
  useContractBalance,
  useLiquidity,
  useRefer,
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
  const [balance, setBalance] = useState(0);
  // const BUSDtoken = useToken(BUSD);
  const token = useToken(mainnetContract);
  const BUSDtokenBalance = useTokenBalance(BUSD, account);
  const tokenBalance = useTokenBalance(mainnetContract, account);
  const tokenAllowance = useTokenAllowance(BUSD, account, mainnetContract);
  const [redeemAmount, setRedeem] = useState("");
  const [claimAmount, setClaim] = useState("");
  const [mintAmount, setMint] = useState("");
  const contractBalance = useContractBalance();
  const referalBalance = useRefer(account);
  const liquidity = useLiquidity();
  const { mintGas, redeemGas, claimGas, approveGas } = useEstimateGas();
  const { mint, mintState } = useMint();
  const { redeem, redeemState } = useRedeem();
  const { claim, claimState } = useClaim();
  const { approve, approveState } = useApprove();
  const [check, setCheck] = useState(false);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const referer = useMemo(() => {
    return account
      ? window.location.origin + "?ref=" + account
      : window.location.origin;
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
    fetch(`/balance`, {
      headers: {
        accepts: "application/json",
      },
    })
      .then((e) => e.json())
      .then(setBalance);
  }, []);
  useEffect(() => {
    toastMsg(mintState);
  }, [mintState]);

  useEffect(() => {
    toastMsg(redeemState);
  }, [redeemState]);

  useEffect(() => {
    toastMsg(claimState);
  }, [claimState]);

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
          Referer:{" "}
          <input
            readOnly
            value={referer}
            onChange={() => {}}
            style={{ width: `${referer.length}ch` }}
          />
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
      <p>
        Price: {liquidity / Number(token?.totalSupply) || 0}
        BUSD ( + 0.025 % fee)
      </p>
      <p>Circulating Supply: {liquidity && formatEther(liquidity)}</p>
      <p>
        Total Supply: {token?.totalSupply && formatEther(token?.totalSupply)}
      </p>
      <p>Future Balance: {balance}</p>
      <p>
        Contract Balance:{" "}
        {contractBalance && Number(formatEther(contractBalance))}
      </p>
      <p>token Balance: {tokenBalance && Number(formatEther(tokenBalance))}</p>
      <p>
        BUSD Balance:{" "}
        {BUSDtokenBalance && Number(formatEther(BUSDtokenBalance))}
      </p>
      <p>
        Referal Balance: {referalBalance && Number(formatEther(referalBalance))}
      </p>
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
              const ratio = params.ref ? 1.03 : 1.025;
              BUSDtokenBalance &&
                token?.totalSupply &&
                liquidity &&
                setMint(
                  String(
                    Number(
                      BUSDtokenBalance.mul(liquidity).div(token?.totalSupply)
                    ) /
                      10 ** 18 /
                      ratio
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
                  console.log(window.location.pathname);

                  const address = params.ref ? params.ref : mainnetContract;
                  const estimatedGas = await mintGas(
                    parseEther(mintAmount),
                    address
                  );
                  mint(parseEther(mintAmount), address, {
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
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                  );
                  approve(
                    mainnetContract,
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
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
        <div>
          <input
            value={claimAmount}
            onChange={(e) => {
              setClaim(e.target.value);
            }}
            inputMode="numeric"
          />{" "}
          {Number(claimAmount)} BUSD is claimed.{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              referalBalance && setClaim(formatEther(referalBalance));
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
                console.log(claimAmount);
                const estimatedGas = await claimGas(parseEther(claimAmount));
                claim(parseEther(claimAmount), {
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
            Claim
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
