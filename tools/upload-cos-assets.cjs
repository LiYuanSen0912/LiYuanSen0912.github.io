// Deployment-only helper; it intentionally lives outside Hexo's plugin directory.
const COS = require('cos-nodejs-sdk-v5');
const fs = require('node:fs');
const path = require('node:path');

const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const secretId = process.env.TENCENT_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY;

if (!bucket || !region || !secretId || !secretKey) {
  throw new Error('COS deployment configuration is incomplete.');
}

const publicDir = path.resolve('public');
const assetDirectories = ['img', 'music'];

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function upload(cos, file) {
  const key = path.relative(publicDir, file).split(path.sep).join('/');
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: fs.createReadStream(file),
      CacheControl: 'public, max-age=86400'
    }, (error) => error ? reject(error) : resolve(key));
  });
}

async function main() {
  const files = assetDirectories.flatMap((directory) => listFiles(path.join(publicDir, directory)));
  const rootFiles = ['favicon.svg']
    .map((file) => path.join(publicDir, file))
    .filter((file) => fs.existsSync(file));
  const targets = [...files, ...rootFiles];
  const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

  for (const file of targets) {
    const key = await upload(cos, file);
    console.log(`Uploaded ${key}`);
  }
  console.log(`Synced ${targets.length} COS asset(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
