"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"                 
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password; // Remove the password property for security purposes
        return user; // Return sanitized user object
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, firstName, lastName, email, isAdmin}) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)             
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,          
          firstName,
          lastName,
          email,
          isAdmin          
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  id AS "userID",
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"                   
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"                   
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    // const userApplicationsRes = await db.query(
    //       `SELECT a.job_id
    //        FROM applications AS a
    //        WHERE a.username = $1`, [username]);

    // user.applications = userApplicationsRes.rows.map(a => a.job_id);
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email }
   *
   * Returns { username, firstName, lastName, email}
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */
// WORKING 7/17
  // static async update(username, data) {
  //   if (data.password) {
  //     data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
  //   }

  //   const { setCols, values } = sqlForPartialUpdate(
  //       data,
  //       {
  //         // username: "username",
  //         firstName: "first_name",
  //         lastName: "last_name",
  //         isAdmin: "is_admin"           
  //       });
  //   const usernameVarIdx = "$" + (values.length + 1);

  //   const querySql = `UPDATE users 
  //                     SET ${setCols} 
  //                     WHERE username = ${usernameVarIdx} 
  //                     RETURNING username,
  //                               first_name AS "firstName",
  //                               last_name AS "lastName",
  //                               email,
  //                               is_admin AS "isAdmin"`;
  //   const result = await db.query(querySql, [...values, username]);
  //   const user = result.rows[0];

  //   if (!user) throw new NotFoundError(`No user: ${username}`);

  //   delete user.password; //deleting password from response for security purposes
  //   return user;
  // }

  // /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

// 7/17 TRYING TO ADD LOGIC TO UPDATE USERNAME:
static async update(username, data) {
  // If a new username is provided, check for conflicts
  if (data.username && data.username !== username) {
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [data.username]);

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${data.username}`);
    }
  }

  // Hash the password if it's being changed
  if (data.password) {
    data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
  }

  const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
        username: "username" // Add mapping for username
      });
  const usernameVarIdx = "$" + (values.length + 1);

  const querySql = `UPDATE users 
                    SET ${setCols} 
                    WHERE username = ${usernameVarIdx} 
                    RETURNING username,
                              first_name AS "firstName",
                              last_name AS "lastName",
                              email,
                              is_admin AS "isAdmin"`;
  const result = await db.query(querySql, [...values, username]);
  const user = result.rows[0];

  if (!user) throw new NotFoundError(`No user: ${username}`);

  delete user.password; // Delete password from response for security purposes
  return user;
}

//OLD - WORKING

static async reviewPark(username, parkCode, { review_title, review_data, rating }) {
    // Find the user by username
    const userResult = await db.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
    );

    const user = userResult.rows[0];

    if (!user) {
        throw new Error("User not found");
    }

    // Insert the review into the reviews table
    const result = await db.query(
        `INSERT INTO reviewed_parks (user_id,username, park_code, review_title, review_data, rating)
         VALUES ($1, $2, $3, $4, $5, $6 )
         RETURNING id, user_id, username, park_code, review_title, review_data, rating, created_at`,
        [user.id, username, parkCode, review_title, review_data, rating]
    );

    return result.rows[0];
}


static async getReviewByUsername(username) {
    const userRes = await db.query(
        `SELECT u.username,
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                u.email,
                r.review_data AS "reviewData",
                r.rating,
                r.created_at AS "createdAt"
         FROM users u
         INNER JOIN reviews r ON u.username = r.username
         WHERE u.username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    // const userApplicationsRes = await db.query(
    //       `SELECT a.job_id
    //        FROM applications AS a
    //        WHERE a.username = $1`, [username]);

    // user.applications = userApplicationsRes.rows.map(a => a.job_id);
    return user;
  }


  static async getAllReviews() {
    const result = await db.query(
      `SELECT
              rp.park_code,
              rp.review_title,
              rp.review_data,
              rp.rating,
              rp.created_at,
              u.username                  
       FROM reviewed_parks rp
       JOIN users u ON rp.user_id = u.id
       ORDER BY rp.review_title`,
    );
  
    return result.rows;
  }

  static async getFavoritesByUsername(username) {

    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
  );

  const user = userResult.rows[0];

  if (!user) {
      throw new Error("User not found");
  }

    const result = await db.query(
      `SELECT
              fp.park_code,
              fp.park_description,
              fp.park_full_name,
              fp.park_image_url,
              fp.created_at,               
              u.username                  
       FROM favorited_parks fp
       JOIN users u ON fp.user_id = u.id
       ORDER BY fp.park_full_name`,
    );
  
    return result.rows;
  }

  //NEW 6.28.24

  // static async saveActivity(username, parkCode, { nps_activity_id }) {
  //   // Find the user by username
  //   const userResult = await db.query(
  //       "SELECT id FROM users WHERE username = $1",
  //       [username]
  //   );

  //   const user = userResult.rows[0];

  //   if (!user) {
  //       throw new Error("User not found");
  //   }

  //   // Insert the review into the reviews table
  //   const result = await db.query(
  //       `INSERT INTO saved_activities (user_id,username, park_code, nps_activity_id)
  //        VALUES ($1, $2, $3, $4)
  //        RETURNING id, user_id, username, park_code, nps_activity_id`,
  //       [user.id, username, parkCode, nps_activity_id]
  //   );

  //   return result.rows[0];

//NEW 7/18

static async saveActivities(username, parkCode, activities) {
  try {
    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      throw new Error("Invalid activities data");
    }

    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    const user = userResult.rows[0];

    if (!user) {
      throw new Error("User not found");
    }

    const insertPromises = activities.map(async (activity) => {
      try {
        const result = await db.query(
          `INSERT INTO saved_activities (user_id, username, park_code, nps_activity_id, name)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, user_id, username, park_code, nps_activity_id, name`,
          [user.id, username, parkCode, activity.id, activity.name]
        );

        return result.rows[0];
      } catch (err) {
        console.error(`Error inserting activity ${activity.id}:`, err);
        throw err;
      }
    });

    const savedActivities = await Promise.all(insertPromises);

    return savedActivities;
  } catch (err) {
    console.error('Error saving activities:', err);
    throw new Error('Failed to save activities');
  }
}



//OLD - WORKING


// static async saveActivities(username, parkCode, activities) {
//   // Find the user by username
//   const userResult = await db.query(
//     "SELECT id FROM users WHERE username = $1",
//     [username]
//   );

//   const user = userResult.rows[0];

//   if (!user) {
//     throw new Error("User not found");
//   }

//   // Prepare the data to insert multiple rows for each activity
//   const insertPromises = activities.map(async (activity) => {
//     const result = await db.query(
//       `INSERT INTO saved_activities (user_id, username, park_code, nps_activity_id, name)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING id, user_id, username, park_code, nps_activity_id, name`,
//       [user.id, username, parkCode, activity.id, activity.name]
//     );

//     return result.rows[0];
//   });

//   // Execute all insert operations concurrently
//   const savedActivities = await Promise.all(insertPromises);

//   return savedActivities;
// }





  //OLD
  // static async saveActivities(username, parkCode, nps_activity_ids) {
  //   // Find the user by username
  //   const userResult = await db.query(
  //     "SELECT id FROM users WHERE username = $1",
  //     [username]
  //   );
  
  //   const user = userResult.rows[0];
  
  //   if (!user) {
  //     throw new Error("User not found");
  //   }
  
  //   // Prepare the data to insert multiple rows for each activity ID
  //   const insertPromises = nps_activity_ids.map(async (nps_activity_id) => {
  //     const result = await db.query(
  //       `INSERT INTO saved_activities (user_id, username, park_code, nps_activity_id)
  //        VALUES ($1, $2, $3, $4)
  //        RETURNING id, user_id, username, park_code, nps_activity_id`,
  //       [user.id, username, parkCode, nps_activity_id]
  //     );
  
  //     return result.rows[0];
  //   });
  
  //   // Execute all insert operations concurrently
  //   const activities = await Promise.all(insertPromises);
  
  //   return activities;
  // }

  static async saveEvents(username, parkCode, eventData) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
    const result = await db.query(
      `INSERT INTO saved_events (user_id, username, park_code, event_id, title, description, selected_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, username, park_code, event_id,title,description, selected_date`,
      [user.id, username, parkCode, eventData.event_id, eventData.title, eventData.description, eventData.date]
    );
  
    return result.rows[0]; // return the saved event data
  
  
    // Prepare the data to insert multiple rows for each activity ID
    // const insertPromises = event_ids.map(async (event_id) => {
    //   const result = await db.query(
    //     `INSERT INTO saved_events (user_id, username, park_code, event_id)
    //      VALUES ($1, $2, $3, $4)
    //      RETURNING id, user_id, username, park_code, event_id`,
    //     [user.id, username, parkCode, event_id]
    //   );
  
    //   return result.rows[0];
    // });
  
    // // Execute all insert operations concurrently
    // const events = await Promise.all(insertPromises);
  
    // return events;
  }

  static async saveThingsToDo(username, parkCode, todoData) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
    const result = await db.query(
      `INSERT INTO saved_todo_things (user_id, username, todo_id, title, short_description, location_description, park_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, username, todo_id, title, short_description, location_description,park_code`,
      [user.id, username, todoData.todo_id, todoData.title, todoData.short_description, todoData.location_description, parkCode]
    );
  
    return result.rows[0]; // return saved event data  
  
  }
  static async getSavedThingsToDo(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, todo_id,park_code, title, short_description,location_description, created_at
                 FROM saved_todo_things
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    // if (parkCode) {
    //   query += " AND park_code = $2";
    //   params.push(parkCode);
    // }
  
    // Execute the query
    const todosResult = await db.query(query, params);
    const todos = todosResult.rows;
  
    return todos;

  }

  

  static async saveFees(username, parkCode, feeData) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
  
  
    // Prepare the data to insert multiple rows for each fee 
    const insertPromises = feeData.map(async (fee) => {

      // Ensure each fee has a title and cost, set default values if missing
    const title = fee.title || "Unknown Title";
    const cost = fee.cost || "0.00";

     
     
      const result = await db.query(
        `INSERT INTO saved_fees (user_id, username,park_code, title, cost)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, username,park_code, title, cost`,
        [user.id, username, parkCode, title, cost]
      );
  
      return result.rows[0];
    });
  
    // Execute all insert operations concurrently
    const fees = await Promise.all(insertPromises);
  
    return fees;
  }

  static async saveMap(username, parkCode, mapData) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  

      const result = await db.query(
        `INSERT INTO maps (user_id, username, park_code,latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, username,park_code, latitude, longitude`,
        [user.id, username, parkCode, mapData.latitude, mapData.longitude]
      );
  
      return result.rows[0];   
  
    
  
  
  }

  static async getMap(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, park_code, latitude, longitude, created_at
                 FROM maps 
                 WHERE user_id = $1`;
    const params = [user.id];
  

    // Execute the query
    const mapResult = await db.query(query, params);
    const map = mapResult.rows;
  
    return map;
  }

  static async getSavedFees(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, park_code, title 
                 FROM saved_fees 
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    if (parkCode) {
      query += " AND park_code = $2";
      params.push(parkCode);
    }
  
    // Execute the query
    const feesResult = await db.query(query, params);
    const fees = feesResult.rows;
  
    return fees;
  }

  static async getSavedActivities(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, nps_activity_id,park_code,
                 FROM saved_activities
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    // if (parkCode) {
    //   query += " AND park_code = $2";
    //   params.push(parkCode);
    // }
  
    // Execute the query
    const activitiesResult = await db.query(query, params);
    const activities = activitiesResult.rows;
  
    return activities;

    //////////////////  GET ALL ///////////////////////////
  }
  static async getAllSavedActivities(username) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, nps_activity_id,park_code, name, created_at
                 FROM saved_activities
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    // if (parkCode) {
    //   query += " AND park_code = $2";
    //   params.push(parkCode);
    // }
  
    // Execute the query
    const activitiesResult = await db.query(query, params);
    const activities = activitiesResult.rows;
  
    return activities;
  }
  static async getAllSavedEvents(username) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, event_id,park_code, title,description,selected_date, created_at
                 FROM saved_events
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    // if (parkCode) {
    //   query += " AND park_code = $2";
    //   params.push(parkCode);
    // }
  
    // Execute the query
    const eventsResult = await db.query(query, params);
    const events = eventsResult.rows;
  
    return events;
  }

  

  static async getAllSavedFees(username) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, park_code, title, cost, created_at 
                 FROM saved_fees 
                 WHERE user_id = $1`;
    
    const params = [user.id];
    // Execute the query
    const feesResult = await db.query(query, params);
    const fees = feesResult.rows;
  
    return fees;
  }
  static async getSavedEvents(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, event_id,park_code, title,description, selected_date
                 FROM saved_events
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    // if (parkCode) {
    //   query += " AND park_code = $2";
    //   params.push(parkCode);
    // }
  
    // Execute the query
    const eventsResult = await db.query(query, params);
    const events = eventsResult.rows;
  
    return events;

    //////////////////  GET ALL ///////////////////////////
  }




  ////////////////////////////////////////////////

  /* WORKING ON THIS STILL>>>> NOT SURE IF NEEDED */

  static async getDetailsByParkCode(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, park_code, title 
                 FROM saved_fees 
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    if (parkCode) {
      query += " AND park_code = $2";
      params.push(parkCode);
    }
  
    // Execute the query
    const detailsResult = await db.query(query, params);
    const details = detailsResult.rows;
  
    return details;
  }

  //new 7/5
  static async saveFavorite(username, parkCode, favoriteData) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Log favoriteData to debug
    console.log('Favorite Data in saveFavorite:', favoriteData);
  
    const result = await db.query(
      `INSERT INTO favorited_parks (user_id, username, park_id, park_code, park_description, park_full_name, park_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, username, park_id, park_code, park_description, park_full_name, park_image_url`,
      [
        user.id,
        username,
        favoriteData.park_id,
        parkCode,
        favoriteData.park_description,
        favoriteData.park_full_name,
        favoriteData.park_image_url
      ]
    );
  
    return result.rows[0]; // return saved event data
  }

// WORKING 7/5
  // static async saveFavorite(username, parkCode, favoriteData) {
  //   // Find the user by username
  //   const userResult = await db.query(
  //     "SELECT id FROM users WHERE username = $1",
  //     [username]
  //   );
  
  //   const user = userResult.rows[0];
  
  //   if (!user) {
  //     throw new Error("User not found");
  //   }

  //     // Log favoriteData to debug
  // console.log('Favorite Data in saveFavorite:', favoriteData);

  //   const result = await db.query(
  //     `INSERT INTO favorited_parks (user_id, username, park_id, park_code)
  //      VALUES ($1, $2, $3, $4)
  //      RETURNING id, user_id, username, park_id, park_code`,
  //     [user.id, username, favoriteData.park_id, parkCode]
  //   );
  
  //   return result.rows[0]; // return saved event data  
  
  // }

  static async getSavedFavorites(username, parkCode = null) {
    // Find the user by username
    const userResult = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
  
    const user = userResult.rows[0];
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Prepare the query and parameters
    let query = `SELECT id, user_id, username, park_id,park_code,park_description, park_full_name, park_image_url, created_at
                 FROM favorited_parks
                 WHERE user_id = $1`;
    const params = [user.id];
  
    // Add park code filter if provided
    // if (parkCode) {
    //   query += " AND park_code = $2";
    //   params.push(parkCode);
    // }
  
    // Execute the query
    const favoritesResult = await db.query(query, params);
    const favorites = favoritesResult.rows;
  
    return favorites;

    //////////////////  GET ALL ///////////////////////////
  }


  /* NOT BEING USED.... not working yet */
  //working on this.... 7/5

  // static async getAllSavedFavorites(username) {
  //   // Find the user by username
  //   const userResult = await db.query(
  //     "SELECT id FROM users WHERE username = $1",
  //     [username]
  //   );
  
  //   const user = userResult.rows[0];
  
  //   if (!user) {
  //     throw new Error("User not found");
  //   }
  
  //   // Prepare the query and parameters
  //   let query = `SELECT id, user_id, username, park_id,park_code, created_at
  //                FROM favorited_parks
  //                WHERE user_id = $1`;
  //   const params = [user.id];
  
  //   // Add park code filter if provided
  //   // if (parkCode) {
  //   //   query += " AND park_code = $2";
  //   //   params.push(parkCode);
  //   // }
  
  //   // Execute the query
  //   const favoritesResult = await db.query(query, params);
  //   const favorites = favoritesResult.rows;
  
  //   return favorites;
  // }



}








//     // Insert the review into the reviews table
//     const result = await db.query(
//         `INSERT INTO saved_activities (user_id,username, park_code, nps_activity_id, activity_name)
//          VALUES ($1, $2, $3, $4, $5)
//          RETURNING id, user_id, username, park_code, nps_activity_id, activity_name`,
//         [user.id, username, parkCode, nps_activity_id, activity_name]
//     );

//     return result.rows[0];
// }
  

module.exports = User;
