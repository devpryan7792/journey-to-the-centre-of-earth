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

files.forEach(file => {
  const keyword = file.split('_')[2].split('.')[0];
  const url = `https://picsum.photos/seed/${keyword}/1920/1080?blur=2`;
  const dest = path.join(dir, file);
  
  https.get(url, (res) => {
    if (res.statusCode === 302) {
      https.get(res.headers.location, (res2) => {
        const fileStream = fs.createWriteStream(dest);
        res2.pipe(fileStream);
      });
    } else {
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
    }
  });
});
