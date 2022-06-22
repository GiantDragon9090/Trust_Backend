const md5 = require('md5')
const cloudinary = require("../config/cloudinary")
const fs = require('fs')
const BaseController = require('./BaseController')
const { getTableData, saveTableData, getDataByQuery } = require('./BaseController')

module.exports = BaseController.extends({
    name: "UserController",

    login: async (req, resp, next) => {
        const { email, password, mode } = req.body.payload
        const userList = await getTableData('user', [{ field: "email", oper: "=", value: email }])
        if (userList.length == 0) {
            resp.status(200).send({ type: "warning", msg: "Warning", description: "Sorry!You aren't registered!" })
        } else {
            if (userList[0].password == password) {
                if (userList[0].isAdmin == mode) {
                    if(mode == 0){
                        const query = "SELECT SUM(amount) as a, id FROM invest WHERE user_id="+userList[0].id
                        const res = await getDataByQuery(query)
                        resp.status(200).send({ type: "success", userinfo: {...userList[0], total: res[0]?.a} })
                    }else
                    resp.status(200).send({ type: "success", userinfo: userList[0] })
                } else {
                    resp.status(200).send({ type: "warning", msg: "Warning", description: "You cannot access this site!!" })
                }
            } else {
                resp.status(200).send({ type: "error", msg: "Error", description: "Incorrect Password!!" })
            }
        }
    },

    saveUser: async (req, resp, next) => {
        const data = JSON.parse(req.body.payload)
        const {photoFile} = (req.files ? req.files : {photoFile:null})
        let photo = null
        if(photoFile){
            await photoFile.mv(photoFile.name)
            photo = await cloudinary.v2.uploader.upload(photoFile.name,{ folder: "inv/user" })
            fs.unlinkSync(photoFile.name)
        }
        const photoURL = photo?.secure_url || data.photo
        delete data.photoFile
        delete data.photo
        const resdata = (data.id == 0? {...data, photo: photoURL, password: md5("trust")} : {...data, photo: photoURL})
        resp.status(200).send(await saveTableData("user", resdata))
    },
    resetPwd: async (req, resp, next) =>{
        const data = req.body.payload
        resp.status(200).send(await saveTableData("user", data))
    },

    getUserList: async (req, resp, next) => {
        const { page, search } = req.body.payload
        resp.status(200).send(await getTableData("user", [{field:'name', oper: 'LIKE', value:`%${search}%`}], { page }))
    },

    getUserInfoById: async (req, resp, next) => {
        const {id} = req.body.payload
        resp.status(200).send(await getTableData("user",[{field:'id', oper: '=', value:id}]))
    }
})