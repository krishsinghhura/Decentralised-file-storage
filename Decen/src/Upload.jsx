import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

const UploadToIPFS = () => {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [cid, setCid] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [storedCIDs, setStoredCIDs] = useState([]);
  const [account, setAccount] = useState(null);

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const AVALANCHE_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

  const ABI = [
    {
      inputs: [{ internalType: "string", name: "_cid", type: "string" }],
      name: "storeCID",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "getCIDs",
      outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  // 🔹 Connect MetaMask Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // 🔹 Upload File to IPFS & Store CID on Avalanche
  // 🔹 Upload File to IPFS and Store CID on Avalanche Fuji C-Chain
  const handleUpload = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!fileName || !fileContent) {
      alert("Please enter a file name and content!");
      return;
    }

    setLoading(true);

    try {
      let provider = new ethers.BrowserProvider(window.ethereum);
      let { chainId } = await provider.getNetwork();

      // 🔹 1️⃣ If not on Avalanche Fuji, switch networks
      if (chainId !== 43113) {
        // 43113 is the Chain ID for Avalanche Fuji
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa869" }], // 0xa869 is 43113 in hex
        });

        // 🔹 2️⃣ Refresh Provider & Signer after switching
        provider = new ethers.BrowserProvider(window.ethereum);
      }

      // 🔹 3️⃣ Upload file to Pinata
      const blob = new Blob([fileContent], { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", blob, `${fileName}.txt`);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      setCid(ipfsHash);
      setUrl(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

      // 🔹 4️⃣ Refresh Signer After Network Change
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.storeCID(ipfsHash);
      await tx.wait();

      alert("File uploaded and stored on Avalanche Fuji successfully! ✅");
    } catch (error) {
      console.error("Error uploading file or storing CID:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch Stored CIDs
  const fetchCIDs = async () => {
    try {
      if (!account) {
        alert("Please connect your wallet first!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const cids = await contract.getCIDs(account);
      setStoredCIDs(cids);
    } catch (error) {
      console.error("Error fetching CIDs:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Upload to IPFS</h2>
        {!account ? (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-yellow-500 rounded-lg"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="text-green-400">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}

        <input
          type="text"
          placeholder="File name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="border border-gray-600 rounded p-2 w-full text-gray-300 bg-gray-700 mt-4"
        />
        <textarea
          placeholder="File content"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          rows="5"
          className="border border-gray-600 rounded p-2 w-full text-gray-300 bg-gray-700 mt-2"
        ></textarea>
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {cid && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-sm">
            <h3 className="font-semibold text-green-400">File Uploaded ✅</h3>
            <p>
              <strong>CID:</strong> {cid}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              View on IPFS
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Stored CIDs</h2>
        <button
          onClick={fetchCIDs}
          className="px-6 py-2 bg-green-600 rounded-lg"
        >
          Fetch CIDs
        </button>
        <ul className="mt-4 text-sm">
          {storedCIDs.length === 0 ? (
            <p className="text-gray-400">No stored CIDs yet.</p>
          ) : (
            storedCIDs.map((cid, index) => (
              <li key={index} className="mt-2">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {cid}
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default UploadToIPFS;
