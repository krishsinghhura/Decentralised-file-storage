import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import UploadToIPFS from "./Upload";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <UploadToIPFS />
    </>
  );
}

export default App;
