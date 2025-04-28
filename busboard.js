import fetch from 'node-fetch'
import { config } from 'dotenv';
import { trace } from 'console';
import promptSync from 'prompt-sync';

const prompt = promptSync();
const api_key = process.env.API_KEY;

config()

// const stopPointId = '490008660N567';
let stopType = 'NaptanPublicBusCoachTram';
// let postcode = '';

async function getArrivalsFromTfl(stopPointId) {
    try {
        const busStopResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
        const busStopResponseBody = await busStopResponse.json();
        if (busStopResponse.status === 200){
            return busStopResponseBody;
        }
        else {
             throw new Error(busStopResponseBody.httpStatusCode + ' ' + busStopResponseBody.message);
        }
    }
    catch (err) {
        return err
    }
}

async function getBusStopArrivals(busStopCode) {
    try {
        let busData = await getArrivalsFromTfl(busStopCode);
        if(busData.length === 0) {
            return 'no buses coming'
        }
        else {
        busData = busData.slice(0, 5).map(element => {
            let timeToWait = Math.floor(element.timeToStation / 60);
            return element.lineName + ', ' + element.towards + ', ' + `${timeToWait} minutes`;
        });
        return busData;
}
    }
    catch (err) {
        console.log(err);
    }
}

async function getPostCodeData() {
    let postcode = prompt("Please enter a postcode ");
    postcode = postcode.replaceAll(' ','');
    try {
        let enteredPC = false;
        let postCodeRegex = '^\w{5,7}$^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([AZa-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))[0-9][A-Za-z]{2})$';
        while (!(enteredPC)) {
            if (postcode === 'null' || (!postcode.match(postCodeRegex))) {
                postcode = prompt("Please enter a valid postcode ");
                postcode = postcode.replaceAll(' ','');
            }
            else if (postcode.match(postCodeRegex)) {
                enteredPC = true;
            }
            
        } 

        const postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcode}/`);
        const postCodeResponseBody = await postCodeResponse.json();
        if(postCodeResponseBody.status === 200) {
            return [postCodeResponseBody.result.latitude, postCodeResponseBody.result.longitude];
        }
        else {
           throw new Error(postCodeResponseBody.status + ' ' + postCodeResponseBody.error);
        }
        
    } catch (err) {
        console.log(err);
        
    }
}

// let coordinates = [5373825, 637383]

async function getNearestStopPoints(coordinates) {
    try {
        const nearByBusStopresponse = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${coordinates[0]}&lon=${coordinates[1]}&stopTypes=${stopType}`);
        const nearByBusStopresponseBody = await nearByBusStopresponse.json();

        if (nearByBusStopresponse.status === 200) {
            if (nearByBusStopresponseBody.stopPoints.length === 0) {
                return 'no bus stops nearby'
            } else {
                return nearByBusStopresponseBody.stopPoints;
            }
        } else {
             throw new Error(nearByBusStopresponseBody.httpStatusCode + ' ' + nearByBusStopresponseBody.message);
        }
    }
    catch (err) {
        return err
    }
}

async function transportSpots() {
    try {
        let coordinates = await getPostCodeData();
        let busStops = await getNearestStopPoints(coordinates);
        let busStopInfo = {};
        if (busStops == 'no bus stops nearby') {
            return 'sorry, no tfl bus stops near you!'
        }
        else {

        for (let i in busStops) {
            busStopInfo[busStops[i].indicator] = {};
            busStopInfo[busStops[i].indicator]['Arrivals'] = await getBusStopArrivals(busStops[i].naptanId);
        }
        return busStopInfo;
    }
    }
    catch (err) {
        console.log(err);
    }
}

console.log(await transportSpots());


// console.log(await getArrivalsFromTfl(stopPointId))

// console.log(await getNearestStopPoints(coordinates))
