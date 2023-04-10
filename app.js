const express = require("express");
const config = require("./config/config");
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const cloudinary = require("cloudinary").v2;
const app = express();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cloudinary configuration
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true
});

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

  // Generate QR code using QR.io API
  const qrCodeUrl = "https://api.qr.io/v1/create";
  const requestBody = {
    apikey: config.QRCODE_API_KEY, //this key requires an upgrade on qr.io to get hence it's missing here
    data,
    transparent: "on",
    frontcolor: "#000000",
    marker_out_color: "#000000",
    marker_in_color: "#000000",
    pattern: "default",
    marker: "default",
    marker_in: "default",
    optionlogo: "none",
  };
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  };

  fetch(qrCodeUrl, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }
      return response.arrayBuffer();
    })


    .then(async(arrayBuffer) => {
      // Upload QR code to Cloudinary using Node.js SDK
      const fileName = `${type}_${data.replace(
        /[^\w\s]/gi,
        ""
      )}_${file_extension}`

      const options = {
        public_id: fileName,
        resource_type: "image",
        overwrite: true
      };

      try {
        const result = await cloudinary.uploader.upload(Buffer.from(arrayBuffer), options);
        console.log(result)

        return res.json({
          url: result.secure_url,
          file_name: result.public_id,
        });
      } catch (error) {
        throw new Error("Failed to upload QR code to Cloudinary");
      }
    })

    // returns url link to client
    .then((result) => {
      const cloudinaryUrl = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/${result.public_id}.${file_extension}`;
      return res.json({ url: cloudinaryUrl, file_name: result.public_id });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Failed to upload QR code" });
    });
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
