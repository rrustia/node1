const app = require("./app");

const PORT = process.env.PORT || 3000;

// Server startup is isolated here so tests can import the app without opening a port.
// Input: configured Express app and resolved PORT value.
// Output: active HTTP listener and a startup log line.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
