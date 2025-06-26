import { AbiFunction, createPublicClient, Hex, http } from "viem"
import { mainnet } from "viem/chains"
import {
    decodeExecTransactionData,
    getExecAbi,
    getMainnetSafeSingleton,
    trimExecFunctionSelector,
} from "@/gnosis-safe"
import {
    decodePackedMultiSendTransactions,
    getMainnetMultiSendSingleton,
    getMultiSendAbi,
    trimMultiSendFunctionSelector,
} from "@/gnosis-multisend"

describe("Learning: Gnosis MultiSend Transactions", () => {
    it.skip("should log all transactions on multisend tx", async () => {
        // Arrange
        const publicClient = createPublicClient({
            chain: mainnet,
            transport: http(),
        })
        const transaction = await publicClient.getTransaction({
            // Replace with one you want to test
            // hash: "0x0d34dcc1505705403255c6548f3e41b3c34558d48eef1af276bed176fc4bfe22", // 2 tx, second is huge.
            // hash: "0xccc03037b70829baf5aaca20944c424d4722e28e5418b1efe04547d69fbf87f8", // 2 tx, with value to EOAS
            hash: "0x15e0c70a9488a0d68a5a263dea927201b2d36538ed06b29cc18ee39f27eb1bf6",
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

        // Discover
        console.log("Decoded Multi Transactions Count:", decoded.length)
        decoded.forEach((tx, index) => console.log(`At index ${index}:`, tx))
    }).timeout(10_000)
})
