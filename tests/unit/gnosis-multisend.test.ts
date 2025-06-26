import { expect } from "chai"
import { AbiFunction, Hex } from "viem"
import { SingletonDeployment } from "@safe-global/safe-deployments"
import { Operation } from "@/gnosis-safe"
import { safeExecTransactions } from "tests/constants"
import {
    decodePackedMultiSendTransactions,
    getMainnetMultiSendSingleton,
    getMultiSendAbi,
    trimMultiSendFunctionSelector,
} from "@/gnosis-multisend"

describe("Unit: Gnosis Multisend Transactions", () => {
    it("should extract transactions call values 1", async () => {
        // Arrange
        const multisendv130: SingletonDeployment =
            await getMainnetMultiSendSingleton("v1.3.0")
        const multiSendAbi: AbiFunction = getMultiSendAbi(multisendv130)
        const inputParams: Hex = trimMultiSendFunctionSelector(
            multiSendAbi,
            safeExecTransactions.mainnet.execMulti1V1_3_0.multiSendInputData,
        )

        // Act
        const decoded = decodePackedMultiSendTransactions(inputParams)

        // Assert
        expect(decoded.length).to.equal(2)

        // Assert
        expect(decoded[0].operation).to.equal(Operation.Call)
        expect(decoded[0].to).to.equal(
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        )
        expect(decoded[0].value).to.equal(0n)
        expect(decoded[0].data).to.equal(
            "0xa9059cbb000000000000000000000000e37da2d07e769b7fcb808bdeaeffb84561ff4eca000000000000000000000000000000000000000000000000000000000d59f800",
        )

        expect(decoded[1].operation).to.equal(Operation.Call)
        expect(decoded[1].to).to.equal(
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        )
        expect(decoded[1].value).to.equal(0n)
        expect(decoded[1].data).to.equal(
            "0xa9059cbb000000000000000000000000e37da2d07e769b7fcb808bdeaeffb84561ff4eca000000000000000000000000000000000000000000000000000000000bebc200",
        )
    })
})
