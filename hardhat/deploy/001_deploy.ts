
import { DeployFunction } from 'hardhat-deploy/types';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
    load_env,
    use_deployments,
    parse_eth
} from '../utils/index';

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';

load_env();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const [deployer, funder, treasury] = await hre.ethers.getUnnamedSigners();
    const {
        deploy_fx,
        deploy_jx_dev,
        deploy_jx_mainnet
    } = use_deployments(hre);
    if (hre.network.config.chainId === 1) {
        await deploy_jx_mainnet(parse_eth(.05));
        return;
    }
    if (hre.network.config.chainId === 3) {
        const FakeX = await deploy_fx(deployer.address);
        await deploy_jx_dev(
            FakeX(deployer).address, 
            deployer.address, 
            deployer.address,
            parse_eth(.05)
        );
        return;
    }
    if (hre.network.config.chainId === 1337) {
        const FakeX = await deploy_fx(funder.address);
        await deploy_jx_dev(
            FakeX(deployer).address, 
            deployer.address, 
            deployer.address,
            parse_eth(.05)
        );
        return;
    }
    throw new Error('Unsupported testnet with chainId: ' + hre.network.config.chainId);
};
export default func;
func.tags = ['Legendeth'];
