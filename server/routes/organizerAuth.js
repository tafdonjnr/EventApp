const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/organizerAuth'); // <- Destructured import

router.post('/register', register); // <- register is a function
router.post('/login', login);       // <- login is a function
router.get('/test', (req, res) => {
  res.json({ message: "Test route working" });
});


module.exports = router;
