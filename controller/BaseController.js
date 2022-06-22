const _ = require("underscore")
const { executeQuery } = require("../config/database")
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const generateQuery = (query, restriction, pageinfo) => {
    let resQuery = `SELECT * FROM (${query}) _tbl1`
    if (restriction && restriction.length > 0) {
        resQuery = `${resQuery} WHERE `
        restriction.forEach((each) => {
            resQuery += `\`${each.field}\` ${each.oper} '${each.value}' AND `
        })
        resQuery = resQuery.substring(0, resQuery.length - 4)
    }
    resQuery += ` ORDER BY \`${pageinfo.sortname}\` ${pageinfo.sortorder} LIMIT ${pageinfo.page * pageinfo.limit - pageinfo.limit}, ${pageinfo.limit}`
    return resQuery
}

const insertQuery = (tbl_name, data) => {
    if (!data) return ""
    const keys = Object.keys(data)
    if (keys.length == 0) return ""
    let resQuery = ``
    let valueStr = ``
    keys.forEach((each) => {
        resQuery += `, \`${each}\``
        valueStr += `, '${data[each]}'`
    })
    resQuery = resQuery.substring(2)
    valueStr = valueStr.substring(2)
    return `INSERT INTO ${tbl_name}(${resQuery}) VALUES(${valueStr})`
}

const updateQuery = (tbl_name, data, restriction) => {
    if (!data) return ""
    const keys = Object.keys(data)
    if (keys.length == 0) return ""
    let resQuery = ``
    keys.forEach((each) => {
        resQuery += `, \`${each}\` = '${data[each]}'`
    })
    resQuery = `UPDATE ${tbl_name} SET ${resQuery.substring(2)}`
    if (restriction && restriction.length > 0) {
        resQuery = `${resQuery} WHERE `
        restriction.forEach((each) => {
            resQuery += `\`${each.field}\` ${each.oper} '${each.value}' AND `
        })
        resQuery = resQuery.substring(0, resQuery.length - 4)
    }
    return resQuery
}

const deleteQuery = (tbl_name, restriction) => {
    let resQuery = `DELETE FROM ${tbl_name}`
    if (restriction && restriction.length > 0) {
        resQuery = `${resQuery} WHERE `
        restriction.forEach((each) => {
            resQuery += `\`${each.field}\` ${each.oper} '${each.value}' AND `
        })
        resQuery = resQuery.substring(0, resQuery.length - 4)
    }
    return resQuery
}

const getPriceById = async (id) => {
    try {
        const priceURL = "https://pro-api.coinmarketcap.com/v2/tools/price-conversion"
        const { data: price } = await axios.get(`${priceURL}?amount=1&id=${id}&convert=USD`, {
            headers: { 'X-CMC_PRO_API_KEY': process.env.CMCAPIKEY }
        })
        return price.data.quote.USD.price
    } catch (e) {
        return
    }
}

module.exports = {
    name: "BaseController",

    extends: (child) => {
        return _.extend({}, this, child)
    },

    getTableData: async (tbl_name, restriction = null, pageinformation = {}) => {
        const pageinfo = { ...{ sortname: 'id', sortorder: 'asc', page: 1, limit: 24 }, ...pageinformation }
        const query = generateQuery(`SELECT *FROM ${tbl_name}`, restriction, pageinfo)
        return await executeQuery(query)
    },

    getDataByQuery: async (query, restriction = null, pageinformation = {}) => {
        const pageinfo = { ...{ sortname: 'id', sortorder: 'asc', page: 1, limit: 24 }, ...pageinformation }
        const genQuery = generateQuery(query, restriction, pageinfo)
        return await executeQuery(genQuery)
    },

    insertData: async (tbl_name, data) => {
        try {
            return await executeQuery(insertQuery(tbl_name, data))
        } catch (e) {
            if (e.toString().search("Duplicate") == -1)
                return 'error'
            else return 'exist'
        }
    },

    saveTableData: async (tbl_name, data) => {
        const { id = 0 } = data
        if (id == 0) {
            try {
                return await executeQuery(insertQuery(tbl_name, data))
            } catch (e) {
                if (e.toString().search("Duplicate") == -1)
                    return 'error'
                else return 'exist'
            }
        } else if (id > 0) {
            return await executeQuery(updateQuery(tbl_name, data, [{ field: "id", oper: "=", value: id }]))
        } else if (id < 0) {
            return await executeQuery(deleteQuery(tbl_name, [{ field: "id", oper: "=", value: -id }]))
        }
    },

    saveRestrictedData: async (tbl_name, mode, data = null, restriction = null) => {
        const { id = 0 } = data
        if (mode == 'update') {
            return await executeQuery(updateQuery(tbl_name, data, restriction))
        } else if (mode == 'delete') {
            return await executeQuery(deleteQuery(tbl_name, restriction))
        }
    },

    getURLData: async (req, resp, next) => {
        try {
            const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info"
            const tokeninfo = req.body.payload
            const key = Object.keys(tokeninfo)
            const keys = key.reduce((prev, each) => {
                if (tokeninfo[each] != '') return each
                else return prev
            }, '')
            if (keys == '' || tokeninfo[keys] == '') throw new Error("Error")
            const { data } = await axios.get(`${url}?${keys}=${tokeninfo[keys]}`, {
                headers: { 'X-CMC_PRO_API_KEY': process.env.CMCAPIKEY }
            })
            const temp = data.data
            const tempkey = Object.keys(temp)
            const resdata = temp[tempkey[0]]

            resp.status(200).send({ ...resdata, price: await getPriceById(resdata.id) })
        } catch (e) {
            console.log(e)
            resp.status(200).send(null)
        }
    },
    getPriceById
}