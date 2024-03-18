import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Text, TextInput, Button, View, ActivityIndicator, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { useSocket } from '../../context/SockectProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { VariableContext } from '../../context/GlobalStateProvider';
import colors from '../../constant/colors';
import { useNavigation } from '@react-navigation/native';
import { localhost } from '../../constant/common';
import messaging from '@react-native-firebase/messaging';



const Main = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginpassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [room, setRoom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState('');
  const socket = useSocket();

  const navigation=useNavigation()

  const {currentUser, setUser }=useContext(VariableContext)


  useEffect(() => {
    getDeviceToken()
  }, [])
  
  const getDeviceToken=async ()=>{
    const token= await messaging().getToken()
    setDeviceToken(token)
  }

  const updateUserOnlineStatus=async(email)=>{
    await fetch(`${localhost}/api/UpdateUserOnlineByEmail`,{
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email:email })
    })
    .then(response => {
        if (!response.ok) {
        throw new Error('Failed to fetch data');
        }
        return response.json();
    })
    .then(data => {
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
  }

  const updateDeviceToken=async(email)=>{
  const token= await messaging().getToken()

    console.log(email,token,"token")

    await fetch(`${localhost}/api/UpdateDevicesTokenByEmail`,{
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email:email,token:token })
    })
    .then(response => {
        if (!response.ok) {
        throw new Error('Failed to fetch data');
        }
        return response.json();
    })
    .then(data => {
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
    socket.emit('alert:message',{status:'refresh'});
  }


  const handleSubmitFormLogin = async() => {

    if (loginEmail!='' && loginpassword!='' ) {

      // await socket.emit('user:login', { email:loginEmail, password:loginpassword, type:'login' });
      await fetch(`${localhost}/api/login`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ email:loginEmail, password:loginpassword, type:'login' })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json()
      })
      .then(data => {
        if (data.status) {
          updateUserOnlineStatus(data.data.email)
          updateDeviceToken(data.data.email)
          setUser(data.data)
          socket.emit('alert:message',{status:'refresh'});

        } else {
          Toast.show({
            type: 'error',
            text1: data.error,
          });
        }
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });
      

    }else{
      Toast.show({
        type: 'error',
        text1: 'Please fill all the fields for login',
      });
    }
  }

  const handleSubmitFormRegister =async() => {
    if (registerEmail!='' && registerPassword!='' && fullName!='') {
      // await socket.emit('user:login', { fullName, email:registerEmail, password:registerPassword, type:'register' });
      fetch(`${localhost}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email:registerEmail, password:registerPassword, type:'register' ,deviceToken:deviceToken})
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json()
      })
      .then(data => {
        if (data.status) {
          setUser(data.data[0])
          socket.emit('alert:message',{status:'refresh'});
        } else {
          Toast.show({
            type: 'error',
            text1: data.error,
          });
        }
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });
    }else{
      Toast.show({
        type: 'error',
        text1: 'Please fill all the fields for registration',
      });
    }
  }
  

  if (isLoading) {
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <ActivityIndicator size={'large'}/>
    </View>
  }



  return (
    <ScrollView style={{margin:20}} keyboardShouldPersistTaps={'always'}>
      <KeyboardAvoidingView>
        <View style={{flex:1}}>
          <Text style={styles.lable}>Login</Text>
          <View style={{borderWidth:2,borderColor:colors.base,padding:20,marginVertical:20,borderRadius:20,backgroundColor:colors.baseLight}}>
            <TextInput
              placeholderTextColor={'gray'}
              value={loginEmail}
              keyboardType='email-address'
              placeholder='Enter Email'
              onChangeText={(text) => setLoginEmail(text)}
              style={styles.input}
            />
            <TextInput
              placeholderTextColor={'gray'}
              value={loginpassword}
              keyboardType='number-pad'
              placeholder='Enter Password'
              onChangeText={(text) => setLoginPassword(text)}
              style={styles.input}
            />
            <Pressable onPress={handleSubmitFormLogin} style={{}}>
              <Text style={styles.btnText}>Login</Text>
            </Pressable>
          </View>
        </View>
        <View style={{flex:1}}>
          <Text style={styles.lable}>Register</Text>
          <View style={{borderWidth:2,borderColor:colors.base,padding:20,marginVertical:20,borderRadius:20,backgroundColor:colors.baseLight}}>
            <TextInput
              placeholderTextColor={'gray'}
              value={fullName}
              placeholder='Enter Name'
              onChangeText={(text) => setFullName(text)}
              style={styles.input}
            />
            <TextInput
              placeholderTextColor={'gray'}
              value={registerEmail}
              keyboardType='email-address'
              placeholder='Enter Email'
              onChangeText={(text) => setRegisterEmail(text)}
              style={styles.input}
            />
            <TextInput
              placeholderTextColor={'gray'}
              value={registerPassword}
              keyboardType='number-pad'
              placeholder='Enter Password'
              onChangeText={(text) => setRegisterPassword(text)}
              style={styles.input}
            />
            <Pressable onPress={handleSubmitFormRegister}>
              <Text style={styles.btnText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default Main;

const styles = StyleSheet.create({
  lable:{
    fontSize:30,
    color:colors.base,
    textAlign:'center',
    fontWeight:'800'
  },
  input:{
    borderWidth:1,
    color:'black',
    marginBottom:10,
    padding:5,
    borderRadius:10,
    paddingHorizontal:20,
    borderColor:colors.base,
  },
  btnText:{
    padding:8,
    paddingHorizontal:20,
    borderRadius:100,
    fontWeight:'900',
    backgroundColor:colors.base,
    textAlign:'center',
    backgroundColor:colors.base,
    marginTop:10
  },
})