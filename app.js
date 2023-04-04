const express = require("express");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const config = require("./config/config");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
const app = express();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cloudinary configuration
cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET,
});

// endpoint to generate and upload QR code
app.post("/qrcode", (req, res) => {
  const { type, data, file_extension } = req.body;

  // Validate the input data
  if (type !== "url" && type !== "text") {
    return res.status(400).json({ message: "Invalid type" });
  }

  if (type === "url" && !isValidUrl(data)) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  if (!file_extension) {
    return res.status(400).json({ message: "Missing file extension" });
  }

  // Generate QR code using QR.io API
const qrCodeUrl = "https://api.qr.io/v1/create";
const requestBody = {
  apikey: config.API_KEY,
  data,
  transparent: "on",
  frontcolor: "#000000",
  marker_out_color: "#000000",
  marker_in_color: "#000000",
  pattern: "default",
  marker: "default",
  marker_in: "default",
  optionlogo: "none"
};
const requestOptions = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody)
};

fetch(qrCodeUrl, requestOptions)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to generate QR code");
    }
    return response.arrayBuffer();
  })
    .then(() => {
        // Add success message
        return res.json({ message: "QR code generated successfully" });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Failed to generate QR code" });
      })
    // .then(() => {
    //   // Upload QR code to Cloudinary using Golang SDK
    //   const fileName = `${type}_${data.replace(
    //     /[^\w\s]/gi,
    //     ""
    //   )}_${file_extension}`;
    //   return exec(
    //     `cloudinary-go upload --public-id ${fileName} --resource-type image ${fileName}`,
    //     { cwd: "./" }
    //   );
    // })
    // // returns url link to client
    // .then((fileName) => {
    //   const cloudinaryUrl = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/${fileName}`;
    //   return res.json({ url: cloudinaryUrl, file_name: fileName });
    // })
    // .catch((err) => {
    //   console.log(err);
    //   return res
    //     .status(500)
    //     .json({ message: "Failed to upload QR code" });
    // });
});

// function to validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}...`);
});
