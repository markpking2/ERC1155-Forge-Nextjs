//SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

interface IForgeToken {
    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external;

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external;

    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external;

    function balanceOf(address account, uint256 id) external returns (uint256);
}

contract Forge is IERC1155Receiver {
    address private _owner;
    IForgeToken public forgeToken;

    constructor(IForgeToken _forgeToken) {
        forgeToken = _forgeToken;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId;
    }

    function forge(uint256[] memory ids) external {
        uint256 length = ids.length;
        uint256[] memory frequencies = new uint256[](7);
        frequencies[0] = 0;
        frequencies[1] = 0;
        frequencies[2] = 0;
        frequencies[3] = 0;
        frequencies[4] = 0;
        frequencies[5] = 0;
        frequencies[6] = 0;

        require(
            length == 2 || length == 3,
            "2 or 3 tokens can be forged at a time"
        );
        uint256 i;
        for (i = 0; i < length; i++) {
            require(frequencies[ids[i]] <= 1, "token ids must be unique");
            frequencies[ids[i]]++;
        }
        if (length == 2) {
            if (frequencies[0] == 1 && frequencies[1] == 1) {
                forgeToken.mint(msg.sender, 3, 1);
            } else if (frequencies[1] == 1 && frequencies[2] == 1) {
                forgeToken.mint(msg.sender, 4, 1);
            } else if (frequencies[0] == 1 && frequencies[2] == 1) {
                forgeToken.mint(msg.sender, 5, 1);
            }
            uint256[] memory burnAmounts = new uint256[](2);
            burnAmounts[0] = 1;
            burnAmounts[1] = 1;
            forgeToken.burnBatch(msg.sender, ids, burnAmounts);
            return;
        } else if (
            frequencies[0] == 1 && frequencies[1] == 1 && frequencies[2] == 1
        ) {
            forgeToken.mint(msg.sender, 6, 1);
        }
        uint256[] memory burnAmounts = new uint256[](3);
        burnAmounts[0] = 1;
        burnAmounts[1] = 1;
        burnAmounts[2] = 1;
        forgeToken.burnBatch(msg.sender, ids, burnAmounts);
    }

    function trade(uint256 _toBurnId, uint256 _forId) external {
        require(_forId < 3, "can only trade for tokens 0, 1  and 2");
        require(_toBurnId != _forId, "cannot trade for the same token");
        forgeToken.burn(msg.sender, _toBurnId, 1);
        forgeToken.mint(msg.sender, _forId, 1);
    }

    fallback() external payable {}

    receive() external payable {}
}
