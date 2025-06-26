# MultiSend Transaction Decoder

[Gnosis MultiSend contract v1.3.0](https://github.com/safe-global/safe-smart-account/blob/v1.3.0/contracts/libraries/MultiSend.sol) expects packed-encoded transactions. This project decodes its inner function calls. It also decodes transactions sent to [Gnosis Safe v1.3.0](https://github.com/safe-global/safe-smart-account/blob/v1.3.0/contracts/GnosisSafe.sol).

Structure of the transactions being tested:

1. The outer transaction contains a transaction to be executed by Gnosis Safe. This can be collected and decomposed with the help of `viem` functions.
2. This once-nested inner transaction, in turn, is sent to Gnosis Multisend. This can be extracted with the help of `src/gnosis-safe.ts` functions.
3. This doubly-nested inner transaction, in turn, is unpacked into multiple transactions. These can be extracted with the help of `src/gnosis-multisend.ts`.
4. These triply-nested inner transactions are just observed and tested as hex blobs.

## Install

Optional:

```sh
nvm install && nvm use
```

Necessary:

```sh
npm install
```

Or:

```sh
docker run --rm -v $(pwd):/app -w /app node:22.11.0 npm install
```

## Run tests

```sh
npm test
```

Or:

```sh
docker run --rm -v $(pwd):/app -w /app node:22.11.0 npm test
```

## Learning

If you want to simply log a new transaction, put its hash in the `tests/learning/gnosis-multisend.test.ts` file and remove `.skip`.
