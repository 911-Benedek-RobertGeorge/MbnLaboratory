import { ethers } from "ethers";
import React, { useState } from "react";
import "./App.css";
import contractABI from "./contractABI.js";

// const contractAddress = "0x98223247A13109f37C8118Ca669C18f41c89A8d8";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
// const contract = new ethers.Contract(contractAddress, contractABI, signer);
let contractOwnerAddress = 0;
let signerAddress = 0;
let signerStaked = 0;
let signerReward = 0;
let ownerAuth = false;

async function getSignerAddress() {
  signerAddress = await signer.getAddress();
}

async function getContractOwnerAddress() {
  contractOwnerAddress = 0;
  // contractOwnerAddress = await contract.m_owner();
}

async function getSignerMoney() {
  // time in seconds
  signerStaked = 20;
  signerReward = 5;
}

async function stake() {
  return 0;
}

async function withdrawStake() {
  return 0;
}

async function claimRewards() {
  return 0;
}

function StakingContract(props) {
  return (
    <div className="stake-container">
      <div className="stake-text">
        <h3>Staked: {signerStaked}</h3>
        <h3>Rewards: {signerReward}</h3>
      </div>
      <div className="stake-buttons">
        <button className="btn primary-btn" onClick={() => stake()}>
          Stake
        </button>
        <button className="btn secondary-btn" onClick={() => withdrawStake()}>
          Withdraw stake
        </button>
        <button className="btn secondary-btn" onClick={() => claimRewards()}>
          Claim rewards
        </button>
      </div>
    </div>
  );
}

class App extends React.Component {
  componentDidMount() {
    // before we render we do this
    this.setState({ loading: true });
    getContractOwnerAddress().then(() => {
      getSignerAddress().then(() => {
        if (signerAddress == contractOwnerAddress) {
          ownerAuth = true;
        }
      });
    });
    getSignerMoney().then(() => {
      // while loading is true we won't render
      this.setState({ loading: false });
    });
  }
  render() {
    return (
      <div className="App">
        <div className="container">
          <h1 className="head-text">Stake!</h1>
          <StakingContract />
        </div>
      </div>
    );
  }
}

export default App;
