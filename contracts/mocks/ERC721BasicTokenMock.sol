pragma solidity ^0.4.18;

import "../token/ERC721/ERC721BasicToken.sol";

/**
 * @title ERC721BasicTokenMock
 * This mock just provides a public mint and burn functions for testing purposes
 */
contract ERC721BasicTokenMock is ERC721BasicToken {
  function mint(address _to, uint256 _tokenId) public {
    super.doMint(_to, _tokenId);
  }

  function burn(uint256 _tokenId) public {
    super.doBurn(_tokenId);
  }
}
