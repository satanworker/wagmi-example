import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useWeb3Store } from "./store";

function App() {
  const [count, setCount] = useState(0);

  const account = useWeb3Store((state) => state.account);
  const chain = useWeb3Store((state) => state.activeChain);

  const connect = useWeb3Store((state) => state.connect);
  const disconnect = useWeb3Store((state) => state.disconnect);
  const switchChain = useWeb3Store((state) => state.switchChain);
  const increment = useWeb3Store((state) => state.increment);
  const incrementEnso = useWeb3Store((state) => state.incrementEnso);

  const getCounterNumber = useWeb3Store((state) => state.getCurrentNumber);
  const counterNumber = useWeb3Store((state) => state.counterNumber);
  const counterLoading = useWeb3Store((state) => state.loading);

  useEffect(() => {
    getCounterNumber();
  }, []);

  return (
    <div className="App">
      <div>
        Counter {counterLoading ? "loading" : counterNumber?.toString()}
      </div>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={increment}>Increment</button>
        <button onClick={incrementEnso}>Increment enso</button>
        <p>Connected account {account?.address}</p>
        <p>Active chain {chain?.id}</p>
        <button onClick={connect}>Connect</button>
        <button onClick={disconnect}>Disconnect</button>
        <button onClick={switchChain}>SwitchChain</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
