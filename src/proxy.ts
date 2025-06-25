import { parseAbi } from "viem"

export const iGnosisProxyAbi = parseAbi([
    "function masterCopy() external view returns (address)",
])

export const iProxyType2Abi = parseAbi([
    "function implementation() external view returns (address)",
    "function proxyType() public pure returns (uint256)",
])
