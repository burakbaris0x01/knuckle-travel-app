
// MAKE THE CALL FOR THE /weatherForecast ENDPOINT BY 
// PROVIDING LOCATION INFO TO RETRIEVE WEATHER FORECAST.
async function weatherForecast(locationInfoJson){
   
    City = locationInfoJson.City //|| $('#city')[0].value 
    Region = locationInfoJson.Region //||$('#region')[0].value
    Country = locationInfoJson.Country //|| $("#country option:selected").text();

    if(!City || !Region || !Country){
      alerts("warning","Please select for all boxes.")
      return
    }
    window.open(
      `/weatherForecast?Country=${encodeURIComponent(Country)}&City=${encodeURIComponent(City)}&Region=${encodeURIComponent(Region)}`,
      'Forecast',
      'width=600,height=600')
  
  }
  
