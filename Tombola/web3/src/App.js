import "./App.css";
import ConnectButton from "./components/connectWallet";
import BuyTicket from "./components/buyTicket";
import React, { useState } from "react";

function App() {
	const [isRunning, setIsRunning] = useState(true);

	return (
		<div className="App">
			<ConnectButton />
			<div>{isRunning && <BuyTicket />}</div>
		</div>
	);
}

export default App;
