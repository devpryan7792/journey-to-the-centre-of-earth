const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'public', 'illustrations');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const files = [
  'checkpoint_0_library.jpg',
  'checkpoint_1_study.jpg',
  'checkpoint_2_iceland.jpg',
  'checkpoint_3_tunnels.jpg',
  'checkpoint_4_sea.jpg',
  'checkpoint_5_prehistoric.jpg',
  'checkpoint_6_explosion.jpg',
  'checkpoint_7_stromboli.jpg'
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
      fileStream.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading placeholder illustrations...');
  const promises = files.map(file => {
    const keyword = file.split('_')[2].split('.')[0];
    const url = `https://picsum.photos/seed/${keyword}/1920/1080?blur=2`;
    const dest = path.join(dir, file);
    if (!fs.existsSync(dest)) {
      console.log(`Downloading ${file}...`);
      return downloadFile(url, dest);
    } else {
      console.log(`File ${file} already exists, skipping.`);
      return Promise.resolve();
    }
  });

  try {
    await Promise.all(promises);
    console.log('All illustrations downloaded successfully.');
  } catch (err) {
    console.error('Error downloading files:', err);
    process.exit(1);
  }
}

main();