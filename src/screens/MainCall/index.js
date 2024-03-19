import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import peer from '../../services/peer';
import { useSocket } from '../../context/SockectProvider';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../constant/colors';
import { useNavigation } from '@react-navigation/native';

const MainCall = ({route}) => {
    const { remoteId ,type} = route.params;
    const socket = useSocket()
    const [remoteStream, setRemoteStream] = useState(null)
    const [myStream, setMyStream] = useState(null)
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




    const sendStream = (stream) => {

        stream.getTracks().forEach(track => {
            peer.peer.addTrack(track, stream);
        });

    }

    const getStream=()=>{
        mediaDevices.getUserMedia(mediaConstraints)
        .then(stream => {
            setMyStream(stream)
            sendStream(stream)
            // for(const track of stream.getTracks()){
            //     peer.peer.addTrack(track,stream )
            // }
        })

        .catch(error => {
            console.error('Error accessing media devices:', error);
        });

    }
    
    useEffect(() => {
        getStream()
        
    }, [])


    const handleNegoNeeded=useCallback(async() => {
        const offer = await peer.getOffer()
        socket.emit('peer:nego:needed',{offer , to:remoteId})
    },[remoteId,socket])
    
    useEffect (() =>{
        peer.peer.addEventListener ('negotiationneeded', handleNegoNeeded)
        
        return()=>{
            peer.peer.removeEventListener ('negotiationneeded', handleNegoNeeded)
        }
    }, [handleNegoNeeded])
    
    const handleNegoNeededIncomming=useCallback(async({from,offer}) => {
        const ans = await peer.getAnswer(offer)
        socket.emit('peer:nego:done',{to:from,ans})
    },[socket])

    const handleNegoNeededFinal=useCallback(async({ans}) => {
        await peer.setLocalDescription(ans)
    },[])

    useEffect(() => {
      peer.peer.addEventListener('track',async (ev) =>{
        const remotStream = ev.streams
        console.log(`GOT TRACKES`,remotStream[0])

        setRemoteStream(remotStream[0])
      })
    }, [sendStream])


    useEffect(() => {
        socket.on('peer:nego:needed',handleNegoNeededIncomming)
        socket.on('peer:nego:final',handleNegoNeededFinal)

        return()=>{
            socket.off('peer:nego:needed',handleNegoNeededIncomming)
            socket.off('peer:nego:final',handleNegoNeededFinal)

        }
    }, [
        socket,
        handleNegoNeededIncomming,
        handleNegoNeededFinal,
    ])

    const handleEndCall = async() => {
        socket.emit('call:endded',{to:remoteId});
        await peer.close();

        await peer.createPeerConnection()
        navigation.navigate("Room")
    };
    
    const callEndHandler=useCallback(async() => {
        await peer.close()
        await peer.createPeerConnection()
        navigation.navigate("Room")
    },[])
    
    useEffect(() => {
        socket.on('call:endded',callEndHandler);
        return()=>{
        socket.off('call:endded',callEndHandler);
        }
    }, [socket,callEndHandler])

  return (
    <View>
        {myStream &&
            <View style={{}}>
                <RTCView
                    mirror={true}
                    objectFit={'cover'}
                    streamURL={myStream.toURL()}
                    style={{height:Dimensions.get('screen').height/2,width:Dimensions.get('screen').width}}
                    zOrder={0}
                />
            </View>
        }

        {remoteStream &&
            <>
                <RTCView
                    mirror={true}
                    objectFit={'cover'}
                    streamURL={remoteStream.toURL()} // Access the `stream` property
                    style={{height:Dimensions.get('screen').height/2,width:Dimensions.get('screen').width}}
                    zOrder={0}
                />
            </>
        }
        <Pressable onPress={handleEndCall} style={{height:60,width:60,backgroundColor:colors.red,justifyContent:'center',alignItems:'center',borderRadius:100,position:'absolute',bottom:50,left:"40%"}}>
            <Ionicons name="call" size={20} color={colors.white}/>
        </Pressable>
    </View>
  )
}

export default MainCall

const styles = StyleSheet.create({})