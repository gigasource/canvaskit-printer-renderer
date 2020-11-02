require('giga-pkg-patches');
const {exec} = require('pkg');

if (process.cwd() === __dirname) {
  process.chdir('../');
}
const argv = ['--config', './scripts/pkg.config.js', '--targets', 'node10-linux-x64', '--output', './build/worker-script', './src/print-worker-thread/worker-script.js', '--no-bytecode', '--public', '--public-packages', '*'];
exec(argv);
