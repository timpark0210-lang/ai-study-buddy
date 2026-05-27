const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  'src/app/[locale]/tutor/page.tsx',
  'src/app/api/upload/route.ts',
  'src/components/quiz/QuizEngine.tsx',
  'src/components/study/MyLibraryView.tsx',
  'src/components/study/StudyRoom.tsx',
  'src/components/ui/MaterialUploader.tsx',
  'src/lib/actions.ts',
  'src/store/useLibraryStore.ts',
  'src/types/index.ts'
];

const repo = 'timpark0210-lang/ai-study-buddy';
const branch = 'main';

async function fetchFile(f) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${f}`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${f}: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const target = path.join(process.cwd(), f.replace(/\//g, path.sep));
        const dir = path.dirname(target);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(target, data);
        console.log(`Successfully fetched and wrote: ${f}`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Starting deep sync of authentic source files...');
  for (const f of files) {
    try {
      await fetchFile(f);
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('Sync complete.');
}

run();
