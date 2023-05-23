import { ethers } from "ethers";
import "./App.css";
import contractABI from "./contractABI.js";

const contractAddress = "0x98223247A13109f37C8118Ca669C18f41c89A8d8";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

function App() {
  return <div className="App"></div>;
}

export default App;
