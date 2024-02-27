import React, { useEffect, useState, useCallback } from 'react';
import { Text, TextInput, Button, View } from 'react-native';
import { useSocket } from '../../context/SockectProvider';

const Main = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const socket = useSocket();

  const handleSubmitForm = useCallback(async() => {
    await socket.emit('room:join', { email, room });
    navigation.navigate('Room', { room });
  }, [email, room, socket]);

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data;
    navigation.navigate('Room', { room });
  }, [navigation]);

  useEffect(() => {
    setRoom("200")
    socket.on('room:join', handleJoinRoom);
    return () => {
      socket.off('room:join');
    };
  }, [socket, handleJoinRoom]);



  return (
    <View style={{margin:20}}>
      <Text style={{fontSize:30,color:'black',textAlign:'center',fontWeight:'800'}}>Login</Text>
      <TextInput
        placeholderTextColor={'gray'}
        value={email}
        placeholder='Enter Email'
        onChangeText={(text) => setEmail(text)}
        style={{borderWidth:1,color:'black',marginVertical:20,padding:5,borderRadius:10,paddingHorizontal:20}}
      />
      {/* <TextInput
        label="Room Number"
        value={room}
        onChangeText={(text) => setRoom(text)}
        style={{borderWidth:1,color:'black',margin:20,padding:5,borderRadius:10}}
      /> */}
        
      <Button title="Join" onPress={handleSubmitForm}/>
    </View>
  );
};

export default Main;
