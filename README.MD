# UploadToIPFS

## Overview

UploadToIPFS is a React-based decentralized application that allows users to upload files to IPFS via Pinata and store their corresponding CIDs on the Avalanche Fuji C-Chain using a smart contract.

## Features

- Connect to MetaMask
- Upload files to IPFS
- Store the file CID on Avalanche Fuji
- Fetch and display stored CIDs

## Technologies Used

- React.js
- Ethers.js
- Pinata API
- Avalanche Fuji Testnet
- Solidity (for smart contract interactions)

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/your-repo/UploadToIPFS.git
cd UploadToIPFS
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```sh
VITE_PINATA_JWT=your_pinata_jwt
VITE_CONTRACT_ADDRESS=your_smart_contract_address
VITE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_PRIVATE_KEY=your_private_key
```

### 4. Run the Application

```sh
npm run dev
```

## Usage

1. **Connect MetaMask**: Click "Connect Wallet" to link your MetaMask wallet.
2. **Upload File**: Enter the file name and content, then click "Upload".
3. **View Stored CIDs**: Click "Fetch CIDs" to retrieve your previously stored CIDs.

## Smart Contract Functions

The contract supports:

- `storeCID(string _cid)`: Stores a file CID on the blockchain.
- `getCIDs(address user)`: Retrieves all stored CIDs for a given user.

## Troubleshooting

### Network Error: "network changed: 11155111 => 43113"

- Ensure your MetaMask is set to **Avalanche Fuji Testnet** (Chain ID: 43113).
- If not, MetaMask should prompt you to switch networks automatically.

### Upload Failure

- Check the **Pinata API Key** in the `.env` file.
- Ensure the contract is deployed on **Avalanche Fuji Testnet**.
- Verify that the correct **RPC URL** is provided.

## License

This project is licensed under the MIT License.

## Author

Developed by [Your Name]
