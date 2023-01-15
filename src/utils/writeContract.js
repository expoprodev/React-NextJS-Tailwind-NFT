const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const writeContract = async(id, name , symbol, asciiMark, options) => {
    const bondlyAddress = options?.bondlyAddress || '0x1b04023a95188F60B58CDDe9B26C9e10DB0DCb70'
    const template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;  
${    
asciiMark.length > 0 ? 
`
/*
${asciiMark}
*/
`
: ''
}   
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ${name.split(' ').join('')} is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ERC721Burnable {
    using Strings for uint256;

    string public baseURI = "${options?.baseUri || ""}";
    string public notRevealedUri = "${options?.notRevealUri || ""}";
    string public baseExtension = ".json";

    uint256 public cost = ${options?.mintCost || "0.05"} ether;
    uint256 public deploymentCost = ${options?.deploymentCost || "0.05"} ether;
    uint256 public maxSupply = ${options?.maxSupply || "10000"};
    uint256 public maxMintAmount = ${options?.maxMintAmount || "10"};
    bool public revealed = ${options?.revealed == false ? "false" : "true"};
    address[] public whitelistedAddresses;

    enum SalePhase {
		Locked,
		PreSale,
		PublicSale
	}

    SalePhase public phase = SalePhase.Locked;

    //TODO: replace with actual address that will receive comission
    address constant private bondlyAddress = ${bondlyAddress};
    uint256 private commission = 5;

    event Minted(address minter, uint256[] ids);
    event Airdrop(uint256[] ids);

    constructor() ERC721("${name}", "${symbol.replace(' ', '')}") payable {
        require(msg.value >= deploymentCost, "Not enough deployment value!");
        (bool success, ) = payable(bondlyAddress).call{value: msg.value}("");
        require(success);
        _transferOwnership(msg.sender);            
    }

    // minting presale and public sale
    function mint(uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        require(phase != SalePhase.Locked, "Public sale is not active!");
        require(_mintAmount > 0, "Mint amount must be greater than zero!");       
        require(supply + _mintAmount <= maxSupply, "Not enough supply!");

        if (msg.sender != owner()) {           
            require(balanceOf(msg.sender) + _mintAmount <= maxMintAmount, "Max mint per address exceeded!");
            require(msg.value >= cost * _mintAmount);  
            if (phase == SalePhase.PreSale) {
                require(isWhitelisted(msg.sender), "Address is not whitelisted!");
            }
        }
        
        uint256[] memory tokenIds = new uint256[](_mintAmount);
        for (uint256 i = 1; i <= _mintAmount; i++) {            
             uint256 tokenId = supply + i;
            _safeMint(msg.sender, tokenId);
            tokenIds[i-1] = tokenId;
        }
        emit Minted(msg.sender, tokenIds);
    }

    //airdrop
    function airdrop(address[] calldata receiver) public onlyOwner {   
        uint256 supply = totalSupply();
        uint256 _mintAmount = receiver.length;
        require(_mintAmount > 0, "Mint amount must be greater than zero!");
        require(supply + _mintAmount <= maxSupply, "Not enough supply!");
    
        uint256[] memory tokenIds = new uint256[](_mintAmount);
        for(uint256 i = 1; i <= receiver.length; i++) {       
            uint256 tokenId = supply + i;
            _safeMint(receiver[i-1], tokenId);
            tokenIds[i-1] = tokenId;
        }

        emit Airdrop(tokenIds);
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
        tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

     function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        require(_exists(tokenId), "TokenID does not exists!");
        if(revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension)) : super.tokenURI(tokenId);
    }

    //only owner
    function reveal() public onlyOwner {
        revealed = true;
    }
        

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }
   
    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function lock() public onlyOwner {
        phase = SalePhase.Locked;
    }
    
    function activatePresale() public onlyOwner {
        phase = SalePhase.PreSale;
    }

    function activatePublicSale() public onlyOwner {
        phase = SalePhase.PublicSale;
    }

    function setWhitelist(address[] calldata _addressArray) public onlyOwner {
        delete whitelistedAddresses;
        whitelistedAddresses = _addressArray;
    }

    function isWhitelisted(address _user) public view returns (bool) {
        for (uint i = 0; i < whitelistedAddresses.length; i++) {
            if (whitelistedAddresses[i] == _user) return true;
        }
        return false;
    }

    function setTokenUri(uint256 tokenId, string memory tokenMetaData) public onlyOwner {
        require(_exists(tokenId), "TokenID does not exists!");
        _setTokenURI(tokenId, tokenMetaData);  
    }
   
    function withdraw() public payable onlyOwner {        
        (bool hs, ) = payable(bondlyAddress).call{value: address(this).balance * commission / 100}("");
        require(hs);
       
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    //override functions
    /** OVERRIDES */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
    `

    const buildPath = path.resolve(process.env.PROJECT_ROOT + '/contracts/' + id);
    fs.ensureDirSync(buildPath);

    await fs.outputFile(
       path.resolve(buildPath, name.split(' ').join('') + '.sol'), 
       template
    )

}

export {
    writeContract
}
