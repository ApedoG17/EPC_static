const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const certsDir = path.join(__dirname, '../certs');

if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating SSL certificates...');

exec('mkcert -install && mkcert localhost 127.0.0.1', {
    cwd: certsDir
}, (error, stdout, stderr) => {
    if (error) {
        console.error('Error generating certificates:', error);
        return;
    }
    console.log('Certificates generated successfully!');
    console.log(stdout);
});
