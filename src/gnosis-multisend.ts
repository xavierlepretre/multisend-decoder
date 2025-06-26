import {
    getMultiSendDeployment,
    SingletonDeployment,
} from "@safe-global/safe-deployments"
import {
    AbiFunction,
    Address,
    fromHex,
    getAbiItem,
    Hex,
    size,
    slice,
    toFunctionSelector,
    trim,
} from "viem"
import { Operation } from "./gnosis-safe"

export const getMainnetMultiSendSingleton = async (
    version: string,
): Promise<SingletonDeployment> => {
    const safe: SingletonDeployment | undefined = await getMultiSendDeployment({
        network: "1",
        version,
        released: true,
    })
    if (!safe) {
        throw new Error(
            "Gnosis MultiSend mainnet deployment not found for the specified version",
        )
    }
    return safe
}

export const getMultiSendAbi = (
    deployment: SingletonDeployment,
): AbiFunction => {
    const multiSendAbi: AbiFunction = getAbiItem({
        abi: deployment.abi,
        name: "multiSend",
    })
    if (!multiSendAbi || multiSendAbi.type !== "function") {
        throw new Error("multiSend ABI not found in deployment")
    }
    return multiSendAbi
}

export const trimMultiSendFunctionSelector = (
    multiSendAbi: AbiFunction,
    inputData: Hex,
): Hex => {
    const multiSendFunctionSelector = toFunctionSelector(multiSendAbi)
    if (inputData.startsWith(multiSendFunctionSelector)) {
        return slice(inputData, 4)
    } else {
        throw new Error(
            `Input data does not start with the expected multiSend function selector: ${multiSendFunctionSelector}`,
        )
    }
}

interface DecodingMultiSendTransactions {
    transactions: MultiSendTransaction[]
    remaining: Hex
}

//  1 byte for operation
// 20 bytes for address
// 32 bytes for value
// 32 bytes for data length
//  1 byte at least for data
export const MIN_PACKED_MULTISEND_TRANSACTION_SIZE = 86

export const decodePackedMultiSendTransactions = (
    multiSendInput: Hex,
): MultiSendTransaction[] => {
    const startPoint = fromHex(slice(multiSendInput, 0, 32), "number")
    const remaining = slice(multiSendInput, startPoint)
    const bytesLength = fromHex(slice(remaining, 0, 32), "number")
    const packedTransactions = slice(remaining, 32)
    if (size(packedTransactions) < bytesLength) {
        // It may be larger due to padding
        throw new Error(
            "Packed transactions length is less than the specified length",
        )
    }
    const decoding: DecodingMultiSendTransactions = {
        transactions: [],
        remaining: packedTransactions,
    }
    while (MIN_PACKED_MULTISEND_TRANSACTION_SIZE <= size(decoding.remaining)) {
        const { transaction, remaining } =
            decodePackedFirstMultiSendTransaction(decoding.remaining)
        decoding.transactions.push(transaction)
        decoding.remaining = remaining
    }
    if (
        0 < size(decoding.remaining) &&
        trim(decoding.remaining, { dir: "left" }) !== "0x00"
    ) {
        throw new Error(
            `Remaining data after decoding multiSend transactions is not empty: ${decoding.remaining}`,
        )
    }
    return decoding.transactions
}

export interface MultiSendTransaction {
    operation: Operation
    to: Address
    value: bigint
    data: Hex
}

interface FirstMultiSendDecoded {
    transaction: MultiSendTransaction
    remaining: Hex
}

const decodePackedFirstMultiSendTransaction = (
    remainingPackedTransactions: Hex,
): FirstMultiSendDecoded => {
    const operationVal = fromHex(
        slice(remainingPackedTransactions, 0, 1),
        "number",
    )
    if (operationVal < 0 || operationVal > 2) {
        throw new Error("Invalid operation number in multiSend transaction")
    }
    const operation =
        operationVal === 0 ? Operation.Call : Operation.DelegateCall
    const to = slice(remainingPackedTransactions, 1, 21)
    const value = fromHex(slice(remainingPackedTransactions, 21, 53), "bigint")
    const dataLength = fromHex(
        slice(remainingPackedTransactions, 53, 85),
        "number",
    )
    const data = slice(remainingPackedTransactions, 85, 85 + dataLength)
    const transaction: MultiSendTransaction = {
        operation,
        to,
        value,
        data,
    }
    const remaining = slice(remainingPackedTransactions, 85 + dataLength)
    return { transaction, remaining }
}
