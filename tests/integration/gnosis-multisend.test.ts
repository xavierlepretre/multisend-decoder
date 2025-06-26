import { expect } from "chai"
import { AbiFunction, createPublicClient, Hex, http } from "viem"
import { mainnet } from "viem/chains"
import {
    decodeExecTransactionData,
    getExecAbi,
    getMainnetSafeSingleton,
    Operation,
    trimExecFunctionSelector,
} from "@/gnosis-safe"
import { safeExecTransactions } from "tests/constants"
import {
    decodePackedMultiSendTransactions,
    getMainnetMultiSendSingleton,
    getMultiSendAbi,
    trimMultiSendFunctionSelector,
} from "@/gnosis-multisend"

describe("Integration: Gnosis MultiSend Transactions", () => {
    it("should have many transaction on multisend tx 1", async () => {
        // Arrange
        const publicClient = createPublicClient({
            chain: mainnet,
            transport: http(),
        })
        const transaction = await publicClient.getTransaction({
            hash: safeExecTransactions.mainnet.execMulti2V1_3_0.hash,
        })
        const execAbi: AbiFunction = getExecAbi(
            await getMainnetSafeSingleton("v1.3.0"),
        )
        const execInputParams: Hex = trimExecFunctionSelector(
            execAbi,
            transaction.input,
        )
        const decodedExec = decodeExecTransactionData(execAbi, execInputParams)
        const multiSendSingleton = await getMainnetMultiSendSingleton("v1.3.0")
        const multiInputParams: Hex = trimMultiSendFunctionSelector(
            getMultiSendAbi(multiSendSingleton),
            decodedExec.data,
        )

        // Act
        const decoded = decodePackedMultiSendTransactions(multiInputParams)

        // Assert
        expect(decodedExec.to).to.equal(multiSendSingleton.defaultAddress)
        expect(decoded.length).to.equal(58)

        // https://dashboard.tenderly.co/tx/0x6fad5f31f028f6549d73988859afbbe9391b9ff67365c443a70e9c2b7c0e182a?trace=0.1.7.0.0
        expect(decoded[0].operation).to.equal(Operation.Call)
        expect(decoded[0].to).to.equal(
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        )
        expect(decoded[0].value).to.equal(0n)
        expect(decoded[0].data).to.equal(
            "0xa9059cbb000000000000000000000000b50bb7a5bff46bf471085fa7e3ac49247f2d25450000000000000000000000000000000000000000000000000000000285b27640",
        )

        // https://dashboard.tenderly.co/tx/0x6fad5f31f028f6549d73988859afbbe9391b9ff67365c443a70e9c2b7c0e182a?trace=0.1.7.0.55
        expect(decoded[55].operation).to.equal(Operation.Call)
        expect(decoded[55].to).to.equal(
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        )
        expect(decoded[55].value).to.equal(0n)
        expect(decoded[55].data).to.equal(
            "0xa9059cbb00000000000000000000000032ae6a8bcf1a3a60d2a2cac1ba26b549f158d64d00000000000000000000000000000000000000000000000000000000128e0fa0",
        )
    }).timeout(10_000)
})
