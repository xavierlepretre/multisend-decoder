import {
    getSafeSingletonDeployment,
    SingletonDeployment,
} from "@safe-global/safe-deployments"
import {
    AbiFunction,
    decodeAbiParameters,
    getAbiItem,
    Hash,
    Hex,
    slice,
    toFunctionSelector,
} from "viem"

// Ref https://github.com/safe-global/safe-smart-account/blob/v1.3.0/contracts/common/Enum.sol
export enum Operation {
    Call = 0,
    DelegateCall = 1,
}

export const getMainnetSafeSingleton = async (
    version: string,
): Promise<SingletonDeployment> => {
    const safe: SingletonDeployment | undefined =
        await getSafeSingletonDeployment({
            network: "1",
            version,
            released: true,
        })
    if (!safe) {
        throw new Error(
            "Gnosis Safe mainnet deployment not found for the specified version",
        )
    }
    return safe
}

export const getExecAbi = (deployment: SingletonDeployment): AbiFunction => {
    const execAbi: AbiFunction = getAbiItem({
        abi: deployment.abi,
        name: "execTransaction",
    })
    if (!execAbi || execAbi.type !== "function") {
        throw new Error("execTransaction ABI not found in deployment")
    }
    return execAbi
}

export const trimExecFunctionSelector = (
    execAbi: AbiFunction,
    inputData: Hex,
): Hex => {
    const execFunctionSelector = toFunctionSelector(execAbi)
    if (inputData.startsWith(execFunctionSelector)) {
        return slice(inputData, 4)
    } else {
        throw new Error(
            `Input data does not start with the expected exec function selector: ${execFunctionSelector}`,
        )
    }
}

export const decodeExecTransactionData = (
    execAbi: AbiFunction,
    inputParams: Hex,
): Record<string, any> => {
    const decoded = decodeAbiParameters(execAbi.inputs, inputParams).reduce(
        (accummulated: Record<string, any>, current, index) => {
            const inputName = execAbi.inputs[index].name || `input${index}`
            accummulated[inputName] = current
            return accummulated
        },
        {},
    )
    return decoded
}
