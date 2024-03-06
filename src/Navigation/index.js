
import React,{ useContext } from "react"
import { VariableContext } from "../context/GlobalStateProvider"
import { createStackNavigator } from '@react-navigation/stack';
import Room from "../screens/Room";
import Chat from "../screens/Chat";
import Main from "../screens/Main";
import Call from "../screens/Call";

const Stack = createStackNavigator();

export default function Navigation() {
    const {currentUser}=useContext(VariableContext)
    console.log(currentUser,'===')

    if(!currentUser){
        return (
            <Stack.Navigator screenOptions={{headerShown:false}}>
                <Stack.Screen name="Main" component={Main} />
            </Stack.Navigator>
        )
    } 

    if(currentUser){
        return (
            <Stack.Navigator screenOptions={{headerShown:false}}>
                <Stack.Screen name="Room" component={Room} />
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="Call" component={Call} />
            </Stack.Navigator>
        )
    } 
}
