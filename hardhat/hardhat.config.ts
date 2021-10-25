import { HardhatUserConfig } from 'hardhat/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy'
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const config: HardhatUserConfig = {
    gasReporter: {
        currency: 'USD',
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        gasPrice: 90
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        ropsten: {
            chainId: 3,
            url: process.env.ROPSTEN_INFURA,
            accounts: [process.env.ROPSTEN_PRIVATE_KEY]
        },
        mainnet: {
            chainId: 1,
            url: process.env.MAINNET_INFURA,
            accounts: [process.env.MAINNET_PRIVATE_KEY]
        }
    },
    solidity: {
        compilers: [
            {
                version: '0.8.6'
            }
        ]
    },
    paths: {

    },
    contractSizer: {
        alphaSort: false,
        runOnCompile: false,
        disambiguatePaths: false,
    }
};

export default config;
