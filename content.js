console.log('shopee content.js loaded');

function createRevenueDisplay() {
  const revenueDisplay = document.createElement('span');
  revenueDisplay.id = 'revenueDisplay';
  revenueDisplay.style.marginLeft = '10px'; // Example styling, adjust as needed
  return revenueDisplay;
}

function createRevenueButton() {
  const button = document.createElement('button');
  button.innerText = 'Get Shop Revenue';
  button.style.marginTop = '10px'; // Example styling, adjust as needed
  // Add event listener for button click
  button.addEventListener('click', function () {
    console.log('Revenue button clicked');
    ensureCorrectUrlForRevenueCalculation();
  });
  const revenueDisplay = createRevenueDisplay();
  const container = document.createElement('div');
  container.appendChild(button);
  container.appendChild(revenueDisplay);

  return container;
}

function calculateRevenue() {
  let productsRevenue = [];
  const productContainers = document.querySelectorAll(
    '.shop-search-result-view .row .BnjBdc'
  );

  if (productContainers.length === 0) {
    console.error('No product containers found. Is the page fully loaded?');
    return;
  }

  productContainers.forEach((container, index) => {
    if (index < 30) {
      // Limiting to top 30 products
      const titleSelector = `#main > div > div:nth-child(3) > div > div > div > div.shop-page > div > div.container > div.shop-page__all-products-section > div.shop-page_product-list > div > div.shop-search-result-view > div > div:nth-child(${
        index + 1
      }) > a > div > div > div.BnjBdc > div.wGBjtA > div._5Z7GUX > div`;

      const urlSelector = `#main > div > div:nth-child(3) > div > div > div > div.shop-page > div > div.container > div.shop-page__all-products-section > div.shop-page_product-list > div > div.shop-search-result-view > div > div:nth-child(${
        index + 1
      }) > a`;

      const productNameElement = document.querySelector(titleSelector);
      const productLinkElement = document.querySelector(urlSelector);

      const priceElement = container.querySelector(
        'div.eQZeWo > div._4m2-Os.e5pdAI > span.MQbiLE'
      );
      const soldElement = container.querySelector(
        'div._3ZeHP- > div._2VNMCr._8zpprh'
      );

      if (priceElement && soldElement) {
        let price = parseFloat(priceElement.innerText.replace(/,/g, ''));
        let soldQuantity = parseSoldQuantity(soldElement.innerText);
        let revenue = price * soldQuantity;
        let productName = productNameElement
          ? productNameElement.innerText
          : `Product ${index + 1}`;
        let productUrl = productLinkElement.getAttribute('href');

        productsRevenue.push({ productName, revenue, productUrl });
      }
    }
  });

  // Sort products by revenue
  productsRevenue.sort((a, b) => b.revenue - a.revenue);

  // Create and append the table
  const revenueTable = createRevenueTable(productsRevenue);
  const targetDiv = document.querySelector('._1Jkvaf');
  if (targetDiv) {
    targetDiv.appendChild(revenueTable);
  } else {
    console.error('Target div for revenue table not found');
  }
  // Update the total revenue display
  const totalRevenue = productsRevenue.reduce(
    (acc, product) => acc + product.revenue,
    0
  );
  const formattedRevenue = totalRevenue.toLocaleString('en-SG', {
    style: 'currency',
    currency: 'SGD',
  });
  updateRevenueDisplay(`<strong>Total Revenue: ${formattedRevenue}</strong>`);
}

function createRevenueTable(productsRevenue) {
  const table = document.createElement('table');
  const thead = table.createTHead();
  const tbody = table.createTBody();

  let headerRow = thead.insertRow();
  let headerCell1 = headerRow.insertCell();
  let headerCell2 = headerRow.insertCell();
  let headerCell3 = headerRow.insertCell();
  headerCell1.innerHTML = '<strong>No.</strong>';
  headerCell2.innerHTML = '<strong>Title</strong>';
  headerCell3.innerHTML = '<strong>Revenue</strong>';

  productsRevenue.forEach((product, index) => {
    console.log('product', product);
    let row = tbody.insertRow();
    let cell1 = row.insertCell();
    let cell2 = row.insertCell();
    let cell3 = row.insertCell();

    cell1.innerText = index + 1;

    let truncatedTitle =
      product.productName.length > 10
        ? product.productName.substring(0, 10) + '...'
        : product.productName;
    let productLink = document.createElement('a');
    productLink.href = product.productUrl; // Assuming productUrl is available in your data
    productLink.innerText = truncatedTitle;
    productLink.target = '_blank'; // Opens link in new tab
    cell2.appendChild(productLink);

    cell3.innerText = Math.round(product.revenue);
  });

  return table;
}

function parseSoldQuantity(soldText) {
  let soldQuantity = 0;
  // Remove commas from the soldText
  const cleanedSoldText = soldText.replace(/,/g, '');

  const soldMatch = cleanedSoldText.match(/([\d.]+)(k?)/);

  if (soldMatch) {
    soldQuantity = parseFloat(soldMatch[1]);
    if (soldMatch[2] === 'k') {
      soldQuantity *= 1000; // Convert 'k' to actual number
    }
  }

  return soldQuantity;
}

function ensureCorrectUrlForRevenueCalculation() {
  let currentUrl = window.location.href;
  let urlPath = window.location.pathname;
  let domain = window.location.hostname;

  // Check if the domain is correct
  if (domain.includes('shopee.sg') || domain.includes('sg.xiapibuy.com')) {
    // Construct the expected URL format
    let expectedUrl = `https://${domain}${urlPath}?page=0&sortBy=sales`;

    // Check if the current URL matches the expected URL
    if (currentUrl.startsWith(expectedUrl)) {
      console.log('We are on the correct URL. Calculating revenue...');
      startCountdown(1); // Start a 5-second countdown
    } else {
      console.log('Redirecting to the correct URL for revenue calculations.');
      window.location.href = expectedUrl;
    }
  }
}

function startCountdown(seconds) {
  let counter = seconds;
  const intervalId = setInterval(() => {
    updateRevenueDisplay(`Calculating in ${counter}...`);
    counter--;
    if (counter < 0) {
      clearInterval(intervalId);
      calculateRevenue();
    }
  }, 1000);
}

function updateRevenueDisplay(message) {
  const revenueDisplay = document.getElementById('revenueDisplay');
  if (revenueDisplay) {
    revenueDisplay.innerHTML = `<strong>${message}</strong>`;
  }
}

function checkPageAndAddButton() {
  // Use a MutationObserver to wait for the shop-page__info div to be added
  const observer = new MutationObserver(function (mutations, obs) {
    const shopInfoDiv = document.querySelector('.shop-page__info');
    if (shopInfoDiv) {
      console.log('You are on a Shop Page');
      const revenueButton = createRevenueButton();
      shopInfoDiv.appendChild(revenueButton);
      obs.disconnect(); // Stop observing once the button is added
      ensureCorrectUrlForRevenueCalculation(); // Automatically check URL and calculate revenue
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState !== 'complete') {
  window.addEventListener('load', checkPageAndAddButton);
} else {
  checkPageAndAddButton();
}
