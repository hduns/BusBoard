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
        const busStopResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
        const busStopResponseBody = await busStopResponse.json();
        return busStopResponseBody;
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
        const postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcode}/`);
        const postCodeResponseBody = await postCodeResponse.json();
        return [postCodeResponseBody.result.latitude, postCodeResponseBody.result.longitude];
    } catch (err) {
        console.log(err);
    }
}

async function getNearestStopPoints(coordinates) {
    try {
        const nearByBusStopresponse = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${coordinates[0]}&lon=${coordinates[1]}&stopTypes=${stopType}`);
        const nearByBusStopresponseBody = await nearByBusStopresponse.json();
        return nearByBusStopresponseBody.stopPoints;
    } catch (err) {
        console.log(err);
    }
}

async function transportSpots() {
    try {
        let coordinates = await getPostCodeData();
        let busStops = await getNearestStopPoints(coordinates);
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



