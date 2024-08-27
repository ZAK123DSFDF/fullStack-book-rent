function keepServerAwake() {
  fetch('https://fullstack-book-rent.onrender.com/auth/check')
    .then((response) =>
      console.log(`Pinged server with status code: ${response.status}`),
    )
    .catch((error) => console.error(`Error pinging server: ${error.message}`));
}

// Ping the server every 2 minutes (120,000 milliseconds)
setInterval(keepServerAwake, 120000);
