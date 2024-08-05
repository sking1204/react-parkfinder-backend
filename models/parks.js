const key = 'xq9ztV2dekQAgfKWgZ5wbUxOrzYPUgqbz8gURKGm';

const axios = require('axios');

class Park {
    constructor(id){
        this.id = id;
    }

//     async getMapByParkLocation(){
//         var map = L.map('map').setView([25.97079602, -81.08120629], 10);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
    
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);
//     }

//WILL NEED TO UPDATE THIS TO INCLUDE ALL PARKS IN US
//LIMITING TO FL FOR NOW FOR RATE LIMITING PURPOSES

    static async getAllFLParks(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?stateCode=FL`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    //WORKING VERSION
    // static async getAllParks() {
    //     const apiKey = key  
    //     const baseUrl = 'https://developer.nps.gov/api/v1/parks';
    //     const limit = 50;  // Maximum allowed limit per request
    //     let start = 0;
    //     let allParks = [];
        
    
    //     try {
    //       // Initial request to get the total number of results and the first set of data
    //       let res = await axios.get(baseUrl, {
    //         headers: {
    //           'X-Api-Key': apiKey
    //         },
    //         params: {
    //           limit: limit,
    //           start: start
    //         }
    //       });
    
    //       // Extract data from the initial response
    //       let data = res.data;
    //       let totalResults = data.total;
    //       allParks = data.data;
    
    //       // Loop to get all pages
    //       while (allParks.length < totalResults) {
    //         start += limit;
    //         res = await axios.get(baseUrl, {
    //           headers: {
    //             'X-Api-Key': apiKey
    //           },
    //           params: {
    //             limit: limit,
    //             start: start
    //           }
    //         });
    
    //         // Add the results from this request to the allParks array
    //         allParks = allParks.concat(res.data.data);
    //       }
    
    //       return allParks;
    
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //     //   throw error;  // Optionally re-throw the error to be handled by the caller
    //     }
    //   }

    //NEW VERSION:
    static async getAllParks() {
        const apiKey = key  
        const baseUrl = 'https://developer.nps.gov/api/v1/parks';
        const limit = 50;  // Maximum allowed limit per request
        let start = 0;
        let allParks = [];
        let allParkCodes = [];
        let allParkNames = [];
        
    
        try {
          // Initial request to get the total number of results and the first set of data
          let res = await axios.get(baseUrl, {
            headers: {
              'X-Api-Key': apiKey
            },
            params: {
              limit: limit,
              start: start
            }
          });
    
          // Extract data from the initial response
          let data = res.data;
          let totalResults = data.total;
          allParks = data.data;           
          allParkCodes = data.data.map(park => park.parkCode);
          allParkNames = data.data.map(park => park.fullName);
    
          // Loop to get all pages
          while (allParks.length < totalResults) {
            start += limit;
            res = await axios.get(baseUrl, {
              headers: {
                'X-Api-Key': apiKey
              },
              params: {
                limit: limit,
                start: start
              }
            });
    
            // Add the results from this request to the allParks array
            allParks = allParks.concat(res.data.data);
            allParkCodes = allParkCodes.concat(res.data.data.map(park =>park.parkCode));
            allParkNames = allParkNames.concat(res.data.data.map(park => park.fullName))
            
          }
    
          return {
            parks: allParks,
            parkCodes: allParkCodes,
            parkNames: allParkNames
          }
    
        } catch (error) {
          console.error('Error fetching data:', error);
        //   throw error;  // Optionally re-throw the error to be handled by the caller
        }
      }
    

    static async getParksStateList(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
         // Extract the list of parks from the response
         let parks = res.data.data;

         // Extract the states from each park and flatten the list
         let states = parks.map(park => park.states.split(',')).flat();
 
         // Remove duplicates by converting the array to a Set and back to an array
         let uniqueStates = [...new Set(states)];
 
         return uniqueStates;
         
     } catch(error){
         console.error('Error fetching data:', error);
     }
 }

    static async getParkCodesList(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
         // Extract the list of parks from the response
         let parks = res.data.data;

         // Extract the states from each park and flatten the list
         let stateCodes = parks.map(park => park.parkCode.split(',')).flat();
 
         // Remove duplicates by converting the array to a Set and back to an array
         let uniqueStateCodes = [...new Set(stateCodes)];
 
         return uniqueStateCodes;
         
     } catch(error){
         console.error('Error fetching data:', error);
     }
 }




    static async getParksByState(stateCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    

  
    static async getParkByCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getAlertsByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/alerts?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }



    //limiting results for now so we don't exceed our api call rate
    static async getAllAmenities(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/amenities?limit=5`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getAmenitiesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/amenities?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

  //limiting results for now so we don't exceed our api call rate

    static async getAllActivities(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/activities?limit=5`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }



    static async getActivitiesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        console.log(res.data.data[0].activities);
        return res.data.data[0].activities;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }
    
    
    static async getAllVisitorCenters(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/visitorcenters?limit=5`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }


    static async getVisitorCentersByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/visitorcenters?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }


    static async getVisitorCenterAmenitiesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/amenities/parksvisitorcenters?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    } 



    static async getEventsByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/events?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getEventsByStateCode(stateCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/events?stateCode=${stateCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getEntranceFeesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
              
        return res.data.data[0].entranceFees;
                
        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getEntrancePassesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
              
        return res.data.data[0].entrancePasses;
                
        }catch(error){
        console.error('Error fetching data:', error);
        }
    }




    static async getParkingLotsByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parkinglots?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getImagesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data.data[0].images);
        return res.data.data[0].images;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getNewsReleasesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/newsreleases?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        if(! res.data.data || res.data.data.length === 0){
            return {message: "Data not yet available."}
        }
        // console.log(res.data);
        return res.data;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }


//limiting results for now so we don't exceed our api call rate

    static async getThingsToDoByParkCode(parkCode){         
        
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/thingstodo?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        // console.log(res.data);
        return res.data;
        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

//limiting results for now so we don't exceed our api call rate
//NOT SURE WHY THIS LIMIT appears as "5" in insomnia when we are setting the limit to 3 below.
//API says default is 50 but I keep getting 5 results?

//not sure if we will use this api call yet....

    async getParkTours(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/tours`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        console.log(res.data);

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }

    static async getCoordinatesByParkCode(parkCode){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        console.log(res.data.data[0].latLong);
        return res.data.data[0].latLong;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }
    


////
//~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~

//NOT USING THESE API CALLS FOR NOW
//GET ALL EVENTS 
     //This route won't work because events is not part of the park response data

    static async getAllEvents(){
        const apiKey = key;
        try{
            let res = await axios.get(`https://developer.nps.gov/api/v1/events`,
            {headers:{
                'X-Api-Key': apiKey
            }
        });
        console.log(res.data.data[0].events);
        return res.data.data[0].events;

        }catch(error){
        console.error('Error fetching data:', error);
        }
    }
   
 
      
 //NOT WORKING AS EXPECTED
 //NOT ABLE TO LIMIT RESULTS FOR GET ALL EVENTS
    //Limit query string doesn't appear to be working
    // static async getAllEvents(){
    //     const apiKey = key;
    //     try{
    //         let res = await axios.get(`https://developer.nps.gov/api/v1/events?limit=1`,
    //         {headers:{
    //             'X-Api-Key': apiKey
    //         }
    //     });
    //     // console.log(res.data);
    //     return res.data;

    //     }catch(error){
    //     console.error('Error fetching data:', error);
    //     }
    // }

////
//~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~






}

module.exports = Park;

