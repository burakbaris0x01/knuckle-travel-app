

// ALL THIS SECITON IS MAKING AN API CALL TO THE WEATHER FORECAST SERVICE THEN 
// SANITIZING THE INPUT. MAKING IT LOOK PRETTIER AND SENDING IT BACK TO THE 
// CLIENT. ORIGINAL RESPONSE IS NOT USER FRIENDLY.
const weatherForecast = async (req,resp,next)=>{
    if (!String(req.originalUrl).includes("/weatherForecast") && req.body.weather !== "yes") {
      return next()
    }
    
    address = `${req.query.Country} ${req.query.Region} ${req.query.City}`
    const request = `https://api.openweathermap.org/data/3.0/onecall?lat=${req.lat}&lon=${req.long}&appid=ee9b2a7706cbd56d1cddc044386e9fe5`
    const result = await fetch(request,{
      method:"GET",
    }).then(res=>res.json())
    if (!result.daily) {
      return resp.status(502).send({"status":"error","message":"Weather service is unavailable.","data":""})
    }
    weatherArray = new Array() 
    weatherArray.push({"Location":address,"Timezone":result.timezone})
    for (let i = 0;i<7;i++){
      template = {
      "Date":new Date( result["daily"][i]["dt"] *1000),
      "Condition":result["daily"][i]["weather"]["0"]["main"],
      "Description":result["daily"][i]["weather"]["0"]["description"],
      "Temperature Max":new String(result["daily"][i]["temp"]["max"]-273).substring(0,5),
      "Temperature Min":new String(result["daily"][i]["temp"]["min"]-273).substring(0,5),
      "Temperature Day":new String(result["daily"][i]["temp"]["day"]-273).substring(0,5),
      "Temperature Night":new String(result["daily"][i]["temp"]["night"]-273).substring(0,5),
      "Feels Like Day":new String(result["daily"][i]["feels_like"]["day"]-273).substring(0,5),
      "Feels Like Night":new String(result["daily"][i]["feels_like"]["night"]-273).substring(0,5),
      "Pressure": result["daily"][i]["pressure"],
      "Humidity":`%${result["daily"][i]["humidity"]}`
    },
      weatherArray.push(template) 
    }                
    req.weatherForecast = weatherArray
    next()  
  }
  
  module.exports = weatherForecast
