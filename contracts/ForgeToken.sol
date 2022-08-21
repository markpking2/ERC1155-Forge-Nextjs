//SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ForgeToken is ERC1155 {
    address private immutable _owner;
    address public forgeAddress;
    mapping(address => mapping(uint256 => uint256)) private _lastMintTime;
    string public name = "Token Forge";

    constructor()
        ERC1155(
            "ipfs://QmdUJdKBNmBQzXk8JTPHQCAtwXLD3GepEkvyVEgFZBCoui/{id}.json"
        )
    {
        _owner = msg.sender;
    }

    function setForgeAddress(address _target) external {
        forgeAddress = _target;
    }

    function mint(uint256 id) external {
        require(id < 3, "forge tokens 0 - 2 to get tokens 3, 4, 5, and 6");
        require(
            _lastMintTime[msg.sender][id] == 0 ||
                block.timestamp - _lastMintTime[msg.sender][id] >= 1 minutes,
            "tokens 0 - 2 each have a 1 min mint cooldown"
        );
        _lastMintTime[msg.sender][id] = block.timestamp;
        _mint(msg.sender, id, 1, "");
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external {
        require(
            msg.sender == forgeAddress || msg.sender == _owner,
            "cannot mint"
        );
        require(id < 7, "only mint tokens 0 to 6");
        _mint(to, id, amount, "");
    }

    function burn(uint256 id, uint256 amount) external {
        _burn(msg.sender, id, amount);
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external {
        require(msg.sender == forgeAddress, "not forge contract");
        _burn(from, id, amount);
    }

    function burnBatch(
        address from,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external {
        require(msg.sender == forgeAddress, "not forge contract");
        _burnBatch(from, ids, amounts);
    }

    fallback() external payable {}

    receive() external payable {}
}
