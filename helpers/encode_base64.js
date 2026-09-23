const fs = require("fs");

// Read the JSON key file
const keyFilePath = "./silab-de76e-firebase-adminsdk-v2n64-68b662b7d5.json";
const keyFile = fs.readFileSync(keyFilePath);

// Encode the file contents to Base64
const base64Key = keyFile.toString("base64");
console.log(base64Key);
