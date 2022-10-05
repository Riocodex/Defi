const { getNamedAccounts } = require("hardhat")
const { getWeth } = require("../scripts/getWeth")

async function main(){
    await getWeth()
    const { deployer } = await getNamedAccounts()
    //now we need to start interacting with the aave protocol
    //lending pool address:0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
}

main()
    .then(() =>process.exit(0))
    .catch((error) =>{
        console.error(error)
        process.exit(1)
    })