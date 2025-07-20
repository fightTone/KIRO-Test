// Simple script to run the database optimization
const { exec } = require('child_process');

console.log('Running database optimization...');

exec('python -m app.utils.optimize_db', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
});