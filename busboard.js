import fetch from 'node-fetch'
import { config } from 'dotenv';
import { trace } from 'console';

const api_key = process.env.API_KEY;

config()

const busStopCode = '490008660N';
let postcode = 'BR49EW';
let stopType = 'NaptanPublicBusCoachTram';

async function getArrivalsFromTfl(stopPointId) {
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
    const responseBody = await response.json();
    return responseBody;
}

async function getBusStopArrivals(busStopId) {
    let busData = await getArrivalsFromTfl(busStopId);
    busData.slice(0, 5).forEach(element => {
        let timeToWait = Math.floor(element.timeToStation /60) 
        console.log(element.lineName + ', ' + element.towards + ', ' + `${timeToWait} minutes`);
    });
}

async function getPostCodeData(postcode) {
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
        const response = await fetch (`https://api.tfl.gov.uk/StopPoint/?lat=${coordinates[0]}&lon=${coordinates[1]}&stopTypes=${stopType}`);
        const responseBody = await response.json();
        return responseBody;
    
    } catch (err) {
        console.log(err);
    }
}

// getBusStopArrivals(busStopCode);

async function transportSpots(postcode) {
    let coordinates = await getPostCodeData(postcode);
    let result = await getStopPoints(coordinates);
    return result.stopPoints[0].modes;
}

console.log(await transportSpots(postcode));




