import { ethers } from "ethers";
import "./App.css";
import contractABI from "./contractABI.js";

const contractAddress = "a";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

function App() {
  return <div className="App"></div>;
}

export default App;
