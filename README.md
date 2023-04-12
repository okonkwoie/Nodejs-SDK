# Nodejs-SDK
This is a Node.js web application that generates and uploads QR codes to Cloudinary. The user can input either a URL or text, and the application will create a QR code and upload it to Cloudinary. The QR code can be downloaded or shared using the generated URL.

__INSTALLATION AND SETUP__

To run this application, you will need to have Node.js and npm installed on your machine. 
You can download them from the official website.

1) Clone the repository to your local machine.
2) Navigate to the root directory of the project in your terminal.
3) Install the required dependencies using the following command:

npm install body-parser child_process cloudinary dotenv express express-rate-limit helmet nodemon jest supertest


4) Create a .env file in the root directory of the project and add the following variables:

CLOUD_NAME = your_cloudinary_cloud_name
API_KEY = your_cloudinary_api_key
API_SECRET = your_cloudinary_api_secret
PORT = 3000
Note: Replace the your_cloudinary_cloud_name, your_cloudinary_api_key, and your_cloudinary_api_secret with your actual Cloudinary account details.

Run the application using the following command:
__npm run start__
This will start the server at localhost:3000.


__FEATURES__
1) Generates QR codes for input URL or text.
2) Uploads the QR codes to Cloudinary.
3) Generates a shareable URL for the uploaded QR code.
4) Applies rate limiting to prevent abuse and improve security.
5) Uses the Helmet middleware to add extra security headers to the HTTP response.
6) Uses the Cloudinary API to upload the QR codes.
7) Supports different file extensions for the generated QR codes.
Limitations
8) The application is currently limited to generating and uploading QR codes only. Additional features such as customizing the design or colors of the QR code could be added in the future.
9) The application currently only supports a limited number of file extensions for the generated QR codes. Additional file extensions could be added in the future.
10) The application is limited to using the QR Server API for generating the QR codes. Using a different QR code generator could improve the reliability and speed of generating the QR codes.


__CONTACT INFORMATION__

If you have any questions, issues, or feedback regarding this application, you can contact the developer at oijeoma11@gmail.com.



