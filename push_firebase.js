const { execSync } = require('child_process');
const GIT = 'C:\\Users\\BTC\\AppData\\Local\\Temp\\MinGit\\cmd\\git.exe';
const CWD = 'C:\\Users\\BTC\\.gemini\\antigravity\\scratch\\invoice_manager';

try {
  console.log('Staging files...');
  execSync(`"${GIT}" add package.json package-lock.json src/`, { cwd: CWD, stdio: 'inherit' });

  console.log('Committing changes...');
  execSync(`"${GIT}" commit -m "Integrate Firebase Authentication and Cloud Firestore for permanent cross-device persistence"`, { cwd: CWD, stdio: 'inherit' });

  console.log('Pushing to GitHub main...');
  execSync(`"${GIT}" push origin main`, { cwd: CWD, stdio: 'inherit' });

  console.log('Successfully pushed to GitHub!');
} catch (e) {
  console.error('Git error:', e.message);
}
