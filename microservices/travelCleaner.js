

const Travel = require('../model/travels')

const travelCleaner = async ()=>{

    // QUERIES THE DATABASE IN SOME INTERVAL TO SEE IF THERE IS 
    // ANY TRIP WITH NO INTERESTED USER. IF THERE IS, DROP THAT TRIP.
    const match = await Travel.find({  }).lean()
    for (let i=0;i<match.length;i++){

        if (match[i].interestedUsers.length == 0){
            await Travel.deleteOne({"locationId":match[i].locationId})
        }

    }
}

const clean = async()=>{
    setInterval(() => {
        travelCleaner();
      }, 1000)
}

clean()

