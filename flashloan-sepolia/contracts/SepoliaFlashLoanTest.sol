// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

interface IPool {
    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IFlashLoanSimpleReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

contract SepoliaFlashLoanTest is IFlashLoanSimpleReceiver {
    address public immutable ADDRESSES_PROVIDER;
    address public immutable POOL;
    address public immutable OWNER;

    error OnlyOwner();
    error OnlyPool();
    error InvalidInitiator();
    error TransferApprovalFailed();

    constructor(address addressesProvider) {
        ADDRESSES_PROVIDER = addressesProvider;
        POOL = IPoolAddressesProvider(addressesProvider).getPool();
        OWNER = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != OWNER) revert OnlyOwner();
        _;
    }

    function requestFlashLoan(address asset, uint256 amount) external onlyOwner {
        IPool(POOL).flashLoanSimple(address(this), asset, amount, "", 0);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata
    ) external returns (bool) {
        if (msg.sender != POOL) revert OnlyPool();
        if (initiator != address(this)) revert InvalidInitiator();

        uint256 amountOwed = amount + premium;
        if (!IERC20(asset).approve(POOL, amountOwed)) {
            revert TransferApprovalFailed();
        }

        return true;
    }
}
