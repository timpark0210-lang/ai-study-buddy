const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/timpark0210-lang/ai-study-buddy/main/src/components/ui/MaterialUploader.tsx';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('MaterialUploader_real.tsx', data);
    console.log('Done');
  });
}).on('error', (e) => {
  console.error(e.message);
});
