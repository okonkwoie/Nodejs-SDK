  // Generate the QR code using QR.io API
  const qrCodeUrl = `https://qr.io/api/${type}?size=500&data=${encodeURIComponent(data)}`;
  request.get(qrCodeUrl)
    .on('error', (err) => {
      console.log(err);
      return res.status(500).json({ message: 'Failed to generate QR code' });
    })
    .pipe(cloudinary.uploader.upload_stream((result) => {
      // Upload the generated QR code to Cloudinary
      const cloudinaryUrl = result.secure_url;
      const fileName = `${type}_${data.replace(/[^\w\s]/gi, '')}_${file_extension}`;
      return res.json({ url: cloudinaryUrl, file_name: fileName });
    }));
});

