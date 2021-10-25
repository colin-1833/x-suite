// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IInviteContract {
    function redeem(address receiver) external;
}

contract InviteContract is IInviteContract {
    IERC20 X_token_contract;
    address creator;

    constructor(address X_token_address) {
        creator = msg.sender;
        X_token_contract = IERC20(X_token_address);
    }

    /**
    * @dev Throws if anyone but the creator contract calls
    */
    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator contract can do that");
        _;
    }

    /**
    * @dev Sends the .01 $X to any specified address
    */
    function redeem(address receiver) external override onlyCreator() {
        X_token_contract.transfer(receiver, X_token_contract.balanceOf(address(this)));
    }
}

abstract contract IX {
    mapping(address => bool) public allowlist;
    mapping(address => bool) public invitationSpent;
}

contract JoinX {
    IERC20 X_token_contract;
    address public X_token_address = address(0);
    address public invite_holding_address = address(0);
    address public seed_invite_sender = address(0);
    uint256 public treasury_fee = 0;
    address public treasurer = address(0);
    address public treasury = address(0);
    address next_treasury = address(0);
    address next_treasurer = address(0);

    constructor(
        address _X_token_address, 
        address _treasurer, 
        address _treasury, 
        uint256 _treasury_fee
    ) {
        X_token_contract = IERC20(_X_token_address);
        X_token_address = _X_token_address;
        treasurer = _treasurer;
        treasury = _treasury;
        treasury_fee = _treasury_fee;
    }
    
    /// Events

    event JoinedX(address _member, address _invite_holding_address, uint256 _fee_paid);   
    event SacrifiedSeedInvite(address sender, address _invite_holding_address);   
    event ChangedTreasurer(address _old_treasurer, address _new_treasurer);
    event ChangedTreasury(address _old_treasury, address _new_treasury);

    /// Access Control Modifiers

    /**
    * @dev Throws when this contract has no seed invite to recycle
    */
    modifier seedInviteExists() {
        require(address(0) != seed_invite_sender, "No seed invite exists");
        _;
    }

    /**
    * @dev Throws when the contract DOES have a seed invite to recycle
    */
    modifier seedInviteDoesNotExist() {
        require(address(0) == seed_invite_sender, "A seed invite already exists");
        _;
    }

    /**
    * @dev Only the contract or person receiving the 
    */
    modifier onlyTreasurer() {
        require(msg.sender == treasurer, "Only the treasury can do that");
        _;
    }

    /**
    * @dev Throws if msg.sender never doesn't have at least .01 $X
    */
    modifier onlyWhenBalanceIsSufficient() {
        require(X_token_contract.balanceOf(msg.sender) >= 1, "You need at least .01 $X");
        _;
    }

    /**
    * @dev Throws if msg.sender never set the minimum allowance
    */
    modifier onlyWhenAllowed() {
        require(X_token_contract.allowance(msg.sender, address(this)) >= 1, "This contract is not approved to transfer .01 $X");
        _;
    }

    /// Public Methods

    /**
    * @dev Stores the next treasury address for confirmation
    */
    function updateTreasuryAddress(address _next_treasury) external onlyTreasurer() {
        require(address(0) != _next_treasury, "Treasury address must not be empty");

        next_treasury = _next_treasury;
    }

    /**
    * @dev Confirms and changes the treasury address
    */
    function confirmTreasuryAddress(address _treasury) external onlyTreasurer() {
        require(_treasury == next_treasury, "Wrong treasury address supplied");
        require(address(0) != _treasury, "Treasury address must not be empty");

        emit ChangedTreasury(treasury, _treasury);
        
        treasury = _treasury;
    }
    
    /**
    * @dev Stores the next treasurer address for confirmation
    */
    function updateTreasurerAddress(address _next_treasurer) external onlyTreasurer() {
        require(address(0) != _next_treasurer, "Treasurer address must not be empty");

        next_treasurer = _next_treasurer;
    }

    /**
    * @dev Confirms and changes the treasurer address
    */
    function confirmTreasurerAddress(address _treasurer) external onlyTreasurer() {
        require(_treasurer == next_treasurer, "Wrong treasurer address supplied");
        require(address(0) != _treasurer, "Treasurer address must not be empty");

        emit ChangedTreasury(treasurer, _treasurer);

        treasurer = _treasurer;
    }

    /**
    * @dev Changes the fee paid out to the treasury
    */
    function updateTreasuryFee(uint256 _treasury_fee) external onlyTreasurer() {
        require(_treasury_fee >= 0, "Membership must be a non negative number");

        treasury_fee = _treasury_fee;
    }

    /**
    * @dev Sacrifices sender's only X invite and locks it away where anyone can use it and recycle it
    */
    function sacrificeSeedInvite() external seedInviteDoesNotExist() onlyWhenAllowed() {
        // Throw if the sender has already spent their invite
        require(IX(X_token_address).invitationSpent(msg.sender) == false, "You already spent your invite");

        // sender must have the minimal amount of $X
        require(X_token_contract.balanceOf(msg.sender) >= 1, "You need at least .01 $X");

        // store the invite holding address for use in join
        invite_holding_address = address(new InviteContract(address(X_token_contract)));

        // send .01 $X tokens to the contract created above
        X_token_contract.transferFrom(msg.sender, invite_holding_address, 1);

        seed_invite_sender = msg.sender;

        emit SacrifiedSeedInvite(msg.sender, invite_holding_address);
    }

    /**
    * @dev Anyone not yet invited to X can call this function, pay a small treasury fee, and then go out and buy X on various exchanges
    */
    function join() payable external seedInviteExists() onlyWhenAllowed() {
        // Throw if the msg.value paid to the treasury is incorrect
        require(treasury_fee == msg.value, "Incorrect treasury fee supplied");
        
        // Throw if the sender has already been invited into X
        require(IX(X_token_address).allowlist(msg.sender) == false, "You are already invited to X");

        // The holding contract sends the .01 $X to msg.sender, inviting msg.sender to X
        IInviteContract(invite_holding_address).redeem(msg.sender);

        // Store the invite holding address for use on next join
        invite_holding_address = address(new InviteContract(address(X_token_contract)));

        // send .01 $X tokens to the contract created above
        X_token_contract.transferFrom(msg.sender, invite_holding_address, 1);

        // send the treasury fee 
        (bool sent,) = treasury.call{ value: msg.value }("");
        require(sent, "Failed to send fees to the treasury");

        emit JoinedX(msg.sender, invite_holding_address, msg.value);
    }

    /**
    * @dev Getter to load address status in UI
    */
    function getInviteSpent(address _address) external view returns(bool) {
        return IX(X_token_address).allowlist(_address);
    }

    /**
    * @dev Getter to load address status in UI
    */
    function getAllowed(address _address) external view returns(bool) {
        return IX(X_token_address).invitationSpent(_address);
    }
}