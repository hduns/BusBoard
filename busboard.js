import fetch from 'node-fetch'
import { config } from 'dotenv';

const api_key = process.env.API_KEY;

config()


async function getArrivalsFromTfl(stopPointId) {
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
    const responseBody = await response.json();
    return responseBody;
}

const busStopCode = '490008660N'

const lineName = (await getArrivalsFromTfl(busStopCode))[0].lineName;

async function getBusStopArrivals(busStopCode) {
    let busData = await getArrivalsFromTfl(busStopCode);
    busData.slice(0, 5).forEach(element => {
        let timeToWait = Math.floor(element.timeToStation /60) 
        console.log(element.lineName + ', ' + element.towards + ', ' + `${timeToWait} minutes`);
    });
}

getBusStopArrivals(busStopCode);

