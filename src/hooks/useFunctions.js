import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import abi from "../global/abi.json";
import { mainnetContract, BUSD } from "../global/constants";
import { useCall, useContractFunction } from "@usedapp/core";

const contractAbi = new Interface(abi);
const contract = new Contract(mainnetContract, contractAbi);
const BUSDcontract = new Contract(BUSD, contractAbi);

export function useMint() {
  const { send, state } = useContractFunction(contract, "mint");
  return {
    mintState: state,
    mint: send,
  };
}

export function useRedeem() {
  const { send, state } = useContractFunction(contract, "redeem");
  return {
    redeemState: state,
    redeem: send,
  };
}

export function useClaim() {
  const { send, state } = useContractFunction(contract, "claim");
  return {
    claimState: state,
    claim: send,
  };
}

export function useApprove() {
  const { send, state } = useContractFunction(BUSDcontract, "approve");
  return {
    approveState: state,
    approve: send,
  };
}

export function useContractBalance() {
  const { value } =
    useCall({
      contract: contract,
      method: "contractBalance",
      args: [],
    }) ?? {};
  return value?.[0];
}

export function useLiquidity() {
  const { value } =
    useCall({
      contract: contract,
      method: "liquidity",
      args: [],
    }) ?? {};
  return value?.[0];
}

export function useRefer(address) {
  const { value, error } =
    useCall({
      contract: contract,
      method: "refered",
      args: [address],
    }) ?? {};
  return value?.[0];
}
