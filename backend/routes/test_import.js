try {
  const auth = require("../middleware/auth.js");
  console.log("SUCCESS: Loaded auth middleware");
} catch (error) {
  console.error("FAILURE:", error);
}
