import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import { useEthers } from "@usedapp/core";
import abi from "../global/abi.json";
import { mainnetContract, BUSD } from "../global/constants";

export default function useEstimateGas() {
  const contractAbi = new Interface(abi);
  const { library } = useEthers();

  const mintGas = async (...args) => {
    const contract = new Contract(
      mainnetContract,
      contractAbi,
      library?.getSigner()
    );
    const estimatedGas = await contract.estimateGas.mint(...args);

    return estimatedGas;
  };

  const redeemGas = async (...args) => {
    const contract = new Contract(
      mainnetContract,
      contractAbi,
      library?.getSigner()
    );
    const estimatedGas = await contract.estimateGas.redeem(...args);

    return estimatedGas;
  };

  const claimGas = async (...args) => {
    const contract = new Contract(
      mainnetContract,
      contractAbi,
      library?.getSigner()
    );
    const estimatedGas = await contract.estimateGas.claim(...args);

    return estimatedGas;
  };

  const approveGas = async (...args) => {
    const contract = new Contract(BUSD, contractAbi, library?.getSigner());
    const estimatedGas = await contract.estimateGas.approve(...args);

    return estimatedGas;
  };

  return { mintGas, redeemGas, approveGas, claimGas };
}
