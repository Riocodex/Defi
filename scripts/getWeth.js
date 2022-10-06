const { getNamedAccounts, ethers } = require("hardhat")
const AMOUNT = ethers.utils.parseEther("0.02")
async function getWeth(){
    const { deployer } = await getNamedAccounts()
    
    //first what we need to do here is according to the readme file is to deposit 
    //to do that we need the weth contract
    //to get the contract we need abi and contract address
    //abi is gotten from getting a weth contract which is similar to the erc20 contract
    //contract address is gotten from the official weth mainnet smartcontract
    //when both are gotten we proceed with...

    const iWeth = await ethers.getContractAt(
        "IWeth" , 
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" , 
        deployer
    )
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`);

}

module.exports = { getWeth  , AMOUNT}