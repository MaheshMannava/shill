import axios from 'axios';

// Pinata API configuration
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzYmM5ZmQxOC1lZjVmLTQxNjUtOGQ2Ni00YjNmYTk0NWUyMWQiLCJlbWFpbCI6Im1haGVzaG1hbm5hdmExNkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOTliMjA1NmMxMzZhMzBmNDhjNTgiLCJzY29wZWRLZXlTZWNyZXQiOiJmZTA5N2FkNDI4ODdkZDZlNjMwN2I1NGEzOGQ1NmM3OWExZmM5NmJlM2JlNDc4OWQxOTEwOTAwZTExNWIwMGM1IiwiZXhwIjoxNzczODQ1NTM0fQ.0jk0mwd91O5QN4-5RSnSr6hFoaGrl6ww5clSkyfcgMs";

/**
 * Upload a file to Pinata IPFS
 * @param file The file to upload
 * @returns The IPFS hash (CID) of the uploaded file
 */
export const uploadFileToPinata = async (file: File): Promise<string> => {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);

    // Set metadata for the file
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'CropCircle',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Set pinata options
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Return the IPFS hash (CID)
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Get the IPFS URL for a given hash
 * @param hash The IPFS hash (CID)
 * @returns The IPFS gateway URL
 */
export const getIpfsUrl = (hash: string): string => {
  if (!hash) return '';
  // Use a public IPFS gateway
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
