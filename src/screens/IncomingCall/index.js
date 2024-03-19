import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import colors from '../../constant/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import peer from '../../services/peer';
import { useSocket } from '../../context/SockectProvider';
import { useNavigation } from '@react-navigation/native';
import { mediaDevices } from 'react-native-webrtc';

const IncomingCall = ({route}) => {

  const { from,offer ,sender,type}= route.params;
  const [myStream, setMyStream] = useState(null)
  const socket = useSocket()
  const navigation=useNavigation()

  let mediaConstraints = {
    audio: true,
    video: type=='videoCall'?{
      frameRate: 30,
      facingMode: 'user'
    }
    :
    false
  };

  console.log(mediaConstraints,"========== INCOMING CALL ==========")

  const callEndHandler=useCallback(async() => {
    peer.close()
    peer.createPeerConnection()
    navigation.goBack()
  },[])

  useEffect(() => {
    socket.on('call:endded',callEndHandler);
    return()=>{
      socket.off('call:endded',callEndHandler);
    }
  }, [socket,callEndHandler])

  useEffect(() => {
    mediaDevices.getUserMedia(mediaConstraints)
    .then(stream => {
        setMyStream(stream)
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });
  }, [])

  const handleEndCall = () => {
    socket.emit('call:endded',{to:from});
    peer.close();
    peer.createPeerConnection()
    navigation.goBack()
  };

  const handleAcceptCall = async() => {
    const ans = await peer.getAnswer(offer)
    socket.emit('call:accepted',{to:from,ans})

    navigation.navigate('MainCall',{remoteId:from,type});
  };

  return (
    <View style={{flex:1,backgroundColor:colors.darkGray}}>
        <StatusBar backgroundColor={colors.darkGray} barStyle={'light-content'}/>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <View style={{height:80,width:80,backgroundColor:colors.base,justifyContent:'center',alignItems:'center',borderRadius:100}}>
            <Text style={{color:colors.white,fontWeight:'900',fontSize:50}}>{sender.fullName[0].toUpperCase()}</Text>
        </View>
        <Text  style={{color:colors.white,fontWeight:'600',fontSize:20,marginTop:20,letterSpacing:1}}>{sender.fullName}</Text>
        <Text  style={{color:colors.gray,fontWeight:'400',fontSize:14,marginTop:5,}}>Calling....</Text>
      </View>
      <View style={{flex:1,justifyContent:'space-evenly',alignItems:'center',flexDirection:'row'}}>
        <Pressable onPress={handleEndCall} style={{height:60,width:60,backgroundColor:colors.red,justifyContent:'center',alignItems:'center',borderRadius:100}}>
            <Ionicons name="call" size={20} color={colors.white}/>
        </Pressable>

        <Pressable onPress={handleAcceptCall} style={{height:60,width:60,backgroundColor:colors.green,justifyContent:'center',alignItems:'center',borderRadius:100}}>
            <Ionicons name="call" size={20} color={colors.white}/>
        </Pressable>
      </View>

    </View>
  )
}

export default IncomingCall

const styles = StyleSheet.create({})