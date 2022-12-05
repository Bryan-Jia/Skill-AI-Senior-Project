const { BlobServiceClient } = require('@azure/storage-blob');
//init Azure Blob
//import environment needed for Azure Blob
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
const CONTAINER_NAME = process.env.CONTAINER_NAME;
if (!CONTAINER_NAME) {
  throw Error("CONTAINER NAME not found")
}

//initial the blob container object
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);


//utility function
async function sendFile(blobName, data) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  try {
    const uploadBlobResponse = await blockBlobClient.upload(JSON.stringify(data), JSON.stringify(data).length);
    console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse}`);
  } catch (err) {
    throw err;
  }
}

/**
 * 
 * @param {*} uid 
 * @returns a string containing all the previous experiment stored in the blob 
 */
async function getPrevRes(blobName){
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  return await streamToText(downloadBlockBlobResponse.readableStreamBody);
}

async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

exports.sendFile = sendFile;
exports.getPrevRes=getPrevRes;