"use strict";
/* User routes */

const jsonschema = require("jsonschema")
const express = require("express");

const { BadRequestError } = require("../expressError");
const Park = require("../models/parks");



const router = express.Router();



router.get("/FL-parks", async function(req,res, next){
    try{
        const parks = await Park.getAllFLParks();
        return res.json({parks});
    } catch (err){
        return next(err);
    }
});

router.get("/", async function(req,res, next){
    try{
        const parks = await Park.getAllParks();
        console.log(`Total parks retrieved: ${parks.parks.length}`)
        console.log(`Total park codes retrieved: ${parks.parkCodes.length}`)
        return res.json({parks});
    } catch (err){
        return next(err);
    }
});

router.get("/stateCodes", async function(req,res,next){
    try{        
        const StateCodes = await Park.getParksStateList();
        return res.json({StateCodes});
    } catch(err){
        return next (err);
    }
});

router.get("/parkCodes", async function(req,res,next){
    try{
        
        const {parkCodes} = await Park.getAllParks();
        return res.json({parkCodes});
    } catch(err){
        return next (err);
    }
});

router.get("/parkNames", async function(req,res,next){
    try{
    
        const {parkNames} = await Park.getAllParks();
        return res.json({parkNames});
    } catch(err){
        return next (err);
    }
});



//NOT USED////////////////////
// router.get("/allParkCodes", async function(req,res,next){
//     try{
        
//         const parkCodes = await Park.getAllParkCodesList();
//         return res.json({parkCodes});
//     } catch(err){
//         return next (err);
//     }
// });



router.get("/stateCode/:stateCode", async function(req,res,next){
    try{
        const stateCode = req.params.stateCode;
        const parkState = await Park.getParksByState(stateCode);
        return res.json({parkState});
    } catch(err){
        return next (err);
    }
});


router.get("/parkCode/:parkCode", async function(req,res,next){
    try{
        const parkCode = req.params.parkCode;
        const park = await Park.getParkByCode(parkCode);
        return res.json({park});
    } catch(err){
        return next (err);
    }
});


router.get("/alerts/:parkCode", async function(req,res,next){
    try{
        const parkCode = req.params.parkCode;
        const alerts = await Park.getAlertsByParkCode(parkCode);
        return res.json({alerts});
    } catch(err){
        return next(err);
    }
});


router.get("/amenities", async function(req,res,next){
    try{
        const amenitiesRes = await Park.getAllAmenities();
        return res.json({amenitiesRes});
    }catch(err){
        return next(err);
    }
});

router.get("/amenities/:parkCode", async function(req,res,next){
    try{
        const parkCode = req.params.parkCode;
        const amenitiesRes = await Park.getAmenitiesByParkCode(parkCode);
        return res.json({amenitiesRes});
    }catch(err){
        return next(err);
    }
});

router.get("/activities", async function(req,res,next){
    try{         
        const activitiesRes = await Park.getAllActivities();
        return res.json({activitiesRes});
    }catch(err){
        return next(err);
    }
});


router.get("/activities/:parkCode", async function(req,res,next){
    try{
        const parkCode = req.params.parkCode;
        const activitiesRes = await Park.getActivitiesByParkCode(parkCode);
        return res.json({activitiesRes});
    }catch(err){
        return next(err);
    }
});

router.get("/visitor-centers", async function(req,res,next){
    try{         
        const visitorCenterRes = await Park.getAllVisitorCenters();
        return res.json({visitorCenterRes});
    }catch(err){
        return next(err);
    }
});

router.get("/visitor-centers/:parkCode", async function(req,res,next){
    try{       
        const parkCode = req.params.parkCode;  
        const visitorCenterRes = await Park.getVisitorCentersByParkCode(parkCode);
        return res.json({visitorCenterRes});
    }catch(err){
        return next(err);
    }
});

router.get("/visitor-centers/amenities/:parkCode", async function(req,res,next){
    try{       
        const parkCode = req.params.parkCode;  
        const visitorCenterRes = await Park.getVisitorCenterAmenitiesByParkCode(parkCode);
        return res.json({visitorCenterRes});
    }catch(err){
        return next(err);
    }
});

router.get("/visitor-centers/amenities/:parkCode", async function(req,res,next){
    try{       
        const parkCode = req.params.parkCode;  
        const visitorCenterRes = await Park.getVisitorCenterAmenitiesByParkCode(parkCode);
        return res.json({visitorCenterRes});
    }catch(err){
        return next(err);
    }
});

router.get("/events", async function(req,res,next){
    try{       
        const eventsRes = await Park.getAllEvents();
        return res.json({eventsRes});
    }catch(err){
        return next(err);
    }
});


router.get("/events/:parkCode", async function(req,res,next){
    try{  
        const parkCode = req.params.parkCode;     
        const eventsRes = await Park.getEventsByParkCode(parkCode);
        return res.json({eventsRes});
    }catch(err){
        return next(err);
    }
});

router.get("/events/:stateCode", async function(req,res,next){
    try{  
        const stateCode = req.params.stateCode;     
        const eventsRes = await Park.getEventsByParkCode(stateCode);
        return res.json({eventsRes});
    }catch(err){
        return next(err);
    }
});

router.get("/entrance-fees/:parkCode", async function(req,res,next){
    try{  
        const parkCode = req.params.parkCode;     
        const fees = await Park.getEntranceFeesByParkCode(parkCode);
        return res.json({fees});
    }catch(err){
        return next(err);
    }
});

router.get("/parking-lots/:parkCode", async function(req,res,next){
    try{  
        const parkCode = req.params.parkCode;     
        const parking = await Park.getEntrancePassesByParkCode(parkCode);
        return res.json({parking});
    }catch(err){
        return next(err);
    }
});

router.get("/images/:parkCode", async function(req,res,next){
    try{  
        const parkCode = req.params.parkCode;     
        const images = await Park.getImagesByParkCode(parkCode);
        return res.json({images});
    }catch(err){
        return next(err);
    }
});

// router.get("/images/:parkCode", async function(req,res,next){
//     try{  
//         const parkCode = req.params.parkCode;     
//         const images = await Park.getImagesByParkCode(parkCode);
//         return res.json({images});
//     }catch(err){
//         return next(err);
//     }
// });

router.get("/news-releases/:parkCode", async function(req,res,next){
    try{  
        const parkCode = req.params.parkCode;     
        const news = await Park.getNewsReleasesByParkCode(parkCode);
        return res.json({news});
    }catch(err){
        return next(err);
    }
});

//FIND A WAY TO MAYBE FILTER RESULTS ON THE FRONT END??

router.get("/things-to-do/:parkCode", async function(req,res,next){     
    try{ 
        const parkCode = req.params.parkCode;
        const thingsToDo = await Park.getThingsToDoByParkCode(parkCode);
        return res.json({thingsToDo});
    }catch(err){
        return next(err);
    }
});

//FIND A WAY TO MAYBE FILTER RESULTS ON THE FRONT END??

router.get("/park-tours", async function(req,res,next){
    try{        
        const parkTours = await Park.getThingsToDo();
        return res.json({parkTours});
    }catch(err){
        return next(err);
    }
});

router.get("/coordinates/:parkCode", async function(req,res,next){
    try{  
        const parkCode = req.params.parkCode;     
        const coords = await Park.getCoordinatesByParkCode(parkCode);
        return res.json({coords});
    }catch(err){
        return next(err);
    }
});














module.exports = router;