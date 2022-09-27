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
const BLOB_NAME = process.env.BLOB_NAME
if (!BLOB_NAME) {
  throw Error("BLOB NAME not found");
}
//initial the blob container object
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
const blockBlobClient = containerClient.getBlockBlobClient(BLOB_NAME);

//utility function
function send(data){
const uploadBlobResponse = await blockBlobClient.upload(data,data.length)l
console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse}`);
}
