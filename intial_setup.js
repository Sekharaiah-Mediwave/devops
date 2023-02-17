const path = require("path");
const fs = require("fs");
const cp = require("child_process");
var os = require("os");

// Configuration details on belw block
// specify the root directory of the micro services 
const directoryPath = path.join(__dirname, "./services");
const envSample = ".env.sample";

let copyEnv = false;
if(process.argv.includes('cp-env')){
  copyEnv = true;
}

// passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
  //handling error
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  //listing all folders using forEach
  files.forEach(function (file) {
    // Do whatever you want to do with the folder
    // Setting folder path
    let folderPath = `${directoryPath}/${file}/`;
    try {
      // if (fs.existsSync(`${folderPath}`)) {
      //   //file exists copy
      //   fs.copyFile(`${folderPath}${envSample}`, `${folderPath}.env`, (err) => {
      //     if (err) throw err;
      //     console.log(`${file} .env copied successfully`);
      //   });
      // }

      // if(copyEnv){
      //   return;
      // }

      if (!fs.existsSync(`${folderPath}package.json`)) return;

      // npm binary based on OS
      var npmCmd = os.platform().startsWith("win") ? "npm.cmd" : "npm";

      // install folder
      cp.spawn(npmCmd, ["i"], {
        env: process.env,
        cwd: folderPath,
        stdio: "inherit",
      }).on("exit", function (code, signal) {
        if (file === "database") {
          cp.spawn(`npx`, ["sequelize-cli", "db:migrate"], {
            env: process.env,
            cwd: `${folderPath}/app/`,
            stdio: "inherit",
          }).on("exit", function (code, signal) {
            cp.spawn(`npx`, ["sequelize-cli", "db:seed:all"], {
              env: process.env,
              cwd: `${folderPath}/app/`,
              stdio: "inherit",
            });
          });
        }
      });
    } catch (err) {
      console.error(err);
    }
  });
});
