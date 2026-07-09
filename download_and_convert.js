const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Target HTML/CSS files
const TARGET_FILES = [
  'index.html',
  'podcasts.html',
  'video-podcasts.html',
  'about.html',
  'discover.html',
  'contact.html',
  path.join('css', 'style.css')
];

// Regex to capture remote image URLs
const IMAGE_URL_REGEX = /(https?:\/\/[^\s'"()]+?(?:\.(?:png|jpg|jpeg|gif|webp)|unsplash\.com\/photo-[a-zA-Z0-9\-]+|randomuser\.me\/api\/portraits\/[a-zA-Z0-9/_\.\-]+)(?:\?[^\s'"()]+)?)/gi;

const IMAGES_DIR = path.join(__dirname, 'images');

// Create images folder
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR);
}

function getSlug(url) {
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  
  if (url.includes('randomuser.me')) {
    const parts = url.split('/');
    let gender = 'user';
    if (url.includes('women')) gender = 'woman';
    else if (url.includes('men')) gender = 'man';
    const num = parts[parts.length - 1].split('.')[0];
    return `${gender}_${num}_${hash}.webp`;
  } else if (url.includes('unsplash.com')) {
    const match = url.match(/photo-([a-zA-Z0-9\-]+)/);
    if (match) {
      return `unsplash_${match[1].substring(0, 12)}_${hash}.webp`;
    }
    return `unsplash_${hash}.webp`;
  }
  
  const base = path.basename(url.split('?')[0]);
  const name = base.split('.')[0].replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 15);
  return `img_${name}_${hash}.webp`;
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

async function processImage(tempPath, finalPath, sharp) {
  let quality = 85;
  let maxWidth = 1200;
  
  while (true) {
    let pipeline = sharp(tempPath);
    const metadata = await pipeline.metadata();
    
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth });
    }
    
    await pipeline.webp({ quality }).toFile(finalPath);
    const stats = fs.statSync(finalPath);
    
    // Check if under 100KB (100000 bytes)
    if (stats.size < 100000 || quality <= 25) {
      break;
    }
    
    // Adjust quality/width for next loop
    quality -= 10;
    maxWidth = Math.floor(maxWidth * 0.8);
    // Delete file to overwrite
    fs.unlinkSync(finalPath);
  }
}

async function run() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.error('The "sharp" package is missing. Please run: npm install sharp');
    process.exit(1);
  }

  console.log('Scanning files for image URLs...');
  const urlsFound = new Set();
  const fileContents = {};

  for (const fileRel of TARGET_FILES) {
    const filePath = path.join(__dirname, fileRel);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    fileContents[fileRel] = content;
    
    let match;
    while ((match = IMAGE_URL_REGEX.exec(content)) !== null) {
      const url = match[0].trim();
      if (!url.toLowerCase().includes('.css') && !url.toLowerCase().includes('.js') && !url.includes('fonts.googleapis') && !url.includes('fonts.gstatic')) {
        urlsFound.add(url);
      }
    }
  }

  console.log(`Found ${urlsFound.size} unique remote URLs.`);
  const urlToLocal = {};

  for (const url of Array.from(urlsFound).sort()) {
    const filename = getSlug(url);
    const tempPath = path.join(IMAGES_DIR, 'temp_download');
    const finalPath = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(finalPath)) {
      console.log(`Skipping (already exists): ${filename}`);
      urlToLocal[url] = filename;
      continue;
    }

    console.log(`Downloading: ${url} -> ${filename}`);
    try {
      await downloadImage(url, tempPath);
      await processImage(tempPath, finalPath, sharp);
      urlToLocal[url] = filename;
      const stats = fs.statSync(finalPath);
      console.log(`Saved: ${filename} (${Math.round(stats.size / 1024)} KB)`);
    } catch (err) {
      console.error(`Error processing ${url}: ${err.message}`);
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  console.log('\nUpdating references in files...');
  for (const [fileRel, content] of Object.entries(fileContents)) {
    const filePath = path.join(__dirname, fileRel);
    let newContent = content;
    const prefix = fileRel.startsWith('css') ? '../images/' : 'images/';
    
    let replacements = 0;
    for (const [remoteUrl, localFilename] of Object.entries(urlToLocal)) {
      const localPath = prefix + localFilename;
      if (newContent.includes(remoteUrl)) {
        newContent = newContent.split(remoteUrl).join(localPath);
        replacements++;
      }
    }

    if (replacements > 0) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${replacements} references in: ${fileRel}`);
    }
  }

  console.log('\nProcessing complete!');
}

run();
