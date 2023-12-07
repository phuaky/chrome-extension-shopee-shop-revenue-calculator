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
  let totalRevenue = 0;
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
      const priceElement = container.querySelector(
        'div.eQZeWo > div._4m2-Os.e5pdAI > span.MQbiLE'
      );
      const soldElement = container.querySelector(
        'div._3ZeHP- > div._2VNMCr._8zpprh'
      );

      if (priceElement && soldElement) {
        let price = parseFloat(priceElement.innerText);
        let soldQuantity = parseSoldQuantity(soldElement.innerText);

        totalRevenue += price * soldQuantity;
      }
    }
  });

  const formattedRevenue = totalRevenue.toLocaleString('en-SG', {
    style: 'currency',
    currency: 'SGD',
  });

  // Update the revenue display
  const revenueDisplay = document.getElementById('revenueDisplay');
  if (revenueDisplay) {
    revenueDisplay.innerHTML = `<strong>${formattedRevenue}</strong>`;
  }
  console.log(
    'Total estimated revenue for top 30 products: $' +
      formattedRevenue.toFixed(2)
  );
}

function parseSoldQuantity(soldText) {
  let soldQuantity = 0;
  const soldMatch = soldText.match(/([\d.]+)(k?)/);

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
