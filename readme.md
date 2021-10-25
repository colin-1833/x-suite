# Dependencies
Ensure you have the following tools installed on your system: *nodejs, npm, yarn, git*

# How JoinX.sol works

Any holder of $X that has an unspent invite can sacrifice their invite by calling **sacrificeSeedInvite()** on the deployed contract. Once this has occurred ANY ethereum wallet owner that cannot yet trade $X can call **join()**, enabling them to now buy $X on an exchange, OTC, etc. *note*:  the **join()** function requires a treasury fee. The treasury will be governed by the $X community.

# How to deploy JoinX.sol
1. Clone and install this github project using the following commands.
    ```
    git clone <repo_url>
    cd x-suite/hardhat
    yarn install
    ```
2. Edit **x-suite/hardhat/example.env**, filling in the blank strings
3. Rename the above edited file to **x-suite/hardhat/.env**
4. Ensure that the wallet associated with MAINNET_PRIVATE_KEY from the .env file edited above has enough ETH to successfully deploy JoinX.sol (wallet should have ~.3 ETH at minimum)
5. Then run:
   ```
   yarn deploy-mainnet
   ```
6. Confirm that the contract is deployed by entering the TX hash of the deployment into etherscan
7. Use [https://app.mycrypto.com](https://app.mycrypto.com) to interact with the deployed contract.
