import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import colors from '../../constant/colors'
import { VariableContext } from '../../context/GlobalStateProvider'
import moment from 'moment'
import { useSocket } from '../../context/SockectProvider'
import Toast from 'react-native-toast-message'
import { useNavigation } from '@react-navigation/native'
import { localhost } from '../../constant/common'
import messaging from '@react-native-firebase/messaging';



const Room = () => {
    const [allRooms, setAllRooms] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState('')
    const [activeTab, setActiveTab] = useState('Users')
    const [modalVisible, setModalVisible] = useState(false)
    const {currentUser,removeUser} = useContext(VariableContext)
    const socket = useSocket();
    const navigation=useNavigation()

   
    const navigateToRoom = async({roomName,creator}) => {
        await socket.emit('user:joined:alert', { roomName:roomName, currentUser:currentUser.fullName});
        navigation.navigate('Chat',{ email: currentUser.email ,roomName:roomName,type:'room',to:creator,userTo:null});
    };
    const navigateToChat = async({roomName,creator,userTo}) => {
        navigation.navigate('Chat',{ email: currentUser.email ,roomName:roomName,type:'chat',to:creator,userTo:userTo});
    };

    //  ----------- In Used -----------



    const getAllRooms=async()=>{
        fetch(`${localhost}/api/allRooms`)
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
             if (data.status) {
                setAllRooms(data.data)
            } else {
                Toast.show({
                    type: 'error',
                    text1: data.error,
                });
            }
        })
        .catch(error => {
            console.error('Error fetching Room data:', error);
        });
    }
    const getAllUsers=async()=>{
        fetch(`${localhost}/api/allUsers`)
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
             if (data.status) {
                const res =  data.data.filter(item => {
                    return item.email !=currentUser.email
                });
                setAllUsers(res)

            } else {
                Toast.show({
                    type: 'error',
                    text1: data.error,
                });
            }
        })
        .catch(error => {
            console.error('Error fetching User data:', error);
        });
    }

    const createRoomHandler = async({input,currentUser}) => {
        

        await fetch(`${localhost}/api/createRoom`,{
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ roomName:input,creator:currentUser })
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch data ');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                socket.emit('alert:message',{status:'refreshRooms'});
            } else {
                Toast.show({
                    type: 'error',
                    text1: data.error,
                });
            }
        })
        .catch(error => {
            console.error('Error fetching Creating Room data:', error);
        });
        setInput('')
    };

    const alertHandler = useCallback(async({data}) => {
        // console.log(data.status)
        if (data.status=="refresh") {
            getAllUsers()
        } else if (data.status=="refreshRooms") {
            getAllRooms()
        } else {
        }
    }, [socket]);

    useEffect(() => {
        socket.on('alert:message', alertHandler);
        return () => {
            socket.off('alert:message', alertHandler);
        };
    }, [socket, alertHandler]);

    useEffect(() => {
        socket.on('alert:message', alertHandler);
        return () => {
            socket.off('alert:message', alertHandler);
        };
    }, []);

    useEffect(() => {
        getAllUsers()
        getAllRooms()
    }, [])

    const logoutHandler=async()=>{
        // await socket.emit('set:user:offline', { email:currentUser.email});

        

        await fetch(`${localhost}/api/UpdateUserOfflineByEmail`,{
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ email:currentUser.email })
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                socket.emit('alert:message',{status:'refresh'});
            }
            
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

        removeUser()
    }
    

    //  ----------- In Used -----------

    // useEffect(() => {
    //     socket.on('create:room', roomsHandler);
    //     return () => {
    //         socket.off('create:room', roomsHandler);
    //     };
    // }, [socket, roomsHandler]);

    
    const generateCollectionName = (email1, email2) => {
        const sortedEmails = [email1, email2].sort();
        const collectionName = sortedEmails.join('_');
        return collectionName;
    };
    
    const onPressUserHandler=(email,creator,item)=>{
        const collection=generateCollectionName(email,currentUser.email)
        navigateToChat({roomName:collection,creator,userTo:item})
    }

    const handleIncommingCall=useCallback(async({from,offer})=>{
        console.log(`Incomming Call`,from,offer)
        // navigation.navigate('Call')
    },[socket])


    useEffect(() => {
        socket.on('incomming:call',handleIncommingCall)
        return()=>{
            socket.off('incomming:call',handleIncommingCall)
        }
    }, [socket,handleIncommingCall]);

    useEffect(() => {
        socket.emit('mapping:id',{email:currentUser.email})
    }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
        });
        return unsubscribe;
    }, []);

    const checkChat=async(data)=>{
        

        data.map(item=>{

        })


        await fetch(`${localhost}/api/getChatByCollectionName`,{
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ collectionName:collectionName })
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch data ');
            }
            return response.json();
        })
        .then(data => {
            console.log(data,'============= data =============')
            if (data.data>0) {
                return(true)
            } else {
                return(false)
            }
        })
        .catch(error => {
            console.error('Error fetching Creating Room data:', error);
        });



        
    }


  return (
    <View>
        <StatusBar backgroundColor={colors.base}/>
            <View
                style={styles.header}
            >
                <Pressable 
                    onPress={logoutHandler}
                >
                    <Text style={{padding:8,paddingHorizontal:20,borderWidth:1,borderRadius:100,borderColor:'white',fontWeight:'900'}}>Logout</Text>
                </Pressable>
            </View>
            

            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20}}>
                {/* <Pressable onPress={()=>setActiveTab('Chat')} style={[styles.activeTabContainer,activeTab=='Chat'?{}:{backgroundColor:colors.white}]}>
                    <Text style={[styles.TabText,activeTab=='Chat'?{}:{color:colors.base}]}>Chat</Text>
                </Pressable> */}
                <Pressable onPress={()=>setActiveTab('Users')} style={[styles.activeTabContainer,activeTab=='Users'?{}:{backgroundColor:colors.white}]}>
                    <Text style={[styles.TabText,activeTab=='Users'?{}:{color:colors.base}]}>Users</Text>
                </Pressable>
                <Pressable onPress={()=>setActiveTab('Rooms')} style={[styles.activeTabContainer,activeTab=='Rooms'?{}:{backgroundColor:colors.white}]}>
                    <Text style={[styles.TabText,activeTab=='Rooms'?{}:{color:colors.base}]}>Rooms</Text>
                </Pressable>
            </View>
            <View style={styles.body}>
                {
                    activeTab=='Rooms'?
                        allRooms?
                            <>
                                
                                <Pressable onPress={()=>setModalVisible(true)}>
                                    <Text style={[styles.roomNameText,{paddingVertical:10,textAlign:'right'}]}>+ Create Room</Text>
                                </Pressable>

                                <FlatList
                                    data={allRooms}
                                    numColumns={'2'}
                                    renderItem={({item})=>(
                                        <View style={{flex:1,paddingHorizontal:5}}>
                                            <Pressable onPress={()=>navigateToRoom({roomName:item.roomName,creator:item.roomName})} style={[styles.roomBoxContainer]}>
                                                <Text style={styles.roomBoxText}>{item?.creator==currentUser.email?"Own":`Created By : ${item?.creator}`}</Text>
                                                <Text style={styles.roomNameText}>{item?.roomName}</Text>
                                                <Text style={styles.roomBoxText}>Created At : {moment(item?.createdAt).format('hh:mm a')}</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                />

                            </>
                        :
                        <></>
                    :activeTab=='Users'?
                        <FlatList
                            data={allUsers}
                            renderItem={({item})=>(
                                <Pressable disabled={!item.isOnline} onPress={()=>onPressUserHandler(item.email,item.fullName,item)} style={[styles.roomBoxContainer,{flexDirection:'row',justifyContent:'space-between',borderColor:item.isOnline?colors.base:colors.gray}]}>
                                    <Text style={[styles.roomNameText,{color:item.isOnline?colors.base:colors.gray}]}>{item.fullName}</Text>
                                    <View style={{flexDirection:'row',alignItems:'center'}}>
                                        <View style={{height:10,width:10, backgroundColor:item.isOnline?colors.base:colors.red,borderRadius:100}}></View>
                                        <Text style={{color:item.isOnline?colors.base:colors.red,fontWeight:'900',fontSize:12,paddingLeft:10}}>{item.isOnline?'Online':'Offline'}</Text>
                                    </View>
                                </Pressable>
                            )}
                        />
                    :
                    <>
                        <FlatList
                            data={allUsers}
                            renderItem={({item})=>{
                                return (
                                    <Pressable
                                        disabled={!item.isOnline}
                                        onPress={() => onPressUserHandler(item.email, item.fullName, item)}
                                        style={[styles.roomBoxContainer, { flexDirection: 'row', justifyContent: 'space-between', borderColor: item.isOnline ? colors.base : colors.gray }]}
                                    >
                                        <Text style={[styles.roomNameText, { color: item.isOnline ? colors.base : colors.gray }]}>{item.fullName}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ height: 10, width: 10, backgroundColor: item.isOnline ? colors.base : colors.red, borderRadius: 100 }}></View>
                                            <Text style={{ color: item.isOnline ? colors.base : colors.red, fontWeight: '900', fontSize: 12, paddingLeft: 10 }}>{item.isOnline ? 'Online' : 'Offline'}</Text>
                                        </View>
                                    </Pressable>
                                );
                            }}
                        />
                    </>
                }
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.inputContainer}>
                            <Pressable onPress={()=>setModalVisible(!modalVisible)}>
                                <Text style={[{fontSize:20,color:colors.base,marginBottom:0,fontWeight:'700'}]}>{"<="}</Text>
                            </Pressable>
                            <Text style={[{fontSize:25,color:colors.base,marginBottom:15,fontWeight:'700',alignSelf:'center'}]}>Create New Room</Text>
                            <TextInput
                                value={input}
                                onChangeText={(e)=>setInput(e)}
                                style={styles.input}
                                placeholder='Enter Room Name'
                                placeholderTextColor={colors.gray}
                            />

                            <Pressable 
                                onPress={()=>{
                                    createRoomHandler({input,currentUser:currentUser.email})
                                    setModalVisible(false)
                                }}
                                >
                                <Text style={styles.btnText}>Create</Text>
                            </Pressable>

                        </View>
                    </View>
                </View>
            </Modal>
    </View>
  )
}

export default Room

const styles = StyleSheet.create({
    header:{
        height:50,
        marginBottom:10,
        backgroundColor:colors.base,
        alignItems:'center',
        paddingHorizontal:25,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    body:{
        justifyContent:'center',
        padding:20,
    },
    roomBoxText:{
        color:colors.gray,
        fontSize:10
    },
    roomNameText:{
        color:colors.base,
        fontWeight:'700',
        fontSize:15,
        paddingVertical:15
    },
    TabText:{
        color:colors.white,
        fontWeight:'700',
        fontSize:15,
    },
    activeTabContainer:{
        backgroundColor:colors.base,
        width:'40%',
        borderRadius:100,
        alignItems:'center',
        justifyContent:'center',
        padding:10,
        borderWidth:1,
        borderColor:colors.base,
        
    },
    inActiveTabContainer:{
        backgroundColor:colors.white,
        width:'40%',
        borderRadius:100,
        alignItems:'center',
        justifyContent:'center',
        padding:10,
        borderWidth:1,
        borderColor:colors.base,
    },
    roomBoxContainer:{
        // flexDirection:'row',
        // justifyContent:'space-between',
        alignItems:'center',
        borderWidth:1,
        borderRadius:10,
        paddingHorizontal:10,
        borderColor:colors.base,
        marginTop:10
    },
    inputContainer:{

    },
    btnText:{
        padding:8,
        paddingHorizontal:20,
        borderRadius:100,
        fontWeight:'900',
        backgroundColor:colors.base,
        textAlign:'center',
        marginTop:20
    },
    input:{
        borderWidth:1,
        color:colors.black,
        borderColor:colors.base,
        borderRadius:10,
        paddingHorizontal:10,   
        width:'100%',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor:'rgba(0,0,0,.4)'
    },
    modalView: {
        margin: 20,
        width:'80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
})