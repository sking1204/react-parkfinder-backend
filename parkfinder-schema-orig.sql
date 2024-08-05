CREATE TABLE parks (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,  
  images_url TEXT,
  nps_id TEXT NOT NULL UNIQUE
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


CREATE TABLE reviewed_park (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,    
  park_id INTEGER 
    REFERENCES parks(id) ON DELETE CASCADE,      
  review_data TEXT,
  rating INTEGER CHECK(rating >=1 AND rating <=5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorited_parks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  park_id INTEGER NOT NULL
    REFERENCES parks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, park_id)
);

CREATE TABLE saved_itineraries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  park_id INTEGER NOT NULL
    REFERENCES parks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  itinerary_name TEXT NOT NULL,
  itinerary_details TEXT,
  coords TEXT
);
