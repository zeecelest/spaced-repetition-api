const express = require('express')
const path = require('path')
const UserService = require('./user-service')

const userRouter = express.Router()
const jsonBodyParser = express.json()

userRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    console.log('got request');
    const { password, username, name } = req.body

    for (const field of ['name', 'username', 'password'])
      if (!req.body[field]){
      console.log('missing field');
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
      }

    try {
      const passwordError = UserService.validatePassword(password)

      if (passwordError) {
        console.log('password error');
        return res.status(400).json({ error: passwordError })
      }
      const hasUserWithUserName = await UserService.hasUserWithUserName(
        req.app.get('db'),
        username
      )

      if (hasUserWithUserName) {
        console.log('has user');
        return res.status(400).json({ error: `Username already taken` })

      }
        

      const hashedPassword = await  UserService.hashPassword(password)

      const newUser = {
        username,
        password: hashedPassword,
        name,
      }

      const user = await UserService.insertUser(
        req.app.get('db'),
        newUser
      )

      await UserService.populateUserWords(
        req.app.get('db'),
        user.id
      )
        console.log('so far so good');
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(UserService.serializeUser(user))
    } catch(error) {
      console.log(error);
      next(error)
    }
  })

module.exports = userRouter
