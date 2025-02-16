import React, { useState } from "react";
import axios from "axios";

const UploadToIPFS = () => {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [storedCIDs, setStoredCIDs] = useState([]);

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  const USER_ADDRESS = import.meta.env.VITE_USER_WALLET;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload file to Pinata
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`, // Using environment variable
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      setCid(ipfsHash);
      setUrl(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

      // Send CID to backend for blockchain storage
      await axios.post("http://localhost:5000/storeCID", { cid: ipfsHash });

      alert("File uploaded and stored on blockchain successfully! ✅");
    } catch (error) {
      console.error("Error uploading file or storing CID:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCIDs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/getCIDs/${USER_ADDRESS}`
      );
      setStoredCIDs(response.data.cids);
    } catch (error) {
      console.error("Error fetching CIDs:", error);
      alert("Failed to fetch stored CIDs.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Upload File to IPFS</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="border border-gray-600 rounded p-2 w-full text-gray-300 bg-gray-700"
        />
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition duration-300"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {cid && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-sm">
            <h3 className="font-semibold text-green-400">
              File Uploaded Successfully! ✅
            </h3>
            <p>
              <strong>CID:</strong> {cid}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              View File on IPFS
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Stored CIDs</h2>
        <button
          onClick={fetchCIDs}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition duration-300"
        >
          Fetch CIDs
        </button>
        <ul className="mt-4 text-sm">
          {storedCIDs.map((cid, index) => (
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
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UploadToIPFS;
