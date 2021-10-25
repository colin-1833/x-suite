import * as hre from 'hardhat';
import { Signer } from 'ethers';
import { use, expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import { use_deployments, UseContract, format_eth, parse_eth } from '../utils/index'

use(solidity);

describe('Test', function () {
    let funder: Signer;
    let deployer: Signer;
    let first_user: Signer;
    let second_user: Signer;
    let treasury: Signer;
    let JoinX: UseContract;
    let FakeX: UseContract;
    const {
        deploy_fx,
        deploy_jx_dev
    } = use_deployments(hre);

    it('deploy local network', async function () {
        [deployer, funder, first_user, second_user, treasury] = await hre.ethers.getUnnamedSigners();
        FakeX = await deploy_fx(await funder.getAddress());
        JoinX = await deploy_jx_dev(
            FakeX(deployer).address, 
            await deployer.getAddress(),
            await treasury.getAddress(),
            parse_eth(.05)
        );
    });

    it('JoinX', async function () {
        await (await FakeX(funder)
            .transfer(await deployer.getAddress(), 100))
            .wait(1);
        console.log('funder sent deployer X and spent first invite.');

        await (await FakeX(deployer)
            .approve(JoinX(deployer).address, 10))
            .wait(1);
        await (await FakeX(first_user)
            .approve(JoinX(deployer).address, 10))
            .wait(1);
        await (await FakeX(funder)
            .approve(JoinX(deployer).address, 10))
            .wait(1);
        await (await FakeX(second_user)
            .approve(JoinX(deployer).address, 10))
            .wait(1);
        console.log('approved all signers X transfer');

        try {
            await (await JoinX(funder)
                .sacrificeSeedInvite())
                .wait(1);
            throw new Error('Should have failed since invite was already spent');
        } catch(err) {
            expect(err.message.includes(`You already spent your invite`)).to.equal(true);
        }

        await (await JoinX(deployer)
            .sacrificeSeedInvite())
            .wait(1);
            
        try {
            await (await JoinX(deployer)
                .sacrificeSeedInvite())
                .wait(1);
            throw new Error('Should have failed to sacrifice seed invite');
        } catch(err) {
            expect(err.message.includes(`A seed invite already exists`)).to.equal(true);
        }

        try {
            await (await JoinX(deployer)
                .join({ value: parse_eth(.05) }))
                .wait(1);
            throw new Error(`Should fail to join since we're already invited`);
        } catch(err) {
            expect(err.message.includes(`You are already invited to X`)).to.equal(true);
        }

        try {
            await (await JoinX(first_user)
                .join({ value: parse_eth(.06) }))
                .wait(1);
            throw new Error(`Should fail to join with invalid fee`);
        } catch(err) {
            expect(err.message.includes(`Incorrect treasury fee supplied`)).to.equal(true);
        }

        await (await JoinX(first_user)
            .join({ value: parse_eth(.05) }))
            .wait(1);

        await (await FakeX(funder)
            .transfer(await first_user.getAddress(), 11))
            .wait(1);

        await (await JoinX(second_user)
            .join({ value: parse_eth(.05) }))
            .wait(1);

        await (await FakeX(funder)
            .transfer(await second_user.getAddress(), 13))
            .wait(1);

        console.log(
            'deployer',
            (
                await FakeX(deployer)
                    .balanceOf(await deployer.getAddress())
            ).toNumber()
        );
        console.log(
            'funder',
            (
                await FakeX(deployer)
                    .balanceOf(await funder.getAddress())
            ).toNumber()
        );
        console.log(
            'first user',
            (
                await FakeX(deployer)
                    .balanceOf(await first_user.getAddress())
            ).toNumber()
        );
        console.log(
            'second user',
            (
                await FakeX(deployer)
                    .balanceOf(await second_user.getAddress())
            ).toNumber()
        );
    });
});
