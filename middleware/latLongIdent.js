
// GET LAT LONG VALUES FROM THE GEOLOCATION API BY PROVIDING 
// LOCATION INFORMATION
const getLatLong = async (req,resp,next)=>{
    const suggestedLocation = req.body && req.body.suggestion
    if (suggestedLocation && Number.isFinite(Number(suggestedLocation.lat)) && Number.isFinite(Number(suggestedLocation.long))) {
      req.lat = Number(suggestedLocation.lat)
      req.long = Number(suggestedLocation.long)
      return next()
    }

    // IF THE CLIENT RUNNING THIS MIDDLEWARE BY CALLING THE 
    // /weatherForecast ENDPOINT, GATHER THE LOCATION INFORMATION 
    // FROM THE QUERY PARAMETERS. THIS BLOCK OF CODE BEING EXECUTED
    // WHEN USER MANUALLY QUERIES THE ENDPOINT.
    if (String(req.originalUrl).includes("/weatherForecast")){
      address = `${req.query.Country} ${req.query.Region} ${req.query.City}`
      if(!req.query.Country || !req.query.Region || !req.query.City){
        return resp.send("Please provide location.")
      }
    }else{
      // THIS GEOLOCATION SERVICE IS ALSO NEEDED WHEN USER SUBMITS
      // A NEW TRIP PROPOSAL. IN THAT CASE, CLIENT DOES NOT CALL FOR  
      // ./weatherForecast ENDPOINT. BUT THIS MIDDLEWARE GETS EXECUTED REGARDLESS.
      // WHEN SUBMITTING THE TRIP WITH A POST REQUEST, 
      // THE LOCATION INFO LOCATED IN THE BODY.
      addressJson = req.body.suggestion
      if (!addressJson || !addressJson.Country || !addressJson.Region || !addressJson.City) {
        return resp.status(400).send({"status":"error","message":"Please provide location.","data":""})
      }
      address = `${addressJson.Country} ${addressJson.Region} ${addressJson.City}`
    }
    
    // MAKE AN API CALL FOR RESULTS.
    try {
      const request = `https://maps.googleapis.com/maps/api/geocode/json?new_forward_geocoder=true&address=${encodeURIComponent(address)}&key=AIzaSyABpH3dmVKd4eO9aPrlR_-khjhJ4em9wz0`
      const result = await fetch(request,{
        method:"GET",
      }).then(res=>res.json())

      if (!result.results || !result.results[0]) {
        return resp.status(502).send({"status":"error","message":"Location coordinates could not be found.","data":""})
      }

      req.lat = result.results[0].geometry.location.lat
      req.long = result.results[0].geometry.location.lng
      next()
    } catch (error) {
      return resp.status(502).send({"status":"error","message":"Location service is unavailable.","data":""})
    }
    
  }
  
  module.exports = getLatLong
