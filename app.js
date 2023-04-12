const express = require("express");
const config = require("./config/config");
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit')
const fs = require('fs');
const helmet = require('helmet')
const cloudinary = require("cloudinary").v2;
const app = express();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cloudinary configuration
cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET
})

// rate limiter
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
// Apply the rate limiting middleware to all requests
app.use(limiter)

// security middleware
app.use(helmet())


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

// QR code using QR Server API
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=300x300`;
const fileName = `${type}_${data}_${file_extension}`

// uploading to cloudinary
    const options = {
      public_id: fileName,
      resource_type: "image",
      overwrite: true
    };

  cloudinary.uploader.upload(qrCodeUrl, options)
  .then(result => {
    const cloudinaryUrl = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/${result.public_id}.${file_extension}`;
    return res.json({ url: cloudinaryUrl, file_name: result.public_id });
  })
  .catch(error => {
    console.log(error);
    throw new Error("Failed to upload QR code to Cloudinary");
  });
})

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
