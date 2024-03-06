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

const Chat = ({route}) => {
    const { email ,roomName,type,to,userTo} = route.params;

    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [usersInRoom, setUsersInRoom] = useState({})
    const [message, setMessage] = useState('')
    const [allMessages, setAllMessages] = useState([])
    const navigation=useNavigation()
    const flatListRef = useRef();
    const isFocused=useIsFocused()
    const {currentUser, removeUser  }=useContext(VariableContext)


    console.log(type,'currentUser')


    // const handleUserJoind=({email,id})=>{
    //     console.log(activeUser)
    //     setActiveUser([...activeUser,{email:email,id:id}])
    //     console.log(`Email ${email} joined the room`)
    //     setRemoteSocketId(id)
    // }

    const removeUserByEmail=(data, emailToRemove)=>{
        return {
          ...data,
          totalUsers: data.totalUsers.filter(user => user.email !== emailToRemove)
        };
    }

    const handleUserJoind=async(usersInRoom)=>{
        console.log(usersInRoom,"usersInRoom")
        console.log(`Email ${usersInRoom?.currentUser?.email} joined the room`)
        setRemoteSocketId(usersInRoom?.currentUser?.id)
        const filteredData=await removeUserByEmail(usersInRoom, email);
        setUsersInRoom(filteredData)
    }

    const handleCallUser=async(item)=>{
        setRemoteSocketId(item.id)
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

    // const handleCallUser=useCallback(async()=>{
    //     const offer = await peer.getOffer()
    //     mediaDevices.getUserMedia(mediaConstraints)
    //     .then(stream => {
    //         socket.emit('user:call',{to:remoteSocketId,offer})
    //         setMyStream(stream)
    //     })
    //     .catch(error => {
    //         console.error('Error accessing media devices:', error);
    //         // Handle the error
    //     });
    //     // await console.log(navigator.mediaDevices.getUserMedia({audio:true,video:true}))
    //     // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        

    // },[remoteSocketId,socket])

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

    const usersHandler=async(users)=>{
        console.log(users.users,'hello')
        
        console.log(email,'hello')
        const filteredData=await removeUserByEmail(users.users, email);
        await setUsersInRoom(filteredData)
        console.log(usersInRoom,'filted hello')
        
    }

    const showToast = (text) => {
        console.log(text,'-----')
        Toast.show({
          type: 'success',
          text1: text,
        //   text2: `${JSON.stringify(text)}`,
        });
    }
    
    const handleJoinRoom = useCallback((data) => {
        // const { email, room } = data;
        console.log(data,'recevied message')
    }, []);
    
    const handleAlertRoom = useCallback((data) => {
        console.log(data)
        showToast(data)
        console.log(data,'recevied alert')
    }, []);



    const sendMessageHandler = useCallback(async(message) => {
        await socket.emit('message', { roomName,email, message, createdAt:moment()});
        setMessage('')
    }, [socket]);

    const MessageHandler = useCallback(({data}) => {
        setAllMessages(data)
        // await socket.emit('message', { email, message, createdAt:moment()});
    }, [socket,navigation]);

    
    useEffect(() => {
        socket.on('get:all:message', MessageHandler);
        return () => {
            socket.off('get:all:message', MessageHandler);
        };
    }, []);


    const handleSocketIdByEmail = useCallback(({socketId}) => {
        // console.log(socketId)
        console.log(socketId,'recevied alert')
    }, [socket]);


    useEffect(() => {
        socket.on('message', MessageHandler);
        socket.on('user:joined:alert', handleAlertRoom);
        socket.on('get:socket:id:by:email', handleSocketIdByEmail);
        return () => {
            socket.off('message', MessageHandler);
            socket.off('user:joined:alert', handleAlertRoom);
            socket.off('get:socket:id:by:email', handleSocketIdByEmail);
        };
    }, [socket, MessageHandler,handleAlertRoom,handleSocketIdByEmail]);


    useEffect(() => {
        socket.emit('get:all:message',roomName);

        socket.on('get:all:message',MessageHandler);

        return () => {
            socket.off('get:all:message', MessageHandler);
        };
    }, []);
    
    useEffect(() => {
        socket.on('user:joined',handleUserJoind)
        socket.on('incomming:call',handleIncommingCall)
        socket.on('call:accepted',handleCallAccepted)
        socket.on('peer:nego:needed',handleNegoNeededIncomming)
        socket.on('peer:nego:final',handleNegoNeededFinal)
        socket.on('get:users',usersHandler)

        return()=>{
            socket.off('user:joined',handleUserJoind)
            socket.off('incomming:call',handleIncommingCall)
            socket.off('call:accepted',handleCallAccepted)
            socket.off('peer:nego:needed',handleNegoNeededIncomming)
            socket.off('peer:nego:final',handleNegoNeededFinal)
            socket.off('get:users',usersHandler)

        }
    }, [
        socket,
        handleUserJoind,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeededIncomming,
        handleNegoNeededFinal,
        usersHandler
    ])

    // user:joined:alert

    const handleContentSizeChange = () => {
        flatListRef.current.scrollToEnd({ animated: true });
    };



    const onCallHandler = useCallback(async() => {
        console.log(userTo.email,'userTo.email')
        //  socketId
        await socket.emit('get:socket:id:by:email', { email:userTo.email});
        // setMessage('')
        // navigation.navigate('Call',{userTo:userTo,roomName:roomName});
    }, [socket]);


  return (
    <View style={styles.container}>
        <StatusBar backgroundColor={colors.base}/>
        <View
            style={{height:50,marginBottom:10,backgroundColor:colors.base,alignItems:'center',paddingHorizontal:30,flexDirection:'row',justifyContent:'space-between',gap:20}}
        >

            <Pressable 

                onPress={()=>{
                    if (type!='chat') {
                        socket.emit('user:left:alert', { currentUser:currentUser.fullName});
                    }
                    navigation.goBack()
                }}
            >
                <Text style={{padding:8,paddingHorizontal:20,borderWidth:1,borderRadius:100,borderColor:'white',fontWeight:'900',textAlign:'center',alignSelf:'flex-end'}}>Back</Text>
            </Pressable>
            <View style={{flex:1}}>
                <Text style={{padding:8,paddingHorizontal:20,borderRadius:100,borderColor:'white',fontWeight:'900',textAlign:'center'}}>{to}</Text>
            </View>
            {
                type=="chat"?
                    <Pressable 
                        onPress={onCallHandler}
                    >
                        <Text style={{padding:8,paddingHorizontal:20,borderWidth:1,borderRadius:100,borderColor:'white',fontWeight:'900',textAlign:'center',alignSelf:'flex-end'}}>Call</Text>
                    </Pressable>
                :
                <></>
            }
        </View>
        <View style={styles.messagesContainer}>
            {
                allMessages?
                <FlatList
                    ref={flatListRef}
                    initialNumToRender={20}
                    data={allMessages}
                    onContentSizeChange={handleContentSizeChange}
                    renderItem={({item})=>(
                        <View style={[styles.messageBoxContainer,item.sender==email?styles.messageBoxContainerMine:{}]}>
                            <Text style={[styles.messageSecondaryTitle,item.sender==email?styles.messageSecondaryTitleMine:{}]}>{item.sender}</Text>
                            <Text  style={[styles.message,item.sender==email?styles.messageMine:{}]}>{item.message}</Text>
                            <Text  style={[styles.messageSecondaryTitle,item.sender==email?styles.messageSecondaryTitleMine:{},{alignSelf:'flex-end'}]}>{moment(item.createdAt).format("hh : mm a")}</Text>
                        </View>
                    )}
                />
                :
                <></>
            }
        </View>
        <View style={[styles.row,{backgroundColor:'white'}]}>
            <TextInput
                value={message}
                placeholder='Messgae'
                placeholderTextColor={'gray'}
                onChangeText={(e)=>setMessage(e)}
                style={styles.messageInput}
            />
            <Pressable 
                style={styles.sendBTN}
                onPress={()=>{sendMessageHandler(message)}}
            >
                <Text style={{fontSize:38,color:'white',alignSelf:'center'}}>&#x27A1;</Text>
            </Pressable>
        </View>



        {/*            Code for calling            */}
        <>

                {/* <Text style={{fontSize:20,color:'black',textAlign:'center',marginVertical:10}}>{remoteSocketId ? 'Connected' : 'No one in room'}</Text> 
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
                {
                    usersInRoom?.totalUsers?
                        usersInRoom?.totalUsers?.map(item=>(
                            <View key={item.id}>
                                <Text style={{fontSize:16,color:'black',textAlign:'center',fontWeight:'500',marginVertical:10}}>{item.email} joined</Text>
                                <Button title="Call" onPress={()=>handleCallUser(item)} />
                            </View>
                        ))
                    :
                    <></>
                }
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
                }*/}
        </>
    </View>
  );
};

export default Chat;



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