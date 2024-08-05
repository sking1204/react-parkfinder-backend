"use strict";
/* User routes */

const jsonschema = require("jsonschema")
const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError, ExpressError } = require("../expressError");
const User = require("../models/users");
const { createToken } = require("../helpers/tokens");

const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const userReviewSchema = require("../schemas/userReviewSchema.json")
const userEventSchema = require("../schemas/userEventSchema.json")
const userFeeSchema = require("../schemas/userFeeSchema.json")
const userFavoritesSchema = require("../schemas/userFavoritesSchema.json");
const userTodoSchema = require("../schemas/userTodoSchema.json");
const userMapSchema = require("../schemas/userMap.json");
const userActivitiesSchema = require("../schemas/userActivities.json");


const router = express.Router();

/* THIS IS FOR ADMINS ONLY TO REGISTER NEW USER */

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

router.get("/", ensureAdmin, async function(req,res, next){
    try{
        const users = await User.findAll();
        return res.json({users});
    } catch (err){
        return next(err)
    }
})

router.get("/reviews", async function(req,res, next){
    try{
        const reviews = await User.getAllReviews();
        return res.json({reviews});
    } catch (err){
        return next(err)
    }
})

router.get("/:username/favorites",  async function (req, res, next) {
  try{
    const userFavorite = await User.getFavoritesByUsername(req.params.username);
    return res.json({userFavorite});
  }catch(err){
    return next(err);
  }
    // return res.send("Placeholder for reviews by username...review form")
  });

router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  });

router.get("/:username/reviews",  async function (req, res, next) {
  try{
    const userReview = await User.getReviewByUsername(req.params.username);
    return res.json({userReview});
  }catch(err){
    return next(err);
  }
    // return res.send("Placeholder for reviews by username...review form")
  });

// //OLD

// router.post("/:username/reviews/:parkCode",  async function (req, res, next) {
//   try {
//       const username = req.params.username;
//       const parkCode = req.params.parkCode;  
//       const { review_title, review_data, rating } = req.body;  // Assuming review data and rating are sent in the request body

//       // Validate the rating if necessary (e.g., ensure it's between 1 and 5)
//       if (rating < 1 || rating > 5) {
//           return res.status(400).json({ error: "Rating must be between 1 and 5" });
//       }

//       const review = await User.reviewPark(username, parkCode, { review_title, review_data, rating });

//       return res.json({ reviewed: review });
//   } catch (err) {
//       return next(err);
//   }  

// });

//ADDING JSON SCHEMA validation 7/19

router.post("/:username/reviews/:parkCode",  async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userReviewSchema)
    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }   
  
      const username = req.params.username;
      const parkCode = req.params.parkCode;  
      const { review_title, review_data, rating } = req.body;  // Assuming review data and rating are sent in the request body

      // Validate the rating if necessary (e.g., ensure it's between 1 and 5)
      if (rating < 1 || rating > 5) {
          return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const review = await User.reviewPark(username, parkCode, { review_title, review_data, rating });

      return res.json({ reviewed: review });
  } catch (err) {
      return next(err);
  }  

});

// router.post("/:username/saved-activities/:parkCode",  async function (req, res, next) {
//   try {
//       const username = req.params.username;
//       const parkCode = req.params.parkCode;  
//       const { nps_activity_id } = req.body;  // Assuming review data and rating are sent in the request body

   

//       const activity = await User.saveActivity(username, parkCode, { nps_activity_id});

//       return res.json({ activity });
//   } catch (err) {
//       return next(err);
//   }  

// });

//old 7/17
// router.post("/:username/saved-activities/:parkCode", async function (req, res, next) {
//   try {
//     const username = req.params.username;
//     const parkCode = req.params.parkCode;  
//     const { nps_activity_ids } = req.body;  // Note the plural "nps_activity_ids"

//     const activities = await User.saveActivities(username, parkCode, nps_activity_ids);

//     return res.json({ activities });
//   } catch (err) {
//     return next(err);
//   }  
// });


/* HOW CAN I PASS THE ENTIRE EVENT OBJECT TO THIS ROUTE (SIMILAR TO THE PARK EVENTS COMPONENT?) */


router.post("/:username/saved-events/:parkCode", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userEventSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const username = req.params.username;
    const parkCode = req.params.parkCode;  
    const eventData = req.body;  
    // const { event_ids } = req.body;  

    const events = await User.saveEvents(username, parkCode, eventData);

    return res.json({ events });
  } catch (err) {
    return next(err);
  }  
});





router.post("/:username/saved-fees/:parkCode", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userFeeSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e=> e.stack);
      throw new BadRequestError(errs);
    }

    const username = req.params.username;
    const parkCode = req.params.parkCode;  
    const feeData = req.body;  // Note the plural "nps_activity_ids"

    let fees = await User.saveFees(username, parkCode, feeData);

    return res.json({ fees });
  } catch (err) {
    return next(err);
  }  
});

router.post("/:username/saved-favorites/:parkCode", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userFavoritesSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e=>e.stack);
      throw new BadRequestError(errs);
    }
 
    const username = req.params.username;
    const parkCode = req.params.parkCode;  
    const favoriteData  = req.body;  // Note the plural "nps_activity_ids"

    // Log the request body to debug
    console.log('Request body:', req.body);
    console.log('Favorite Data:', favoriteData);

    const favorites = await User.saveFavorite(username, parkCode, favoriteData);

    return res.json({ favorites });
  } catch (err) {
    return next(err);
  }  
});

router.get("/:username/saved-favorites/:parkCode", async function (req, res, next) {
  try {
    const username = req.params.username;
    const parkCode = req.params.parkCode;  
   

    const savedFavorites = await User.getSavedFavorites(username, parkCode);

    return res.json({ savedFavorites });
  } catch (err) {
    return next(err);
  }  
});

/*  all-saved-favorites not working/ being used */
// router.get("/:username/all-saved-favorites", async function (req, res, next) {
//   try {
//     const username = req.params.username;
//     // const parkCode = req.params.parkCode;  
   

//     const savedFavorites = await User.getAllSavedFavorites(username);

//     return res.json({ savedFavorites });
//   } catch (err) {
//     return next(err);
//   }  
// });


router.post("/:username/saved-things-to-do/:parkCode", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userTodoSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const username = req.params.username;
    const parkCode = req.params.parkCode;  
    const todoData = req.body;  

    const todos = await User.saveThingsToDo(username, parkCode, todoData);

    return res.json({ todos });
  } catch (err) {
    return next(err);
  }  
});

router.post("/:username/saved-map/:parkCode", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userMapSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e=>e.stack);
      throw new BadRequestError(errs);
    }
  
    const username = req.params.username;
    const parkCode = req.params.parkCode;  
    const mapData = req.body;  

    const coords = await User.saveMap(username, parkCode, mapData);

    return res.json({ coords });
  } catch (err) {
    return next(err);
  }  
});

router.get("/:username/saved-fees/:parkCode", async function (req, res, next) {
  try {
    const username = req.params.username;
    const parkCode = req.params.parkCode;     

    let savedFees = await User.getSavedFees(username, parkCode);    

     // If no saved fees are found, insert a default fee with cost $0.00
     if (savedFees.length === 0) {
      const defaultFee = {
        title: "No Fee",
        cost: "0.00"
      };

      await User.saveFees(username, parkCode, [defaultFee]);

      // Re-fetch the saved fees after inserting the default fee
      savedFees = await User.getSavedFees(username, parkCode);
    }

  
    return res.json({ savedFees });
  } catch (err) {
    return next(err);
  }  
});

router.get("/:username/all-saved-fees", async function (req, res, next) {
  try {
    const username = req.params.username;
    
   

    const savedFees = await User.getSavedFees(username);

    return res.json({ savedFees });
  } catch (err) {
    return next(err);
  }  
});

//NEW 7/18 - WORKING !!!!
router.post("/:username/saved-activities/:parkCode", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userActivitiesSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const username = req.params.username;
    const parkCode = req.params.parkCode;
    const activities = req.body; // Expecting an array of activity objects

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      throw new Error("Invalid activities data");
    }

    const savedActivities = await User.saveActivities(username, parkCode, activities);

    return res.json({ savedActivities });
  } catch (err) {
    console.error('Error saving activities:', err);
    return next(err);
  }
});



//OLD - WORKING

// router.get("/:username/saved-activities/:parkCode", async function (req, res, next) {
//   try {
//     const username = req.params.username;
//     const parkCode = req.params.parkCode;  
   

//     const savedActivities = await User.getSavedActivities(username, parkCode);

//     return res.json({ savedActivities });
//   } catch (err) {
//     return next(err);
//   }  
// });

router.get("/:username/all-saved-activities", async function (req, res, next) {
  try {
    const username = req.params.username;
    // const parkCode = req.params.parkCode;  
   

    const savedActivities = await User.getAllSavedActivities(username);

    return res.json({ savedActivities });
  } catch (err) {
    return next(err);
  }  
});

router.get("/:username/saved-events/:parkCode", async function (req, res, next) {
  try {
    const username = req.params.username;
    const parkCode = req.params.parkCode;  
   

    const savedEvents = await User.getSavedEvents(username, parkCode);

    return res.json({ savedEvents });
  } catch (err) {
    return next(err);
  }  
});

router.get("/:username/all-saved-events", async function (req, res, next) {
  try {
    const username = req.params.username;
    // const parkCode = req.params.parkCode;  
   

    const savedEvents = await User.getAllSavedEvents(username);

    return res.json({ savedEvents });
  } catch (err) {
    return next(err);
  }  
});

//OLD 7/17
// router.patch("/:username", async function (req, res, next) {
//   try {
//     const username = req.params.username;
//     const data = req.body;  
//     const savedDetails = await User.update(username, data);

//     return res.json({ savedDetails });
//   } catch (err) {
//     return next(err);
//   }  
// });

//7/17 NEW ADDED LOGIC TO UPDATE USERNAME:
router.patch("/:username", async function (req, res, next) {
  try{
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs)
    }
 
    const oldUsername = req.params.username;
    const data = req.body; // Extract data from the request body

    const updatedUser = await User.update(oldUsername, data);

    return res.json({ user: updatedUser }); // Match the front end response handling
  } catch (err) {
    return next(err);
  }  
});






router.get("/:username/saved-items", async function (req, res, next) {
  try {
    const username = req.params.username;
    // const parkCode = req.params.parkCode;  
   

    // Make both requests in parallel
    const [savedActivities,savedEvents, savedFees, savedMap, savedTodo] = await Promise.all([
      User.getAllSavedActivities(username),      
      User.getAllSavedEvents(username),
      User.getAllSavedFees(username),
      User.getMap(username),
      User.getSavedThingsToDo(username)
    ]);

    return res.json({ savedActivities, savedEvents, savedFees, savedMap, savedTodo });
  } catch (err) {
    return next(err);
  }
});





router.get("/:username/park-details/:parkCode", async function (req, res, next) {
  try {
    const username = req.params.username;
    const parkCode = req.params.parkCode;  

    // Make both requests in parallel
    const [savedActivities, savedFees] = await Promise.all([
      User.getSavedActivities(username, parkCode),
      User.getSavedFees(username, parkCode)
    ]);

    return res.json({ savedActivities, savedFees });
  } catch (err) {
    return next(err);
  }
});

// router.get("/:username/park-details/:parkCode", async function (req, res, next) {
//   try {
//     const username = req.params.username;
//     const parkCode = req.params.parkCode;  
   

//     const savedActivities = await User.getSavedActivities(username, parkCode);

//     return res.json({ savedActivities });
//   } catch (err) {
//     return next(err);
//   } 

  
// });


//INCORRECT ROUTE DOESN"T BELONG WITH USERS ROUTES:

// router.post("/parks/parkCode/:parkCode/review",  async function (req, res, next) {
//   try {
//       // const username = req.params.username;
//       const parkCode = req.params.parkCode;  
//       const { review_title, review_data, rating} = req.body;  // Assuming review data and rating are sent in the request body

//       // Validate the rating if necessary (e.g., ensure it's between 1 and 5)
//       if (rating < 1 || rating > 5) {
//           return res.status(400).json({ error: "Rating must be between 1 and 5" });
//       }

//       const review = await User.reviewPark( parkCode, { review_title, review_data, rating });

//       return res.json({ reviewed: review });
//   } catch (err) {
//       return next(err);
//   }  

// });

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

//OLD WITHOUT USERNAME UPDATE FUNCTIONALITY
// router.patch("/:username", ensureCorrectUserOrAdmin,  async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, userUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const user = await User.update(req.params.username, req.body);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});



  


module.exports = router;