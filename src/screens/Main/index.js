import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Text, TextInput, Button, View, ActivityIndicator, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useSocket } from '../../context/SockectProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { VariableContext } from '../../context/GlobalStateProvider';
import colors from '../../constant/colors';
import { useNavigation } from '@react-navigation/native';


const Main = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginpassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [room, setRoom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();

  const navigation=useNavigation()

  const {currentUser, setUser }=useContext(VariableContext)

  const handleSubmitFormLogin = async() => {
    console.log(loginpassword,loginEmail,'========')

    if (loginEmail!='' && loginpassword!='' ) {

      await socket.emit('user:login', { email:loginEmail, password:loginpassword, type:'login' });
      // navigation.navigate('Room');
    }else{
      Toast.show({
        type: 'error',
        text1: 'Please fill all the fields for login',
      });
    }
  }

  const handleSubmitFormRegister =async() => {
    if (registerEmail!='' && registerPassword!='' && fullName!='') {
      await socket.emit('user:login', { fullName, email:registerEmail, password:registerPassword, type:'register' });
    // navigation.navigate('Room');
    }else{
      Toast.show({
        type: 'error',
        text1: 'Please fill all the fields for registration',
      });
    }
  }
  
  const handleJoinRoom = useCallback(async({data}) => {

    console.log(data,'========')
    if (data?.error) {
      Toast.show({
        type: 'error',
        text1: data?.error,
      });
    } else {
      await setUser(data)
    }
  }, [navigation]);

  useEffect(() => {
    setRoom("200")
    socket.on('user:login', handleJoinRoom);
    return () => {
      socket.off('user:login');
    };
  }, [socket, handleJoinRoom]);

  const checkUser=async()=>{
    setIsLoading(true)
    // const userMail= await AsyncStorage.getItem('userMail')
    console.log(currentUser)
    if(currentUser){
      // navigation.replace('Room',{ email:userMail })
      navigation.reset({
        routes: [{ name: 'Room', params: { email: currentUser } }],
      });
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkUser()
  }, []);

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