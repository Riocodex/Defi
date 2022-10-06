const { getNamedAccounts } = require("hardhat")
const { getWeth } = require("../scripts/getWeth")

async function main(){
    await getWeth()
    const { deployer } = await getNamedAccounts()
    
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
main()
    .then(() =>process.exit(0))
    .catch((error) =>{
        console.error(error)
        process.exit(1)
    })