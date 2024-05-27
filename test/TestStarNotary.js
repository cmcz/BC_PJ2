// import 'babel-polyfill';
const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    const gasPrice = web3.utils.toWei(".0001", "ether");

    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    await instance.approve(user2, starId, { from: user1, gasPrice: gasPrice }); // ERC721: Fix error: approve caller is not owner nor approved for all 
    // Moving Approve() before GetBalance(), removes the following errors:
    // Error: Returned error: VM Exception while processing transaction: Transaction's maxFeePerGas (0) is less than the block's baseFeePerGas (86510)
    // (vm hf=london -> block -> tx)

    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);

    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    const gasPrice = web3.utils.toWei(".0001", "ether");
    
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    await instance.approve(user2, starId, { from: user1, gasPrice: gasPrice }); // ERC721: Fix error: approve caller is not owner nor approved for all 
    // Moving Approve() before GetBalance(), removes the following errors:
    // Error: Returned error: VM Exception while processing transaction: Transaction's maxFeePerGas (0) is less than the block's baseFeePerGas (86510)
    // (vm hf=london -> block -> tx)

    let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);

    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    const gasPrice = web3.utils.toWei(".0001", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    await instance.approve(user2, starId, { from: user1, gasPrice: gasPrice });// ERC721: Fix error: approve caller is not owner nor approved for all 
    // Moving Approve() before GetBalance(), removes the following errors:
    // Error: Returned error: VM Exception while processing transaction: Transaction's maxFeePerGas (0) is less than the block's baseFeePerGas (86510)
    // (vm hf=london -> block -> tx)

    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);

    await instance.buyStar(starId, {from: user2, value: balance, gasPrice: gasPrice});


    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    // assert.equal(value, starPrice); // NEVER EQUAL BECAUSE OF THE GAS FEES, THAT CANNOT BE EQUAL TO ZERO

    assert(value > starPrice);

});

// Implement Task 2 Add supporting unit tests
it('can add the star name and star symbol properly', async() => {
   // 1. create a Star with different tokenId
   let tokenId = 999;
   let instance = await StarNotary.deployed();
   await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});

   //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
   assert.equal(await instance.name(), 'Starry Coin');
   assert.equal(await instance.symbol(), 'STR');

});


it('lets 2 users exchange stars', async() => {
   // 1. create 2 Stars with different tokenId
   let token1Id = 1001;
   let token2Id = 1002;
   let instance = await StarNotary.deployed();
   const gasPrice = web3.utils.toWei(".0001", "ether");

   await instance.createStar('Awesome Star 1001!', token1Id, {from: accounts[1]});
   await instance.createStar('Awesome Star 1002!', token2Id, {from: accounts[2]});

   // 2. Call the exchangeStars functions implemented in the Smart Contract
   await instance.approve(accounts[2], token1Id, { from: accounts[1], gasPrice: gasPrice });// ERC721: Fix error: transfer caller is not owner nor approved 
   await instance.exchangeStars(token1Id, token2Id, {from: accounts[2]});

   // 3. Verify that the owners changed
   assert.equal(await instance.ownerOf.call(token1Id), accounts[2]);
   assert.equal(await instance.ownerOf.call(token2Id), accounts[1]);


});


it('lets a user transfer a star', async() => {
   // 1. create a Star with different tokenId
   let tokenId = 10;
   let instance = await StarNotary.deployed();
   await instance.createStar('Awesome Star 10!', tokenId, {from: accounts[1]});

   // 2. use the transferStar function implemented in the Smart Contract
   await instance.transferStar(accounts[2], tokenId, {from: accounts[1]});

   // 3. Verify the star owner changed.
   assert.equal(await instance.ownerOf.call(tokenId), accounts[2]);

});


it('lookUptokenIdToStarInfo test', async() => {
   // 1. create a Star with different tokenId
   let tokenId = 55;
   let instance = await StarNotary.deployed();
   await instance.createStar('Awesome Star 55!', tokenId, {from: accounts[1]});

   // 2. Call your method lookUptokenIdToStarInfo
   let currStarName = await instance.lookUptokenIdToStarInfo(tokenId);

   // 3. Verify if you Star name is the same
   assert.equal(currStarName, 'Awesome Star 55!');
});
