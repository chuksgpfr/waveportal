import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("")
  const [waveCount, setWaveCount] = useState(0)
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  
  const contractAddress = "0x5eD0f7A83B59e0E0ce0814564b3207Cbd4FcF4aa";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    
    if(!ethereum){
      alert("You need to have metamask installed to use this website");
      return;
    } else {
      console.log("Yaahh !!! Welcome...", ethereum)
    }

    const accounts = await ethereum.request({ method: "eth_accounts"});
    
    if(accounts !== 0){
      setCurrentAccount(accounts[0]);
      await getAllWave();
    } else {
      console.log("No authorized account found.")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

       if (!ethereum) {
         alert("Get MetaMask!");
         return;
       }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" } );
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error.message);
    }
  }

  const waveContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signers = provider.getSigner();
    const waveContract = new ethers.Contract(contractAddress,contractABI, signers);
    return waveContract;
  }

  const wave = async () => {
    const { ethereum } = window;
    try {
      if(!ethereum){
        alert("No ethereum object found");
        return;
      }

      console.log(message)

      if(!message){
        alert("please add a message");
        return;
      }

      const waveTxn = await waveContract().wave(message);

      await waveTxn.wait();
      console.log("Waved ===> ",waveTxn.hash)

    } catch (error){
      console.log(error.message)
    }
      
  }

  const getAllWave = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum){
        alert("No ethereum object");
        return;
      }

      const waves = await waveContract().getWaves();

      console.log("Waving ", waves)
      const cleanWaves = [];
      waves.map(wave => {
        cleanWaves.push({
          address: wave.waver,
          message: wave.message,
          timestamp: new Date(wave.timestamp * 1000)
        })
      })

      console.log("All waves ", cleanWaves)

      setAllWaves(cleanWaves);
      
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleInput =(e) => {
    setMessage(e.target.value)
  }

  useEffect(() => {
    checkIfWalletIsConnected();

    const onNewWave = (from, timestamp, message) => {
      console.log("New wave ", from, timestamp, message);

      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp,
          message,
        }
      ])
    }

    waveContract().on("NewWave", onNewWave);

    return () => {
      waveContract().off("NewWave", onNewWave);
    }
    
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>
        <div className="bio">
        {waveCount} 👋 (waves)
        </div>

        <div className="bio">
        I am Khagan and I am transitioning into web3, if you'd want to hire me, Connect your Ethereum wallet and wave at me!
        </div>

        <br />
        <textarea placeholder="enter a message" onChange={handleInput} style={{ "boder-radius": 20, padding: 10 }}/>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {
          !currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            connect to wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
