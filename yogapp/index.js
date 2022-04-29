const express = require('express');
const app = express();
const port = 3000;
/*app.get('/', (req, res) => {
  res.send('Hello World!')
});*/
app.listen(port, () => {
    console.log(`Yoga app listening on port ${port}!`)
});
app.use(express.static('public'));