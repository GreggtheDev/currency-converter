document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "fca_live_dgMfbpbcfn2T8gaTaNyYq3fSRx34vHeFagUP7hdV"; // My API key
  const baseCurrencySelect = document.getElementById("base-currency"); // Dropdown for base currency
  const targetCurrencySelect = document.getElementById("target-currency"); // Dropdown for target currency
  const amountInput = document.getElementById("amount"); // Input field for amount
  const convertedAmountSpan = document.getElementById("converted-amount"); // Span to display converted amount
  const historicalRatesContainer = document.getElementById(
    "historical-rates-container"
  ); // Container for historical rates
  const favoriteCurrencyPairsContainer = document.getElementById(
    "favorite-currency-pairs"
  ); // Container for favorite pairs
  const historicalRatesButton = document.getElementById("historical-rates"); // Button for historical rates
  const saveFavoriteButton = document.getElementById("save-favorite"); // Button to save favorite pair

  // Fetch list of currencies and populate the dropdowns
  fetchCurrencies();

  // Event listeners for user interactions
  baseCurrencySelect.addEventListener("change", convertCurrency);
  targetCurrencySelect.addEventListener("change", convertCurrency);
  amountInput.addEventListener("input", convertCurrency);
  historicalRatesButton.addEventListener("click", fetchHistoricalRates);
  saveFavoriteButton.addEventListener("click", saveFavoriteCurrencyPair);

  // Function to fetch list of currencies from the API
  function fetchCurrencies() {
    fetch(
      `https://api.apilayer.com/exchangerates_data/symbols`,
      requestOptions()
    )
      .then((response) => response.json())
      .then((data) => {
        populateCurrencyDropdown(baseCurrencySelect, data.symbols);
        populateCurrencyDropdown(targetCurrencySelect, data.symbols);
      })
      .catch((error) => console.error("Error fetching currencies:", error));
  }

  // Function to populate the dropdown menus with currency options
  function populateCurrencyDropdown(dropdown, currencies) {
    for (const [code, name] of Object.entries(currencies)) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${name} (${code})`;
      dropdown.appendChild(option);
    }
  }

  // Function to perform the currency conversion
  function convertCurrency() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
    const amount = parseFloat(amountInput.value);

    // Check for valid input
    if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
      convertedAmountSpan.textContent = "Invalid input";
      return;
    }

    // Fetch the conversion rate from the API and perform the conversion
    fetch(
      `https://api.apilayer.com/exchangerates_data/convert?from=${baseCurrency}&to=${targetCurrency}&amount=${amount}`,
      requestOptions()
    )
      .then((response) => response.json())
      .then((data) => {
        convertedAmountSpan.textContent = `${data.result} ${targetCurrency}`;
      })
      .catch((error) =>
        console.error("Error fetching conversion rate:", error)
      );
  }

  // Function to fetch historical exchange rates
  function fetchHistoricalRates() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
    const date = "2021-01-01"; // Example date, can be made dynamic

    // Check if both currencies are selected
    if (!baseCurrency || !targetCurrency) {
      historicalRatesContainer.textContent = "Please select both currencies";
      return;
    }

    // Fetch the historical rate from the API
    fetch(
      `https://api.apilayer.com/exchangerates_data/${date}?symbols=${targetCurrency}&base=${baseCurrency}`,
      requestOptions()
    )
      .then((response) => response.json())
      .then((data) => {
        const rate = data.rates[targetCurrency];
        historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
      })
      .catch((error) =>
        console.error("Error fetching historical rates:", error)
      );
  }

  // Function to save favorite currency pairs
  function saveFavoriteCurrencyPair() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;

    // Check if both currencies are selected
    if (!baseCurrency || !targetCurrency) {
      return;
    }

    const favorites =
      JSON.parse(localStorage.getItem("favoriteCurrencyPairs")) || [];
    const pair = `${baseCurrency}/${targetCurrency}`;

    // Add the pair to favorites if it's not already present
    if (!favorites.includes(pair)) {
      favorites.push(pair);
      localStorage.setItem("favoriteCurrencyPairs", JSON.stringify(favorites));
      displayFavoriteCurrencyPairs();
    }
  }

  // Function to display favorite currency pairs
  function displayFavoriteCurrencyPairs() {
    const favorites =
      JSON.parse(localStorage.getItem("favoriteCurrencyPairs")) || [];
    favoriteCurrencyPairsContainer.innerHTML = "";

    favorites.forEach((pair) => {
      const button = document.createElement("button");
      button.textContent = pair;
      button.addEventListener("click", () => {
        const [base, target] = pair.split("/");
        baseCurrencySelect.value = base;
        targetCurrencySelect.value = target;
        convertCurrency();
      });
      favoriteCurrencyPairsContainer.appendChild(button);
    });
  }

  // Helper function to create request options with headers
  function requestOptions() {
    const myHeaders = new Headers();
    myHeaders.append("apikey", apiKey);

    return {
      method: "GET",
      redirect: "follow",
      headers: myHeaders,
    };
  }

  // Initial display of favorite currency pairs
  displayFavoriteCurrencyPairs();
});
