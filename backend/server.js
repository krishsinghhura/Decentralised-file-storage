require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Avalanche Fuji Configuration
const provider = new ethers.JsonRpcProvider(
  "https://api.avax-test.network/ext/bc/C/rpc"
);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI of the Smart Contract
const abi = [
  "function storeCID(string memory _cid) public",
  "function getCIDs(address user) public view returns (string[] memory)",
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

// 🔹 Store CID on Blockchain
app.post("/storeCID", async (req, res) => {
  try {
    const { cid } = req.body;
    if (!cid) return res.status(400).json({ error: "CID is required" });

    const tx = await contract.storeCID(cid);
    await tx.wait();

    res.json({
      success: true,
      message: "CID stored on blockchain",
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error storing CID:", error);
    res.status(500).json({ error: "Failed to store CID" });
  }
});

// 🔹 Fetch CIDs from Blockchain
app.get("/getCIDs/:user", async (req, res) => {
  try {
    const user = req.params.user;
    const cids = await contract.getCIDs(user);
    res.json({ success: true, cids });
  } catch (error) {
    console.error("Error fetching CIDs:", error);
    res.status(500).json({ error: "Failed to fetch CIDs" });
  }
});

// 🔹 Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
