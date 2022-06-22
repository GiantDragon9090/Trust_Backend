const express = require('express')
const BaseController = require('./controller/BaseController')
const InvestController = require('./controller/InvestController')
const TokenController = require('./controller/TokenController')
const UserController = require('./controller/UserController')
const router = express.Router()


router.post('/api/login', (req, resp, next) => {
    UserController.login(req, resp, next)
})

router.post('/api/saveUser', (req, resp, next) => {
    UserController.saveUser(req, resp, next)
})

router.post('/api/getUserList', (req, resp, next) => {
    UserController.getUserList(req, resp, next)
})

router.post('/api/resetPwd', (req, resp, next) => {
    UserController.resetPwd(req, resp, next)
})

router.post('/api/saveToken', (req, resp, next) => {
    TokenController.saveToken(req, resp, next)
})

router.post('/api/getTokenList', (req, resp, next) => {
    TokenController.getTokenList(req, resp, next)
})

router.post('/api/getTokenById', (req, resp, next) => {
    TokenController.getTokenById(req, resp, next)
})

router.post('/api/getUserInfoById', (req, resp, next) => {
    UserController.getUserInfoById(req, resp, next)
})

router.post('/api/getURLData', (req, resp, next) => {
    BaseController.getURLData(req, resp, next)
})

router.post('/api/getPriceById', (req, resp, next) => {
    TokenController.getPriceById(req, resp, next)
})

router.post('/api/getRewardTokenList', (req, resp, next) => {
    TokenController.getRewardTokenList(req, resp, next)
})

router.post('/api/getInvestList', (req, resp, next) => {
    InvestController.getInvestList(req, resp, next)
})

router.post('/api/saveInvest', (req, resp, next) => {
    InvestController.saveInvest(req, resp, next)
})

router.post('/api/getNeedData', (req, resp, next) => {
    InvestController.getNeedData(req, resp, next)
})

module.exports = router