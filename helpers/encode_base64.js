const fs = require("fs");

const keyFilePath = "./silab-de76e-firebase-adminsdk-v2n64-68b662b7d5.json";
const keyFile = fs.readFileSync(keyFilePath);

const base64Key = keyFile.toString("base64");
console.log(base64Key);
