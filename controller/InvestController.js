const { getDataByQuery, saveTableData } = require('./BaseController')
const BaseController = require('./BaseController')

module.exports = BaseController.extends({
    name: "InvestController",

    saveInvest: async (req, resp, next) => {
        const data  = req.body.payload
        const date = new Date(Date.now())
        const str = date.getFullYear() + "-" + (date.getMonth()+1) + "-" +date.getDate()
        resp.status(200).send(await saveTableData("invest", {...data, regdate:str}))
    },

    getInvestList: async (req, resp, next) => {
        const { page, user_id, limit } = req.body.payload
        const query = `SELECT i.*,t.id as t_id, t.name, t.logo, t.symbol, t.cmc_id FROM invest i LEFT JOIN token t ON i.token_id = t.id`
        resp.status(200).send(await getDataByQuery(query, [{field:'user_id', oper: "=", value: user_id}], { page, sortname : 'regdate', sortorder: 'desc', limit:limit?limit:24 }))
    },
    getNeedData: async (req, resp, next) => {
        const {id} = req.body.payload
        // let myInv = `SELECT SUM(token_amount) as myInv, token_id as token FROM invest WHERE user_id=${id} GROUP BY token_id`
        // let totalInv = `SELECT SUM(token_amount) as totalInv, token_id FROM invest GROUP BY token_id`
        // myInv = `SELECT myInv/totalInv as percent, token_id FROM (${myInv}) _tbl1 `
        // totalInv = ` INNER JOIN (${totalInv}) _tbl2 ON _tbl1.token = _tbl2.token_id `
        // const finalQuery = `SELECT * FROM (${myInv}${totalInv}) _tbl3 INNER JOIN token t ON t.id = _tbl3.token_id`
        let query = "SELECT SUM(amount) / (SELECT SUM(amount) FROM invest) as percent, id FROM invest WHERE user_id = " + id
        resp.status(200).send(await getDataByQuery(query, null,{limit:20000}))
    }
})