const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://homewithaqilah.com';
const IMAGE_DIR = path.join(__dirname, 'images');

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR);
}

// Helper to download images
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        if (!url.startsWith('http')) {
             if (url.startsWith('//')) url = 'https:' + url;
             else url = BASE_URL + (url.startsWith('/') ? '' : '/') + url;
        }
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const stream = fs.createWriteStream(filepath);
                res.pipe(stream);
                stream.on('finish', () => { stream.close(); resolve(); });
            } else {
                reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
            }
        }).on('error', err => reject(err));
    });
};

(async () => {
    console.log('Starting Scraper...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('Navigating to homepage...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

        // Extract portfolio/project links
        const projectLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            return [...new Set(links
                .map(a => a.href)
                .filter(href => href.includes('portfolio') || href.includes('project'))
            )];
        });

        console.log('Found project links:', projectLinks.length);

        // Extract all images on homepage
        const homeImages = await page.evaluate(() => {
            return [...new Set(Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src))];
        });

        let data = {
            projects: [],
            home_images: homeImages
        };
        
        // Loop through some project links to get details
        for (let i = 0; i < projectLinks.length && i < 4; i++) {
            const link = projectLinks[i];
            console.log(`Navigating to project ${i+1}: ${link}`);
            try {
                await page.goto(link, { waitUntil: 'networkidle2' });
                
                const projData = await page.evaluate(() => {
                    const title = document.querySelector('h1') ? document.querySelector('h1').innerText : 'Project';
                    const desc = document.querySelector('p') ? document.querySelector('p').innerText : 'Interior design project by Home with Aqilah.';
                    const imgs = Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.length > 0);
                    return { title, desc, images: [...new Set(imgs)] };
                });
                
                projData.url = link;
                data.projects.push(projData);
            } catch (err) {
                console.error('Error on project page', link, err.message);
            }
        }

        fs.writeFileSync(path.join(__dirname, 'scraped_data.json'), JSON.stringify(data, null, 2));
        
        // Download a sample of images for local usage
        let imgCount = 0;
        const allImgsToDownload = [...homeImages];
        data.projects.forEach(p => allImgsToDownload.push(...p.images.slice(0, 3))); // Take up to 3 imgs per project
        const uniqueImgs = [...new Set(allImgsToDownload)].filter(u => u && (u.includes('jpg') || u.includes('png') || u.includes('jpeg') || u.includes('webp')));
        
        console.log(`Downloading ${uniqueImgs.length} images...`);
        for (const url of uniqueImgs) {
            try {
                const ext = path.extname(url.split('?')[0]) || '.jpg';
                const filename = `img_${imgCount}${ext}`;
                await downloadImage(url, path.join(IMAGE_DIR, filename));
                imgCount++;
            } catch(e) { /* ignore single image failure */ }
        }

        console.log(`Saved ${imgCount} images.`);
    } catch (err) {
        console.error('Fatal error during scraping', err);
    } finally {
        await browser.close();
        console.log('Scraper finished.');
    }
})();
