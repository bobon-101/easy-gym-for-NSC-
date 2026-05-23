const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Run the standard vite build
console.log('Running Vite production build...');
try {
    execSync('npx vite build', { stdio: 'inherit' });
} catch (error) {
    console.error('Vite build failed:', error);
    process.exit(1);
}

// Helper to recursively copy directory
function copyFolderRecursiveSync(source, target) {
    let files = [];

    // Check if folder needs to be created or exists
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach((file) => {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                fs.copyFileSync(curSource, path.join(targetFolder, file));
            }
        });
    }
}

// 2. Copy the unbundled static folders to the dist folder
console.log('Copying static assets (js, css, assets) to build folder (dist)...');
try {
    const distPath = path.join(__dirname, 'dist');
    
    // Ensure dist directory exists
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
    }

    // Copy each static directory
    const foldersToCopy = ['js', 'css', 'assets'];
    foldersToCopy.forEach((folder) => {
        const sourcePath = path.join(__dirname, folder);
        if (fs.existsSync(sourcePath)) {
            console.log(`Copying folder: ${folder}`);
            copyFolderRecursiveSync(sourcePath, distPath);
        } else {
            console.warn(`Warning: Folder not found: ${folder}`);
        }
    });

    console.log('Build process completed successfully! 🎉');
} catch (error) {
    console.error('Error copying static assets:', error);
    process.exit(1);
}
