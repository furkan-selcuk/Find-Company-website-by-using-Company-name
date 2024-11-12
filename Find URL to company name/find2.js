const fs = require('fs');
const puppeteer = require('puppeteer');

function getRandomDelay() {
    return Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
}

// Şirket sitesi bulma fonksiyonu
async function findWebsite(companyName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Bing üzerinde arama yapmak için URL'yi güncelledik
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(companyName + " site:.com")}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Bing arama sonuçlarından ilk geçerli bağlantıyı bulmak
    const links = await page.evaluate(() => {
        const results = Array.from(document.querySelectorAll('li.b_algo h2 a')); // Bing için sonuç seçici
        return results.map(result => result.href).filter(url => url.startsWith('http'));
    });

    await browser.close();

    // Bulunan ilk geçerli bağlantıyı döndür
    return links.length > 0 ? links[0] : null;
}

// Tüm işlemi başlatan ana fonksiyon
async function processCompanies() {
    // input.txt dosyasından şirket isimlerini okuma
    const companies = fs.readFileSync('input.txt', 'utf-8').split('\n');

    for (let companyName of companies) {
        if (companyName.trim()) { // Boş satırları atlıyoruz
            console.log(`Searching website for: ${companyName}`);
            const website = await findWebsite(companyName);
            const result = `${website || 'Website not found'}`;

            // Sonucu anında output.txt dosyasına yazma
            fs.appendFileSync('output.txt', result + '\n', 'utf-8');
            console.log(`Result saved: ${result}`);

            // Rastgele bekleme süresi
            await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
        }
    }
    console.log('All websites have been processed and saved to output.txt');
}

processCompanies().catch(console.error);
