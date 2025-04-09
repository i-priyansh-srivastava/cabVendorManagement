const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded ({extended: false}))
const router = express.Router();

require("dotenv").config();

const dbConnect = require('./Configs/database.js');
dbConnect();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const routeMount = require('./Routes/routes.js')
app.use('/api/v1', routeMount)
app.get('/', (req, res) => {
    res.send("Backend started");
})


app.listen(PORT, () => {
    console.log(`Server instantiated on Port: ${PORT}`);
})

