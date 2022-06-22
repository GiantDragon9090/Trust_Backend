const { insertData, getTableData, getPriceById, saveTableData } = require('./BaseController')
const BaseController = require('./BaseController')
const cloudinary = require("../config/cloudinary")
const fs = require('fs')

module.exports = BaseController.extends({
    name: "TokenController",

    saveToken: async (req, resp, next) => {
        const data = (typeof req.body.payload == "string"? JSON.parse(req.body.payload):req.body.payload)
        const { logoFile } = (req.files ? req.files : { logoFile: null })
        let logo = null
        if (logoFile) {
            await logoFile.mv(logoFile.name)
            logo = await cloudinary.v2.uploader.upload(logoFile.name, { folder: "inv/token" })
            fs.unlinkSync(logoFile.name)
            delete data.logo
            delete data.logoFile
        }
        const logoURL = (logo? logo.secure_url : data.logo)
        resp.status(200).send(await saveTableData("token", {...data, logo: logoURL}))
    },

    getTokenList: async (req, resp, next) => {
        const { page = 1, search, limit } = req.body.payload
        const res = await getTableData("token", [{ field: 'name', oper: 'LIKE', value: `%${search}%` }], { page, limit: limit ?? 24 })
        resp.status(200).send(res)
    },

    getRewardTokenList: async (req, resp, next) =>{
        resp.status(200).send(await getTableData("token", [{field: 'type', oper: "=", value: 1}], {limit:10000}))
    },

    getTokenById: async (req, resp, next) => {
        const { id } = req.body.payload
        resp.status(200).send(await getTableData("token", [{ field: 'id', oper: '=', value: id }]))
    },
    getPriceById: async (req, resp, next) => {
        const { id } = req.body.payload
        resp.status(200).send({ price: await getPriceById(id) })
    }
})