import { expect } from "chai"
import { AbiFunction, Hex } from "viem"
import { SingletonDeployment } from "@safe-global/safe-deployments"
import {
    decodeExecTransactionData,
    getExecAbi,
    getMainnetSafeSingleton,
    Operation,
    trimExecFunctionSelector,
} from "@/gnosis-safe"
import { safeExecTransactions } from "tests/constants"
import { getMainnetMultiSendSingleton } from "@/gnosis-multisend"

describe("Unit: Gnosis Safe Transactions", () => {
    it("should extract exec call values 1", async () => {
        // Arrange
        const safev130: SingletonDeployment =
            await getMainnetSafeSingleton("v1.3.0")
        const execAbi: AbiFunction = getExecAbi(safev130)
        const inputParams: Hex = trimExecFunctionSelector(
            execAbi,
            safeExecTransactions.mainnet.execSingleV1_3_0.inputData,
        )

        // Act
        const decoded = decodeExecTransactionData(execAbi, inputParams)

        // Assert
        expect(decoded.to).to.equal(
            "0x1C18bAd5a3ee4e96611275B13a8ed062B4a13055",
        )
        expect(decoded.value).to.equal(0n)
        expect(decoded.data).to.equal(
            "0x359afa4921ebc35a3bd791d9bef65c704bf4dc75c3115f755e887a3b69da9b9296a362ee000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        )
        expect(decoded.operation).to.equal(Operation.Call)
        expect(decoded.safeTxGas).to.equal(286049n)
        expect(decoded.baseGas).to.equal(55856n)
        expect(decoded.gasPrice).to.equal(65333333334n)
        expect(decoded.gasToken).to.equal(
            "0x0000000000000000000000000000000000000000",
        )
        expect(decoded.refundReceiver).to.equal(
            "0x0000000000000000000000000000000000000000",
        )
        expect(decoded.signatures).to.equal(
            "0x7fefbb9a7ad368cce9709b5b880f2a2c9a37db59ccb3dc9a6f189bbfb8e8cd9715efcc2f3a5806e13d766f8d8f73e67591141a8e1e390290a88b1f2ed3b3d0e81c04a76aef1c97cefa842e6f98e0c6fd7057ebfdf0666145896b2ba2bc1a7e41bd40407a83829d3d317908f052d481f3b460787cf4680f83e04634d6d32bea93561c",
        )
    })

    it("should extract exec call values 2, multisend", async () => {
        // Arrange
        const safev130: SingletonDeployment =
            await getMainnetSafeSingleton("v1.3.0")
        const execAbi: AbiFunction = getExecAbi(safev130)
        const inputParams: Hex = trimExecFunctionSelector(
            execAbi,
            safeExecTransactions.mainnet.execMulti1V1_3_0.inputData,
        )
        const multisendv130: SingletonDeployment =
            await getMainnetMultiSendSingleton("v1.3.0")

        // Act
        const decoded = decodeExecTransactionData(execAbi, inputParams)

        // Assert
        expect(decoded.to).to.equal(multisendv130.defaultAddress)
        expect(decoded.value).to.equal(0n)
        expect(decoded.data).to.equal(
            safeExecTransactions.mainnet.execMulti1V1_3_0.multiSendInputData,
        )
        expect(decoded.operation).to.equal(Operation.DelegateCall)
        expect(decoded.safeTxGas).to.equal(126185n)
        expect(decoded.baseGas).to.equal(65437n)
        expect(decoded.gasPrice).to.equal(6873627948n)
        expect(decoded.gasToken).to.equal(
            "0x0000000000000000000000000000000000000000",
        )
        expect(decoded.refundReceiver).to.equal(
            "0x0000000000000000000000000000000000000000",
        )
        expect(decoded.signatures).to.equal(
            "0x49f398faae7aa4aa047d9e9efc61a71e0f34eed4ba5cc95bb6b02f55d144e0b323f67060b58d7f58d3df54fb1b9252c92dc6016f7b06430cb8654fc2739d35de1c9492f0e5172a6dc864b0535ba115f056500570f133f9929a897fdf5f1913f4ed1a24dfc0f9200f40f79078bac0341b251709a356a75f13016825f762e5ea13771b",
        )
    })
})
