  const mongoose = require('mongoose')

    const recipeSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      ingredients: [
        {
          ingredientName: {
            type: String,
            
          },
          qty: {
            type: Number,
            
          },
          units: {
            type: String,
            
          }
        }
      ],
      steps: [
        {
            type: String,
        }
      ],
      servings: {
        type: Number
      },
    })

		module.exports = mongoose.model('Recipe', recipeSchema)
