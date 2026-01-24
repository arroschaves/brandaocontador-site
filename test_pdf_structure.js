const pdf = require('node-pdf-parser');
const path = require('path');
const fs = require('fs');

async function test() {
    const baseDir = 'F:\\ACESSO RAPÍDO\\FOLHA PAGAMENTO\\RECIBO FOLHA';
    const subDirs = fs.readdirSync(baseDir);
    let targetFile = '';

    for (const sub of subDirs) {
        const fullSub = path.join(baseDir, sub);
        if (fs.statSync(fullSub).isDirectory()) {
            const files = fs.readdirSync(fullSub);
            const pdfs = files.filter(f => f.toLowerCase().endsWith('.pdf'));
            if (pdfs.length > 0) {
                targetFile = path.join(fullSub, pdfs[0]);
                break;
            }
        }
    }

    if (!targetFile) {
        console.log('No PDF found to test.');
        return;
    }

    console.log('Testing with file:', targetFile);
    try {
        const data = await pdf.parsepdf(targetFile);
        console.log('Number of pages:', data.pages.length);
        const page0 = data.pages[0];
        console.log('Type of page 0:', typeof page0);

        if (typeof page0 === 'string') {
            console.log('Page 0 is a string!');
            console.log('Length:', page0.length);
            console.log('Snippet:', page0.substring(0, 100));
        } else {
            console.log('Page 0 is NOT a string. Keys:', Object.keys(page0).slice(0, 10));
        }

    } catch (e) {
        console.error('Error during parsepdf:', e);
    }
}

test();
