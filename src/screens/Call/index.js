import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Text, Button, View, TextInput, Pressable,StyleSheet, FlatList, StatusBar } from 'react-native';
import { useSocket } from '../../context/SockectProvider';
import ReactPlayer from 'react-player'

import {mediaDevices,RTCView} from 'react-native-webrtc'
import peer from '../../services/peer'; // Assuming you have the peer service implementation
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constant/colors';
import { VariableContext } from '../../context/GlobalStateProvider';


let mediaConstraints = {
	audio: true,
	video: {
		frameRate: 30,
		facingMode: 'user'
	}
};

const Call = ({route}) => {
    const { userTo,roomName} = route.params;

    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const {currentUser, removeUser  }=useContext(VariableContext)


    console.log(userTo,'UserTo')


    // const handleUserJoind=({email,id})=>{
    //     console.log(activeUser)
    //     setActiveUser([...activeUser,{email:email,id:id}])
    //     console.log(`Email ${email} joined the room`)
    //     setRemoteSocketId(id)
    // }

 


    const handleCallUser=async(item)=>{
        setRemoteSocketId(item._id)
        console.log(item)
        const offer = await peer.getOffer()
        mediaDevices.getUserMedia(mediaConstraints)
            .then(stream => {
                socket.emit('user:call',{to:remoteSocketId,offer})
                setMyStream(stream)
            })
            .catch(error => {
                console.error('Error accessing media devices:', error);
                // Handle the error
            });
        // await console.log(navigator.mediaDevices.getUserMedia({audio:true,video:true}))
        // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }

 


    const handleIncommingCall=useCallback(async({from,offer})=>{

        setRemoteSocketId(from)

        const stream = await mediaDevices.getUserMedia(mediaConstraints);
        setMyStream(stream)

        console.log(`Incomming Call`,from,offer)
        const ans = await peer.getAnswer(offer)
        socket.emit('call:accepted',{to:from,ans})
    },[socket])

    const sendStream=useCallback(()=>{
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream)
        }
    },[myStream])

    const handleCallAccepted=useCallback(async({from,ans})=>{
        peer.setLocalDescription(ans)
        console.log(`Call Accepted`)
        sendStream()
    },[sendStream])

    const handleNegoNeeded=useCallback(async() => {
        const offer = await peer.getOffer()
        socket.emit('peer:nego:needed',{offer , to:remoteSocketId})
    },[remoteSocketId,socket])
    
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
        console.log(`GOT TRACKES`)

        setRemoteStream(remotStream[0])
      })
    }, [])




    
    useEffect(() => {
        socket.on('incomming:call',handleIncommingCall)
        socket.on('call:accepted',handleCallAccepted)
        socket.on('peer:nego:needed',handleNegoNeededIncomming)
        socket.on('peer:nego:final',handleNegoNeededFinal)

        return()=>{
            socket.off('incomming:call',handleIncommingCall)
            socket.off('call:accepted',handleCallAccepted)
            socket.off('peer:nego:needed',handleNegoNeededIncomming)
            socket.off('peer:nego:final',handleNegoNeededFinal)

        }
    }, [
        socket,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeededIncomming,
        handleNegoNeededFinal,
    ])

  return (
    <View style={styles.container}>
        <StatusBar backgroundColor={colors.base}/>
        



        {/*            Code for calling            */}
        <>

                <Text style={{fontSize:20,color:'black',textAlign:'center',marginVertical:10}}>{remoteSocketId ? 'Connected' : 'No one in room'}</Text> 
                {myStream && <Button title="Send Stream" onPress={sendStream} />}
                {
                    remoteSocketId ?
                    <View>
                        <Button title="Call" onPress={handleCallUser} />
                    </View>
                    :
                    <>
                    </>
                }


                <View>
                    <Button title="Call" onPress={()=>handleCallUser(userTo)} />
                </View>

                {myStream &&
                    <>
                        <Text style={{fontSize:30,color:'black',textAlign:'center',fontWeight:'800'}}>My Stream</Text>
                        <RTCView
                            mirror={true}
                            objectFit={'cover'}
                            streamURL={myStream.toURL()}
                            style={{height:200,width:200}}
                            zOrder={0}
                        />
                    </>
                }
                {remoteStream &&
                    <>
                        <Text style={{fontSize:30,color:'black',textAlign:'center',fontWeight:'800'}}>Remote Stream</Text>
                        <RTCView
                            mirror={true}
                            objectFit={'cover'}
                            streamURL={remoteStream.toURL()} // Access the `stream` property
                            style={{height:200,width:200}}
                            zOrder={0}
                        />
                    </>
                }
        </>
    </View>
  );
};

export default Call;



const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white'
    },
    row:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    messagesContainer:{
        flex:1,
    },
    messageInput:{
        borderWidth:1,
        flex:1,
        margin:8,
        borderColor:colors.base,
        color:'black',
        borderRadius:100,
        paddingHorizontal:10,
        elevation:3,
        backgroundColor:'white'
    },
    sendBTN:{
        height:50,
        width:50,
        marginRight:8,
        borderRadius:100,
        elevation:3,
        backgroundColor:colors.base
    },
    messageBoxContainer:{
        borderWidth:1,
        margin:8,
        borderColor:colors.base,
        color:'black',
        borderRadius:100,
        paddingHorizontal:10,
        elevation:3,
        backgroundColor:'white',
        width:"70%",
        borderBottomLeftRadius:0,
        borderTopLeftRadius:10,
        borderBottomRightRadius:10,
        borderTopRightRadius:10,
        paddingVertical:3
    },
    messageBoxContainerMine:{
        backgroundColor:colors.base,
        alignSelf:'flex-end',
        borderBottomLeftRadius:10,
        borderTopLeftRadius:10,
        borderBottomRightRadius:0,
        borderTopRightRadius:10,
    },
    message:{
        color:'black',
        marginVertical:5,
        fontWeight:'700'
    },
    messageMine:{
        color:'white'
    },
    messageSecondaryTitleMine:{
        color:'lightgray',
    },
    messageSecondaryTitle:{
        fontWeight:'400',
        fontSize:12,
        color:'gray'
    }
})