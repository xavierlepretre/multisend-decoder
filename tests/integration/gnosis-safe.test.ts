import { expect } from "chai"
import { createPublicClient, getContract, http } from "viem"
import { mainnet } from "viem/chains"
import { SingletonDeployment } from "@safe-global/safe-deployments"
import { getMainnetSafeSingleton } from "@/gnosis-safe"
import { iProxyType2Abi } from "@/proxy"
import { safeExecTransactions } from "tests/constants"

describe("Integration: Gnosis Safe Transactions", () => {
    it("should have v1.3.0 on tx 1", async () => {
        // Arrange
        const publicClient = createPublicClient({
            chain: mainnet,
            transport: http(),
        })
        const safev130: SingletonDeployment =
            await getMainnetSafeSingleton("v1.3.0")
        const transaction = await publicClient.getTransaction({
            hash: safeExecTransactions.mainnet.execSingleV1_3_0.hash,
        })
        const proxyContract = await getContract({
            abi: iProxyType2Abi,
            address: transaction.to!,
            client: { public: publicClient },
        })

        // Act
        const masterCopyAddress = await proxyContract.read.implementation()

        // Assert
        expect(transaction.input).to.equal(
            safeExecTransactions.mainnet.execSingleV1_3_0.inputData,
        )
        expect(masterCopyAddress).to.equal(safev130.defaultAddress)
    }).timeout(10_000)
})
