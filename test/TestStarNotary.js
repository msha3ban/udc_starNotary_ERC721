const starNotary = artifacts.require("StarNotary");

let accounts;
let owner;
let instance;

contract('starNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

before(async () => {
    instance = await starNotary.deployed();
})

it('can create a star', async () => {
    let tokenId = 1;
    await instance.createStar('JOJO', tokenId, { from: accounts[0] });
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'JOJO');
});

it('let user1 put his star for sale', async () => {
    let starId = 2;
    let user1 = accounts[1];
    let starPrice = web3.utils.toWei('0.01', 'ether');
    await instance.createStar('Lolo', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
    let tokenId = 6;
    // 1. create a Star with different tokenId
    await instance.createStar('mmm', tokenId, { from: accounts[0] });
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name(), "StarNotary");
    assert.equal(await instance.symbol(), "STR");
});

it('lets 2 users exchange stars', async () => {
    // 1. create 2 Stars with different tokenId
    let tokenId1 = 9;
    let tokenId2 = 10;
    let user1 = accounts[0];
    let user2 = accounts[1];
    await instance.createStar('Star1', tokenId1, { from: user1 });
    await instance.createStar('Star2', tokenId2, { from: user2 });
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2);
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(tokenId1), user2);
    assert.equal(await instance.ownerOf.call(tokenId2), user1);
});

it('lets a user transfer a star', async () => {
    // 1. create a Star with different tokenId
    let tokenId = 5;
    let user1 = accounts[0];
    let user2 = accounts[1];
    await instance.createStar('Star1', tokenId, { from: user1 });
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, tokenId);
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(tokenId), user2);
});

it('lookUptokenIdToStarInfo test', async () => {
    // 1. create a Star with different tokenId
    let tokenId = 11;
    let user = accounts[0];
    await instance.createStar('Star1', tokenId, { from: user });
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(starName, "Star1");
});