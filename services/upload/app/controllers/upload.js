const { BlobServiceClient } = require('@azure/storage-blob');
const { uuidv4, path, fs, sharp } = require('../services/imports');
const config = require('../config/config');
const responseMessages = require('../middleware/response-messages');

const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureConnectionString);

const createBlob = async (files, containerName, filename) => {
  try {
    const file = files;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'container' });
    const extension = path.extname(file.name);
    let blobName = `${uuidv4()}${extension}`;
    if (filename) {
      blobName = file.name;
    }
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.uploadFile(file.path);
    uploadBlobResponse.blobURL = `https://${config.azureAccountName}.blob.core.windows.net/${containerName}/${blobName}`;
    return uploadBlobResponse;
  } catch (error) {
    return Promise.reject(error);
  }
};
const createBlobFolder = async (fileinfo, containerName) => {
  try {
    return new Promise((resolve, reject) =>
      fs.readFile(fileinfo, async (err, files) => {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists({ access: 'container' });
        const extension = path.parse(fileinfo).ext;
        const blobName = `${uuidv4()}${extension}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.uploadFile(fileinfo);
        uploadBlobResponse.blobURL = `https://${config.azureAccountName}.blob.core.windows.net/${containerName}/${blobName}`;
        console.log('uploadBlobResponse', uploadBlobResponse);
        resolve(uploadBlobResponse.blobURL);
      })
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteBlob = async (blobName, containerName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const deleteBlobResponse = await blockBlobClient.delete();
    return deleteBlobResponse;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  uploadFile: async (ctx) => {
    try {
      if (!ctx.request.files || (ctx.request.files && !ctx.request.files.file)) {
        return ctx.res.unprocessableEntity({ error: responseMessages[1001] });
      }

      const filename = uuidv4();

      const responseImages = {
        xs: `https://${config.azureAccountName}.blob.core.windows.net/${config.imageContainerName}/${filename}-xs.webp`,
        md: `https://${config.azureAccountName}.blob.core.windows.net/${config.imageContainerName}/${filename}-md.webp`,
        xl: '',
      };

      const dir = `./files/${uuidv4()}`.trim();
      if (ctx.request.body.type && ctx.request.body.type === 'image') {
        // Check files directory is created
        const filesdir = './files';

        if (!fs.existsSync(filesdir)) {
          fs.mkdirSync(filesdir);
        }

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await sharp(ctx.request.files.file.path)
          .webp()
          .resize(48, 48)
          .toFile(`${dir}/${filename}-xs.webp`, async (err, info) => {
            // console.log('', err, info);
            await createBlob(
              { name: `${filename}-xs.webp`, path: `${dir}/${filename}-xs.webp` },
              config.imageContainerName,
              true
            );
          });

        await sharp(ctx.request.files.file.path)
          .webp()
          .resize(128, 128)
          .toFile(`${dir}/${filename}-md.webp`, async (err, info) => {
            // console.log('', err, info);
            await createBlob(
              { name: `${filename}-md.webp`, path: `${dir}/${filename}-md.webp` },
              config.imageContainerName,
              true
            );
          });

        const blobResult = await createBlob(ctx.request.files.file, config.imageContainerName);
        responseImages.xl = blobResult.blobURL;

        const result = {
          filename: path.basename(blobResult.blobURL),
          path: blobResult.blobURL,
        };
        // fs.rmSync(dir, { recursive: true, force: true });
        result.responseImages = responseImages;

        return ctx.res.ok({
          result,
        });
      }

      const blobResult = await createBlob(ctx.request.files.file, config.imageContainerName);

      const result = {
        filename: path.basename(blobResult.blobURL),
        path: blobResult.blobURL,
      };

      return ctx.res.ok({
        result,
      });
    } catch (error) {
      console.log('\n Error in Image upload..', error);
      return ctx.res.internalServerError({ error });
    }
  },
  deleteFile: async (ctx) => {
    try {
      if (!ctx.request.query.fileName) {
        return ctx.res.unprocessableEntity({ error: responseMessages[1002] });
      }
      await deleteBlob(ctx.request.query.fileName, config.imageContainerName);
      return ctx.res.ok({
        result: 'Ok',
      });
    } catch (error) {
      console.log('\n Error in Image upload..', error);
      return ctx.res.internalServerError({ error });
    }
  },
};
