import axios from 'axios';
import { apiKey } from '../constants';

const forecastEndPoint = param => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${param.cityName}&days=${param.days}&aqi=no&alerts=no`;
const locationsEndPoint = param => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${param.cityName}`;

const apiCall = async (endPoint) => {
    const options = {
        method: 'GET',
        url: endPoint,
    }
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log('Error: ', error);
        return null;
    }
}

export const fetchWeatherForecast = (param) => {
    return apiCall(forecastEndPoint(param));
}

export const fetchLocations = (param) => {
    return apiCall(locationsEndPoint(param));
}