const express = require('express');
const path = require('path');

const dashboardRouter = express.Router();
const jsonBodyParser = express.json();

dashboardRouter
    .post('/', jsonBodyParser, async (req, res, next) => {
        
    })