import './styles/App.css';
import React,{useEffect,useState} from "react";
import {ethers,utils} from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';


// Constants
//const TWITTER_HANDLE = '_buildspace';
//const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
//const OPENSEA_LINK = '';
//const TOTAL_MINT_COUNT = 50;

//从url参数中获取合约地址
const queryset = window.location.search;
const params = new URLSearchParams(queryset);
const CONTRACT_ADDRESS = params.get('contract');
const nft_id = params.get('nft_id');
const toChainName = params.get('c_name');
const toChainId = parseInt(params.get('c_id'));
console.log("CONTRACT to be minted is:",CONTRACT_ADDRESS);

const App = () => {  
  //Just a state variable we use to store our user's public walllet.Don't forget to import useState.
  const [currentAccount,setCurrentAccount] = useState("");
  
  
  // Gotta make sure this is async.
  const checkIfWalletIsConnected = async() => {
      //First make sure we have access to window.ethereum
      const {ethereum} = window;

      if(!ethereum){
          console.log('Make sure you have metamask');
          return;
          }else{
              console.log('We have the ethereum object',ethereum);
              }

          //Check if we're authorized to access the user's wallet
          const accounts = await ethereum.request({method:'eth_accounts'});

          //User can have multiple authorized accounts,we grab the first one if its there!
          if(accounts.length !== 0){
              const account = accounts[0];
              console.log("Found an authorized account:",account);
              setCurrentAccount(account);
              //Setup listener! This is for the case where a user comes to our site
              // and AlREADY had their wallet connected+authorized.
              setupEventListener()
              }else{
                  console.log("No authorized account found");
                  }
      }
  
  
  // Implement your connectWallet method here
  const connectWallet  = async () => {
      try{
          const {ethereum} = window;
          if(!ethereum){
              alert("Get MetaMask!");
              return;
              }
          // Fancy method to request access to account.
          const accounts = await ethereum.request({method:"eth_requestAccounts"});
          //This should print out public address once we authorize MetaMask.
          console.log("Connected:",accounts[0]);
          setCurrentAccount(accounts[0]);

          //Setup listener! This is for the case where a user comes to our site and connected their wallet for the first time.
          setupEventListener()
          }catch(err){
              console.log(err);
              }
      }

  
  //Setup our listener.
  const setupEventListener = async () => {
      // Most of this looks the same as our function askContractToMintNft
      try{
          const {ethereum} = window;

          if(ethereum){
              //Same stuff again
              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const connectedContract = new ethers.Contract(CONTRACT_ADDRESS,myEpicNft.abi,signer);

              //THIS IS THE MAGIC SAUSE.
              //This will essentially 'capture' our event when our contract throws it.
              //If you're familiar with webhooks,it's very similar to that!
              connectedContract.on("NewEpicNFTMinted",(from,tokenId) => {
                  console.log(from,tokenId.toNumber())
                  alert(`恭喜! SBF已成功被Mint到你的钱包，约10多分钟后会展示在Opensea中。每人仅限领取1枚SBF。`)
              });

                  console.log("Setup event listener!")
                  
                  }else{
                      console.log("Ethereum object dosen't exist!");
                      }
                   }catch (error){
                       console.log(error)
                       }
          }


  const askContractToMintNft = async () => {
      try {
          const {ethereum} = window;
          if (ethereum){

              //Check if Network is correct
              let chainId = await ethereum.request({method:'eth_chainId'});
              console.log("Connected to chain"+chainId);
              //String,hex code of the chainId of the connected network
              const chainToConnect = utils.hexValue(toChainId);
              if(chainId !== chainToConnect) {
                      alert("需切换到"+toChainName+"网络进行操作。");
                  }else{

              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const connectedContract = new ethers.Contract(CONTRACT_ADDRESS,myEpicNft,signer);
              console.log("Going to pop wallet now to gas...")
              try {
                  let nftTxn = await connectedContract.mint(nft_id);
                  console.log("Mining...please wait.")
                  await nftTxn.wait();
                  console.log('Minted!');
                  }catch(err){
                      console.log(err);
                      alert('你应该已拥有一枚，请查看钱包。如果没有，请稍等后再重新Mint:)');}
              let nftTxn = await connectedContract.mint(nft_id);
              
              console.log("Mining...please wait.")
              await nftTxn.wait();
              console.log('Minted!');
              }
              }else{
                  console.log("Ethereum object doesn't exist!");
                  }
          }catch (err){
              console.log(err)
              }
      }
  
  
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
    Mint NFT
    </button>
  )

  //This runs our function when the page loads.
  useEffect(() => {
      checkIfWalletIsConnected();
      },[])


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {currentAccount === "" ? renderNotConnectedContainer():renderMintUI()} 
        </div>
      </div>
    </div>
  );
};

export default App;
