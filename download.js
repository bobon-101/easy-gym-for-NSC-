const fs = require('fs');
const https = require('https');

const fileId = '1jf5FEPHa__Jw6CL0L9q3Fry9WgjUPHvD';
const url = `https://docs.google.com/uc?export=download&id=${fileId}`;
const dest = 'assets/glutebridge.mp4';

function downloadFile(url, dest) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    // Follow redirect if status code starts with 3 (301, 302, 303, 307, 308)
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      console.log(`Redirecting (${response.statusCode}) to: ${response.headers.location}`);
      file.close();
      fs.unlinkSync(dest); // remove incomplete file from this try
      downloadFile(response.headers.location, dest);
      return;
    }
    
    if (response.statusCode !== 200) {
      console.error(`Failed to get status 200, status: ${response.statusCode}`);
      file.close();
      return;
    }

    response.pipe(file);

    file.on('finish', () => {
      file.close();
      console.log('Download complete!');
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error(`Error: ${err.message}`);
  });
}

downloadFile(url, dest);
