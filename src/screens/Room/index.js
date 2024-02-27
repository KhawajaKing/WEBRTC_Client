import React, { useCallback, useEffect, useState } from 'react';
import { Text, Button, View } from 'react-native';
import { useSocket } from '../../context/SockectProvider';
import ReactPlayer from 'react-player'

import {mediaDevices,RTCView} from 'react-native-webrtc'
import peer from '../../services/peer'; // Assuming you have the peer service implementation


let mediaConstraints = {
	audio: true,
	video: {
		frameRate: 30,
		facingMode: 'user'
	}
};

const Room = () => {
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [usersInRoom, setUsersInRoom] = useState({})

    // const handleUserJoind=({email,id})=>{
    //     console.log(activeUser)
    //     setActiveUser([...activeUser,{email:email,id:id}])
    //     console.log(`Email ${email} joined the room`)
    //     setRemoteSocketId(id)
    // }

    const handleUserJoind=(usersInRoom)=>{
        console.log(usersInRoom,"usersInRoom")
        console.log(`Email ${usersInRoom?.currentUser?.email} joined the room`)
        setRemoteSocketId(usersInRoom?.currentUser?.id)
        setUsersInRoom(usersInRoom)
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

    const usersHandler=useCallback(async(users)=>{
        console.log(users.users,'hello')
        setUsersInRoom(users.users)

    },[])

    

    
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
    



  return (
    <View style={{margin:20}}>
        <Text style={{fontSize:30,color:'black',textAlign:'center',fontWeight:'800'}}>Room Page</Text>
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
            {/* <ReactPlayer playing muted height="200px" width="300px" url={myStream}/> */}
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
            {/* <ReactPlayer playing muted height="200px" width="300px" url={remoteStream}/> */}
            </>
        }
    </View>
  );
};

export default Room;
