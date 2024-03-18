import React,{ useContext, useEffect } from "react"
import { VariableContext } from "../context/GlobalStateProvider"
import { createStackNavigator } from '@react-navigation/stack';
import Room from "../screens/Room";
import Chat from "../screens/Chat";
import Main from "../screens/Main";
import Call from "../screens/Call";
import { ActivityIndicator, View } from "react-native";
import colors from "../constant/colors";
import { useSocket } from "../context/SockectProvider";
import {PermissionsAndroid} from 'react-native';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

const Stack = createStackNavigator();

export default function Navigation() {
    const {currentUser}=useContext(VariableContext)
    console.log(currentUser,'NavigationScreen')
    const socket = useSocket();
    
    const updateSokectIdHandler=async()=>{
        if (currentUser?.email) {
            await socket.emit('update:socketId', { email:currentUser.email});
        }
    }

    useEffect(() => {
        updateSokectIdHandler()
    }, [currentUser])
    

    
    if(currentUser=='loading'){
        return (
            <View style={{backgroundColor:colors.white,flex:1,justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator color={colors.base} size={'large'}/>
            </View>
        )
    } 

    if(!currentUser){
        return (
            <Stack.Navigator screenOptions={{headerShown:false}}>
                <Stack.Screen name="Main" component={Main} />
            </Stack.Navigator>
        )
    } 

    if (currentUser){
        socket.emit('set:user:online', { email:currentUser.email});
        return (
            <Stack.Navigator screenOptions={{headerShown:false}}>
                <Stack.Screen name="Room" component={Room} />
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="Call" component={Call} />
            </Stack.Navigator>
        )
    } 
}
