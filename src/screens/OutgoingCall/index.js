import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import colors from '../../constant/colors';
import { mediaDevices } from 'react-native-webrtc';
import peer from '../../services/peer';
import { useSocket } from '../../context/SockectProvider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { VariableContext } from '../../context/GlobalStateProvider';

const OutgoingCall = ({route}) => {
    const { userTo,type,} = route.params;
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const navigation=useNavigation()
    const {currentUser}=useContext(VariableContext)

    let mediaConstraints = {
        audio: true,
        video: type=='videoCall'?{
            frameRate: 30,
            facingMode: 'user'
        }
        :
        false
    };

    const handleCallUser=async(id)=>{
        const offer = await peer.getOffer()
        socket.emit('user:call',{to:id,offer,sender:currentUser,type})
    }

    const getRemoteId=useCallback(async({id}) => {
        setRemoteSocketId(id)
        handleCallUser(id)
        console.log(id,'setRemoteSocketId')
    },[])

 
    useEffect(() => {
        socket.emit('get:socketId:by:email',{email:userTo.email});

        socket.on('get:socketId:by:email',getRemoteId);
        return()=>{
            socket.off('get:socketId:by:email',callEndHandler)
        }
    }, [])


    const callEndHandler=useCallback(async() => {
        peer.close()
        peer.createPeerConnection()
        navigation.goBack()
    },[])

    const handleCallAccepted=useCallback(async({from,ans})=>{
        peer.setLocalDescription(ans)
        navigation.navigate('MainCall',{remoteId:remoteSocketId,type});
    },[])
    
    useEffect(() => {
        socket.on('call:accepted',handleCallAccepted);
        socket.on('call:endded',callEndHandler);
        
        return()=>{
            socket.off('call:accepted',handleCallAccepted);
            socket.off('call:endded',callEndHandler);
        }
    }, [socket,callEndHandler,handleCallAccepted])

    const handleEndCall = () => {
        socket.emit('call:endded',{to:remoteSocketId});
        // Close peer connection
        peer.close();
        peer.createPeerConnection()
        navigation.goBack()
    };


  return (
    <View style={{flex:1,backgroundColor:colors.darkGray}}>
        <StatusBar backgroundColor={colors.darkGray} barStyle={'light-content'}/>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <View style={{height:80,width:80,backgroundColor:colors.base,justifyContent:'center',alignItems:'center',borderRadius:100}}>
            <Text style={{color:colors.white,fontWeight:'900',fontSize:50}}>{userTo.fullName[0].toUpperCase()}</Text>
        </View>
        <Text  style={{color:colors.white,fontWeight:'600',fontSize:20,marginTop:20,letterSpacing:1}}>{userTo.fullName}</Text>
        <Text  style={{color:colors.gray,fontWeight:'400',fontSize:14,marginTop:5,}}>Ringing....</Text>
      </View>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Pressable onPress={handleEndCall} style={{height:60,width:60,backgroundColor:colors.red,justifyContent:'center',alignItems:'center',borderRadius:100}}>
            <Ionicons name="call" size={20} color={colors.white}/>
        </Pressable>
      </View>

    </View>
  )
}

export default OutgoingCall

const styles = StyleSheet.create({})