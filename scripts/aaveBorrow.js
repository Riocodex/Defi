//for better understanding read the docs below
//https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider/ilendingpooladdressesprovider
//https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool

const { getNamedAccounts } = require("hardhat")
const { getWeth , AMOUNT} = require("../scripts/getWeth")

async function main(){
    await getWeth()
    const { deployer } = await getNamedAccounts()
    //now we need to start interacting with the aave protocol
    const lendingPool = await getLendingPool(deployer)
    console.log(`Lending Pool address ${lendingPool.address}`)
    
    //deposit! 
     const wethTokenAddress ="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    //approve
    await approveErc20(wethTokenAddress , lendingPool.address , AMOUNT , deployer)
    console.log("depositing..........")
    //now calling the deposit function with the parameters
    await lendingPool.deposit(wethTokenAddress , AMOUNT , deployer , 0)
    console.log("Deposited!!!")
  

    let { availableBorrowsETH , totalDebtETH } = await getBorrowUserData(
        lendingPool , deployer
    )
    
//you can only borrow in wei..so we get dai first..because with dai we can convert to wei 
//so we first created a function that checks eth to dai price
        //to get how much we want to borrow in eth and convert it to dai
    
    //borrow time!
    //here we need to know:
    // how much we borrowed, 
    //how much we have as collateral,
    //how much we can borrow 
    const daiPrice = await getDaiPrice()
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )
    await getBorrowUserData(lendingPool , deployer )

    
}

async function borrowDai(
    daiAddress ,
    lendingPool ,
    amountDaiToBorrow,
    account
){
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrow,
        1,
        0,
        account
    )
    await borrowTx.wait(1)
    console.log("Youve borrowed")
}
async function getDaiPrice(){
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    //the syntax above is to grab a specific index when a function 
    //seems to be returning more than one value
    console.log(`the DAI/ETH price is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool , account ){
    const { 
        totalCollateralETH , 
        totalDebtETH , 
        availableBorrowsETH 
    } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`) 
    return { availableBorrowsETH , totalDebtETH }
}


//now we need to start interacting with the aave protocol
    //lending pool address:0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
//so basically we got a smartcontract that reveals 
//the address of a lendingpool contract named ilendingpooladressessprovider
//then we compile and get the address of the contract 
//from the documentation https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider/ilendingpooladdressesprovider
//then we connect to it like we did below
async function getLendingPool(account){
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider" ,
         "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
         account
    )
    //to get address...in the contract there is a function(getLendingPool)which returns the contract adress of a lending pool contract
    const lendingPoolAddress =
         await lendingPoolAddressesProvider.getLendingPool()
//after getting the address of the lending pool we get the code from the documentation
//https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool
//and compile to get the abi and boom we are set
    const lendingPool =
         await ethers.getContractAt(
            "ILendingPool" , 
            lendingPoolAddress , 
            account
    )
    return lendingPool
}
async function approveErc20(
    erc20Address ,
     spenderAddress , 
     amountToSpend ,
      account
){
    const erc20Token = await ethers.getContractAt(
        "IERC20" , 
        erc20Address,
        account
    )
    const tx = await erc20Token.approve(spenderAddress , amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}
main()
    .then(() =>process.exit(0))
    .catch((error) =>{
        console.error(error)
        process.exit(1)
    })