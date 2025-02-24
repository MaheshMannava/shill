# Dr shill🌽

<h4 align="center">
  <a href="https://testnet-explorer.usecorn.com/address/0x3B5A58D4388ed661F1F9FE479D3Cbf28E1d8AF29?tab=contract">Corn Testnet Blockexplorer</a> |
  <a href="https://drshill.vercel.app/">Website</a>
</h4>

Drshill is a collaborative memecoin launcher designed for in-person events. Attendees can submit memes, vote on submissions, and participate in launching a new memecoin on the CORN network.

 Built using Soldiity, NextJS, Hardhat, Wagmi, Viem, and Typescript.


![dr3](https://github.com/user-attachments/assets/6f56d0f5-8e0c-4384-9427-51e25ed17ce3)

![dr4](https://github.com/user-attachments/assets/da4cecd6-170c-4095-9374-afd3b41005c3)

![dr1](https://github.com/user-attachments/assets/0e6da78f-42f4-4c08-9d1f-f2864f09ff5f)

![dr2](https://github.com/user-attachments/assets/73632054-91fb-42c2-8c88-e401be82af34)



## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd shill
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`
