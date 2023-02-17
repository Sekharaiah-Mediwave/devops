/* eslint-disable no-undef */
const fileStoragePath = process.env.FILE_STORAGE_PATH
  ? process.env.FILE_STORAGE_PATH + (process.env.FILE_STORAGE_PATH.endsWith('/') ? '' : '/')
  : 'uploads/';

const envConfigs = {
  port: process.env.PORT,
  host: process.env.HOST,
  fileStoragePath,
  imageContainerName: process.env.IMAGE_CONTAINER_NAME,
  azureAccountName: process.env.AZURE_ACCOUNT_NAME,
  azureConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
};

// function checkEndStringAndRemove(stringToCheck = '', endStringToValidate = '') {
//     if (stringToCheck.endsWith(endStringToValidate)) {
//         return stringToCheck.slice(0, (stringToCheck.length - endStringToValidate.length));
//     }
//     return stringToCheck;
// }

// function checkEndStringAndAppend(stringToCheck = '', endStringToValidate = '') {
//     if (stringToCheck.endsWith(endStringToValidate)) {
//         return stringToCheck;
//     }
//     return (`${stringToCheck}${endStringToValidate}`)
// }

module.exports = { ...envConfigs };
