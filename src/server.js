const app = require("./app");

const PORT = process.env.PORT || 3000;

// I am starting the HTTP server only in this file so tests can import the app without opening a port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
