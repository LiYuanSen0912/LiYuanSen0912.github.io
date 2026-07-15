const Hexo = require('hexo');

const hexo = new Hexo(process.cwd());
hexo.env.init = true;

async function build() {
  await hexo.init();
  await hexo.call('clean');

  if (!process.argv.includes('--clean')) {
    await hexo.call('generate');
  }

  await hexo.exit();
}

build().catch(async error => {
  console.error(error);
  await hexo.exit(1);
});
