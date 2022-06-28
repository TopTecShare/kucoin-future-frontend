import ReactDOM from "react-dom/client";
import App from "./App";
import { ChainId, DAppProvider, BSC, BSCTestnet } from "@usedapp/core";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const config = {
  readOnlyChainId: ChainId.BSCTestnet,

  networks: [BSC, BSCTestnet],
  readOnlyUrls: {
    [BSC.chainId]: "https://bsc-dataseed.binance.org/",
    [BSCTestnet.chainId]: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  pollingInterval: 1000,
};

const root = ReactDOM.createRoot(document.getElementById("root") as any);

root.render(
  <>
    <ToastContainer />
    <DAppProvider config={config} children={<App />} />
  </>
);
