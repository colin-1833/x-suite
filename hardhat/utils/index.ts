import { DeployOptions } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ethers } from 'hardhat';
import type { Signer, Contract, BigNumber } from 'ethers';
import config from "../config";
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';

export interface Accounts {
    deployer: Signer|null,
    others: Array<Signer>
}

export const load_env = () => {
    const path_to_env = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(path_to_env)) {
        fs.writeFileSync(path_to_env, '');
    }
    dotenv.config({ path: path_to_env });
};

load_env();

export const get_accounts = (hre: HardhatRuntimeEnvironment): Promise<Accounts> => new Promise(async (resolve, reject) => { try {
    const unnamed_signers = await hre.ethers.getUnnamedSigners();
    resolve({
        deployer: unnamed_signers[0],
        others: unnamed_signers.slice(1)
    });
} catch (err) { reject(err) }});

export const format_eth = (eth: BigNumber) => Number((Number(ethers.utils.formatUnits(eth))).toFixed(10));

export const parse_eth = (num: number) => ethers.utils.parseEther(String(num))

export type UseContract = (signer: Signer) => Contract;

export const deploy = (
    hre: HardhatRuntimeEnvironment,
    contract_name: string,
    deploy_options: DeployOptions
): Promise<UseContract> => new Promise(async (resolve, reject) => {
    try {
        const { deployments } = hre;
        const { deploy: _deploy } = deployments;
        const { address } = await _deploy(contract_name, deploy_options);
        const Contract = (await ethers.getContractFactory(contract_name)).attach(address);
        console.log('    Deployed contract: ' + contract_name);
        resolve((signer: Signer) => Contract.connect(signer));
    } catch (err) { reject(err) }
});

export const use_deployments = (hre: HardhatRuntimeEnvironment): any => {
    return {
        deploy_fx: (funder: string): Promise<UseContract> => new Promise(async (resolve, reject) => { try {
            const accounts = await get_accounts(hre);
            const FakeX = await deploy(hre, 'FakeX', {
                from: await accounts.deployer.getAddress(),
                args: []
            });
            await (await FakeX(accounts.deployer).mint(funder, 10000))
                .wait(1);
            resolve(FakeX);
        } catch (err) { reject(err) }}),


        deploy_jx_dev: (X_address: string, treasurer: string, treasury: string, treasury_fee: BigNumber): Promise<UseContract> => new Promise(async (resolve, reject) => { try {
            const accounts = await get_accounts(hre);
            const JoinX = await deploy(hre, 'JoinX', {
                from: await accounts.deployer.getAddress(),
                args: [
                    X_address, 
                    treasurer, 
                    treasury,
                    treasury_fee
                ]
            });
            console.log('Deployed JoinX at: ' + JoinX(accounts.deployer).address);
            resolve(JoinX);
        } catch (err) { reject(err) }}),  

        deploy_jx_mainnet: (treasury_fee: BigNumber): Promise<UseContract> => new Promise(async (resolve, reject) => { try {
            const accounts = await get_accounts(hre);
            const JoinX = await deploy(hre, 'JoinX', {
                from: await accounts.deployer.getAddress(),
                args: [
                    config.x_token_address,
                    await accounts.deployer.getAddress(), 
                    config.treasury_wallet,
                    treasury_fee
                ]
            });
            console.log('Deployed JoinX at: ' + JoinX(accounts.deployer).address);
            resolve(JoinX);
        } catch (err) { reject(err) }})
    };
};