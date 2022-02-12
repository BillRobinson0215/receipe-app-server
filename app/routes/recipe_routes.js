const express = require('express')
const passport = require('passport')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const router = express.Router()
const requireOwnership = customErrors.requireOwnership

const User = require('../models/user.js')
const Recipe = require('../models/recipe.js')
// const axios = require('axios')

const requiresToken = passport.authenticate('bearer', { session: false })

router.post('/recipes/new', (req, res, next) => {
  const recipe=req.body.recipe
	console.log(req.body.recipe)

	if(req.body.recipe.name !== '') {
		User.findById(req.body.recipe.owner._id)
			.then((user) => {
				Recipe.create(recipe)
					.then((recipe) => {
						user.recipes.push(recipe)
						user.save()
						return recipe
					})
					.then((recipe) => {
						res.status(201).json({ recipe })
					})
			})
		} else {
			console.error()
			.catch((err) => next(err))
		}
})

router.get('/recipes/find-recipes/', requiresToken, (req, res, next) => {
	User.findById(req.user.id)
		.populate('recipes')
		.then((user) => {
			console.log(user)
			// `examples` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return user.recipes.map((recipes) => recipes.toObject())
		})
		// respond with status 200 and JSON of the examples
		.then((recipes) => res.status(200).json({ recipes }))
		// if an error occurs, pass it to the handler
		.catch((err) => next(err))
})

router.delete('/recipes/delete/:userid/:id', requiresToken, (req, res, next) => {
		let recipeToDelete = null
		Recipe.findOneAndDelete({ _id: req.params.id })
			.exec()
			.then((recipe) => {
				User.findById(req.user.id)
					.then((user) => {
						const recipeId = req.params.id
						recipeToDelete = user.recipes.findIndex(
							(recipe) => recipe.toString() === recipeId.toString()
						)
						return user
					})
					.then((user) => {
						user.recipes.splice(recipeToDelete, 1)
						user.save()
					})
			})
			.then((counter) => res.json())
			.catch((err) => next(err))
	}
)

router.patch('/recipes/update/:id', (req, res, next) => {
	let recipeToUpdate = null
	let newRecipe = []
		Recipe.findById({ _id: req.params.id })
			.exec()
			.then((recipe) => {
				console.log(recipe)
				recipe.ingredients = req.body.recipe.ingredients
				recipe.steps = req.body.recipe.steps
				newRecipe = recipe
				console.log(newRecipe)
				recipe.save()
				User.findById(recipe.owner)
					.then((user) => {
						const recipeId = req.params.id
						recipeToUpdate = user.recipes.findIndex(
							(recipe) => recipe.toString() === recipeId.toString()
						)
						return user
					})
					.then((user) => {
						user.recipes[recipeToUpdate] = newRecipe
						user.save()
					})
			})
			.then((counter) => res.json())
			.catch((err) => next(err))
	}
)

module.exports = router