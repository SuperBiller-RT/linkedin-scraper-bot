const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const name = await page.$eval('h1.text-heading-xlarge', el => el.innerText.trim());
    const title = await page.$eval('div.text-body-medium.break-words', el => el.innerText.trim());
    const location = await page.$eval('span.text-body-small.inline.t-black--light.break-words', el => el.innerText.trim());

    await browser.close();

    res.json({
      name,
      title,
      location,
      linkedin_url: url
    });

  } catch (error) {
    await browser.close();
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LinkedIn scraper running on port ${PORT}`);
});
