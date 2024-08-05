CREATE TABLE parks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,  
  images_url TEXT,
  nps_id TEXT NOT NULL UNIQUE,
  latitue INTEGER NOT NULL,
  longitute INTEGER NOT NULL,
  latLong TEXT NOT NULL

);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE maps (
  id SERIAL PRIMARY KEY, 
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,  
  name TEXT,
  description TEXT,  
  latitude TEXT,
  longitude TEXT,
  park_code TEXT, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);


CREATE TABLE itinerary_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  park_id INTEGER NOT NULL
    REFERENCES parks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  itinerary_name TEXT,
  itinerary_details TEXT,
  maps_id INTEGER UNIQUE
    REFERENCES maps(id) ON DELETE SET NULL,
  coords TEXT
);

CREATE TABLE saved_itineraries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  itinerary_items_id INTEGER NOT NULL    
    REFERENCES itinerary_items(id) ON DELETE CASCADE
);

/* ADDED 6/28 */

CREATE TABLE saved_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  nps_activity_id TEXT,
  name TEXT,
  park_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
);

/* Added 6/28 */
CREATE TABLE saved_fees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT,
  cost TEXT,
  -- activity_name TEXT,
  park_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
);

CREATE TABLE saved_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  event_id TEXT,
  selected_date TEXT,
  -- cost TEXT,
  description TEXT,
  title TEXT,
  -- activity_name TEXT,
  park_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
);

CREATE TABLE saved_todo_things (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  todo_id TEXT,
  title TEXT,
  short_description TEXT,
  location_description TEXT,
  -- activity_name TEXT,
  park_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
);





CREATE TABLE reviewed_parks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
  REFERENCES users(id) ON DELETE CASCADE, 
  username TEXT NOT NULL,     
  -- park_id INTEGER NOT NULL
    -- REFERENCES parks(id) ON DELETE CASCADE, 
  park_code TEXT,  
  review_title TEXT NOT NULL,            
  review_data TEXT,
  rating INTEGER CHECK(rating >=1 AND rating <=5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE favorited_parks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL, 
  park_id TEXT,    
  park_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- UNIQUE(user_id, park_id)
  park_description TEXT,
  park_full_name TEXT,
  park_image_url TEXT
);







