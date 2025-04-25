import fetch from 'node-fetch'
import { config } from 'dotenv';
import { trace } from 'console';
import promptSync from 'prompt-sync';

const prompt = promptSync();

const api_key = process.env.API_KEY;

config()


const busStopCode = '490008660N';
let stopType = 'NaptanPublicBusCoachTram';

async function getArrivalsFromTfl(stopPointId) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
        const responseBody = await response.json();
        return responseBody;
    }
    catch (err) {
        console.log(err);
    }
}

async function getBusStopArrivals(busStopCode) {

    try {
            let busData = await getArrivalsFromTfl(busStopCode);

            busData = busData.slice(0, 5).map(element => {
                
                let timeToWait = Math.floor(element.timeToStation / 60);
                return element.lineName + ', ' + element.towards + ', ' + `${timeToWait} minutes`;
            });

            return busData;

    }
    catch (err) {
        console.log(err);
    }
}

async function getPostCodeData() {
    let postcode = prompt("Please enter a postcode ");
    try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}/`);
        const responseBody = await response.json();
        return [responseBody.result.latitude, responseBody.result.longitude];
    } catch (err) {
        console.log(err);
    }
}

async function getStopPoints(coordinates) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${coordinates[0]}&lon=${coordinates[1]}&stopTypes=${stopType}`);
        const responseBody = await response.json();
        return responseBody.stopPoints;

    } catch (err) {
        console.log(err);
    }
}


// getBusStopArrivals(busStopCode);

async function transportSpots() {
    try {
        let response = '';
        let coordinates = await getPostCodeData();
        let busStops = await getStopPoints(coordinates);

        //you want to declare an object 
        //you want to display the properties of the results as an object 
        
        let busStopInfo = {};

        for (let i in busStops) {
            busStopInfo[busStops[i].indicator] = {};
            busStopInfo[busStops[i].indicator]['Arrivals'] = await getBusStopArrivals(busStops[i].naptanId);
            };
         return busStopInfo;
    }
    catch (err) {
        console.log(err);
    }
}

console.log(await transportSpots());

//code notes:
//responseArray not a good name - be more accurate 
//avoid arrays where elements are too different, in that case make an object. Use response directly to pass into arrays instead of assigning to var
//result isn't a great name, use language similar to the company/problem you're solving
//simplimfy getbusstoparrivals so it onlt gets data, manipulate data in another function 
//add a function for formatting the output 

