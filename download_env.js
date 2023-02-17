const fs = require('fs');
const path = require('path');

const evnDir = './services/env-files';
const homePath = process.cwd();
function findInDir(dir, filter, fileList = [], currentLevel = 0, maxLevel = 2) {
    if (currentLevel > maxLevel) {
        return;
    }

    if (!fs.existsSync(evnDir)) {
        fs.mkdirSync(evnDir);
    }
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStat = fs.lstatSync(filePath);
        if (fileStat.isDirectory()) {
            findInDir(filePath, filter, fileList, currentLevel + 1, maxLevel);
        } else if (filter.test(filePath)) {
            const envRestoreFrom = path.join(__dirname, filePath);
            const envRestoreTo = path.join(`${homePath}/${evnDir.replace('./', '')}/`, `.env-${dir.split('/')[1]}`).replace(/\s/g, "");
            fs.copyFile(envRestoreFrom, envRestoreTo, (err) => {
                if (err) throw err;
                console.log(`${dir} service env copied to ${envRestoreTo}`);
            });
            fileList.push(filePath);
        }
    });

    return fileList;
}

async function restoreInDir(dir) {

    fs.readdir(dir, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file, index) {
            // Do whatever you want to do with the file
            const envValue = file.split('-')[1];
            console.log(file);
            if (envValue) {
                const envRestoreFrom = path.join(`${homePath}/${evnDir.replace('./', '')}/`, `${file}`);
                const envRestoreTo = path.join(__dirname, 'services', envValue, '.env');
                fs.copyFile(envRestoreFrom, envRestoreTo, (err) => {
                    if (err) throw err;
                    console.log(`${envValue} service env copied to ${envRestoreTo}`);
                });

                if (index + 1 === files.length) {
                    fs.rmdir(evnDir, { recursive: true }, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log(`${evnDir} folder is deleted!`);
                    });
                }
            }
        });
    });
}

if (process.argv.includes('cp-env-download')) {
    findInDir('./', /\.env$/);
}
if (process.argv.includes('cp-env-restore')) {
    restoreInDir(evnDir);
}

