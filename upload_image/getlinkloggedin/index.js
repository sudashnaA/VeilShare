const {
    StorageSharedKeyCredential,
    ContainerSASPermissions,
    generateBlobSASQueryParameters,
    getBlockBlobClient,
    BlobSASPermissions,
    BlobServiceClient,
    SASProtocol
} = require("@azure/storage-blob");

    module.exports = async function (context, req) {
    var blobName = context.bindingData.blob;
    var userid = context.bindingData.userid;
    var expiry = context.bindingData.expiry;

    const container = 'images';
    const sharedKeyCredential = new StorageSharedKeyCredential(process.env.STORAGE_ACCOUNT_NAME, process.env.STORAGE_ACCOUNT_KEY);
    const blobServiceClient = new BlobServiceClient(process.env.ContainerUrl, sharedKeyCredential);
    const containerClient = await blobServiceClient.getContainerClient(container);

    context.res = {
        body: getBlobSasUri(containerClient,blobName,sharedKeyCredential,null, userid, expiry)
    };
    context.done();
};

function getBlobSasUri(containerClient, blobName, sharedKeyCredential, storedPolicyName, userid, expiry) {
    const sasOptions = {
        containerName: containerClient.containerName,
        blobName: blobName
    };
    var expiryDate = new Date();
    let expiryInfo = expiry;
    if (expiry === 30){
        expiryDate.setMinutes(expiryDate.getMinutes() + expiry);
    }
    else{
        expiryDate.setHours(expiryDate.getHours() + expiry)
        expiryInfo = expiry * 60;
    }

    if (storedPolicyName == null) {
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = expiryDate;
        sasOptions.permissions = BlobSASPermissions.parse("r");
        sasOptions.protocol = SASProtocol.https;
    } else {
        sasOptions.identifier = storedPolicyName;
    }

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    console.log(`SAS token for blob is: ${sasToken}`);

    const link = `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`;

    const { CosmosClient } = require("@azure/cosmos");
    const client = new CosmosClient({endpoint: process.env.FUNCTION_URL, key: process.env.FUNCTION_KEY});
    database = client.database('users')
    container = database.container('uploads')

    const crypto = require("crypto");
    const id = crypto.randomBytes(16).toString("hex");

    const date = Date.now() / 1000;

    const item = {
       'id': id,
        'userid': userid,
        'key': link,
        'date': date,
        'expiry': expiryInfo
    };
    
    container.items.upsert(item);

    return link;
}