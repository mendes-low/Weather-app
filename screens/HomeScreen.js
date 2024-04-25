import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { theme } from '../theme';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { MagnifyingGlassIcon, CalendarDaysIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress';
import { storeData } from '../utils/asyncStoroge';

export default function HomeScreen() {
    const [showSearch, setShowSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    function handleLocation(loc) {
        setLocations([]);
        setShowSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
            storeData('city', loc.name);
        })
    }

    function handleSearch(value) {
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setLocations(data);
            })
        }
    }

    useEffect(() => {
        fetchMyWeatherData();
    }, [])

    const fetchMyWeatherData = async () => {
        let myCity = await storeData('city');
        let cityName = myCity ? myCity : 'Almaty';

        fetchWeatherForecast({
            cityName,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 500), []);

    const { current, location } = weather;

    return (
        <View className='flex-1 relative'>
            <StatusBar style='light' />
            <Image source={require('../assets/images/bg.png')} blurRadius={70}
                className='absolute h-full w-full'
            />
            {loading ? (
                <View className='flex-1 flex-row justify-center items-center'>
                    <Progress.CircleSnail thickness={10} color='#0bb3b2' size={100} />
                </View>
            ) : (
                <SafeAreaView className='flex flex-1'>
                    <View style={{ height: '7%' }} className='mx-4 relative z-50'>
                        <View className='flex-row justify-end items-center rounded-full'
                            style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
                            {
                                showSearch ? (
                                    <TextInput
                                        onChangeText={handleTextDebounce}
                                        placeholder='Search city'
                                        placeholderTextColor={'lightgray'}
                                        className='pl-6 h-10 pd-1 flex-1 text-base text-white'
                                    />
                                ) : null
                            }
                            <TouchableOpacity
                                onPress={() => setShowSearch(!showSearch)}
                                style={{ backgroundColor: theme.bgWhite(0.3) }}
                                className='rounded-full p-3 m-1'
                            >
                                <MagnifyingGlassIcon size='25' color='white' />
                            </TouchableOpacity>
                        </View>
                        {
                            locations.length > 0 && showSearch ? (
                                <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                                    {
                                        locations.map((loc, index) => {
                                            let showBorder = index + 1 != locations.length;
                                            let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => handleLocation(loc)}
                                                    key={index}
                                                    className={`flex-row items-center border-0 p-3 mb-1 ${borderClass}`}
                                                >
                                                    <MapPinIcon size='20' color='gray' />
                                                    <Text className='text-black text-lg ml-2'>{loc?.name},{loc?.country}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            ) : null
                        }
                    </View>
                    <View className='mx-4 flex flex-col justify-evenly flex-1'>
                        <Text className='text-white text-center text-2xl font-bold'>
                            {location?.name},
                            <Text className='text-gray-300 text-lg font-semibold'>
                                {' ' + location?.country}
                            </Text>
                        </Text>
                        <View className='flex-row justify-center'>
                            <Image source={weatherImages[current?.condition?.text] || weatherImages['other']}
                                className='w-52 h-52'
                            />
                        </View>
                        <View className='space-y-2' >
                            <Text className='text-center text-white text-6xl font-bold ml-5'>
                                {current?.temp_c}&#176;
                            </Text>
                            <Text className='text-center text-white text-xl tracking-tighter'>
                                {current?.condition?.text}
                            </Text>
                        </View>
                        <View className='flex-row justify-between mx-4'>
                            <View className='flex-row space-x-2 items-center'>
                                <Image source={require('../assets/icons/wind.png')} className='h-6 w-6' />
                                <Text className='text-white text-base text-semibold'>
                                    {current?.wind_kph}km
                                </Text>
                            </View>
                            <View className='flex-row space-x-2 items-center'>
                                <Image source={require('../assets/icons/drop.png')} className='h-6 w-6' />
                                <Text className='text-white text-base text-semibold'>
                                    {current?.humidity}%
                                </Text>
                            </View>
                            <View className='flex-row space-x-2 items-center'>
                                <Image source={require('../assets/icons/sun.png')} className='h-6 w-6' />
                                <Text className='text-white text-base text-semibold'>
                                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className='mb-5 space-y-3'>
                        <View className='flex-row items-center mx-5 space-x-1'>
                            <CalendarDaysIcon size='22' color='white' />
                            <Text className='text=base text-white'>Daily forecast</Text>
                        </View>
                        {/* Forcast */}
                        <ScrollView
                            horizontal
                            contentContainerStyle={{ paddingHorizontal: 15 }}
                            showsHorizontalScrollIndicator={false}
                        >
                            {weather?.forecast?.forecastday?.map((item, index) => {
                                let date = new Date(item.date);
                                let options = { weekday: 'long' }
                                const dateName = date.toLocaleDateString('en-US', options);

                                return (
                                    <View
                                        key={index}
                                        className='flex justify-center items-center w-24 rounded-3xl py-3 mr-4 space-y-1'
                                        style={{ backgroundColor: theme.bgWhite(0.15) }}
                                    >
                                        <Image source={weatherImages[item?.day?.condition?.text] || weatherImages['other']}
                                            className='w-11 h-11' />
                                        <Text className='text-white'>{dateName}</Text>
                                        <Text className='text-white text-xl font-semibold'>
                                            {parseInt(item?.day?.avgtemp_c)}&#176;
                                        </Text>
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>
                </SafeAreaView >
            )
            }
        </View >
    )
}

