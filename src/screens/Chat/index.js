import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Text, Button, View, TextInput, Pressable,StyleSheet, FlatList, StatusBar, Modal, Image } from 'react-native';
import { useSocket } from '../../context/SockectProvider';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import colors from '../../constant/colors';
import { VariableContext } from '../../context/GlobalStateProvider';
import { localhost } from '../../constant/common';
import { launchImageLibrary } from 'react-native-image-picker'
import { uploadImageToImgur } from '../../api';
import Ionicons from 'react-native-vector-icons/Ionicons';


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
    const [message, setMessage] = useState('')
    const [allMessages, setAllMessages] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [imageURL, setImageURL] = useState('')
    const navigation=useNavigation()
    const flatListRef = useRef();
    const isFocused=useIsFocused()
    const {currentUser, removeUser  }=useContext(VariableContext)

    console.log(userTo,'userTo')

    const sendMessageHandler = async(message) => {
        if (message || imageURL) {
            await socket.emit('message', { roomName,email, message, createdAt:moment(),sender:currentUser,to:userTo,image:imageURL});
        }
        setModalVisible(false)
        setMessage('')
        setImageURL(null)
    }

    const MessageHandler = useCallback(({data}) => {
        setAllMessages(data)
        // await socket.emit('message', { email, message, createdAt:moment()});
    }, [socket,navigation]);

    useEffect(() => {
        socket.on('message', MessageHandler);
        return () => {
            socket.off('message', MessageHandler);
        };
    }, [socket, MessageHandler]);

    const getAllChat = async() => {
        
        
        await fetch(`${localhost}/api/getChatFristTime`,{
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ roomName:roomName })
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch data ');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                setAllMessages(data.data)
                // socket.emit('alert:message',{status:'refreshRooms'});
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
        // await socket.emit('message', { email, message, createdAt:moment()});
    }

    useEffect(() => {
        getAllChat()
    }, []);

    const handleContentSizeChange = () => {
        flatListRef.current.scrollToEnd({ animated: true });
    };

    const onCallHandler = async(type) => {
        console.log(userTo.email,'userTo.email')
        //  socketId
        // setMessage('')
        navigation.navigate('OutgoingCall',{userTo:userTo,type:type});
    };


    const photoChoose = async() => {
        const result = await launchImageLibrary({
            maxHeight: 400,
            maxWidth:  400,
            quality: .3,
            includeBase64: true
        });    
        // setRecipyImage(result.assets[0])
        let imageResponse = await uploadImageToImgur(result.assets[0].base64)
        imageResponse = JSON.parse(imageResponse)
        await setImageURL(imageResponse?.data?.link)
        console.log(result,"result")
        console.log(imageResponse?.data?.link,"imageResponse?.data?.link")
        setModalVisible(true)
      }


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
                <View style={{flexDirection:'row'}}>
                    <Pressable 
                        onPress={()=>onCallHandler("voiceCall")}
                        style={{marginRight:20,padding:5}}
                    >
                        <Ionicons name="call" size={20} color={colors.white}/>
                    </Pressable>

                    <Pressable 
                        onPress={()=>onCallHandler("videoCall")}
                        style={{padding:5}}
                    >
                        <Ionicons name="videocam" size={20} color={colors.white}/>
                    </Pressable>

                </View>
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
                            {
                                item?.image?
                                <>
                                    <Image source={{uri:item?.image}} style={{height:250,width:"100%",borderRadius:10,marginTop:10,backgroundColor:colors.gray}}/>
                                    {
                                        item.message?
                                            <Text  style={[styles.message,item.sender==email?styles.messageMine:{}]}>{item.message}</Text>
                                        :
                                        <></>

                                    }
                                </>
                                :
                                <>
                                    <Text  style={[styles.message,item.sender==email?styles.messageMine:{}]}>{item.message}</Text>
                                </>
                            }
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
                onPress={photoChoose}
            >
                <Ionicons name="camera" size={20} color={colors.white}/>
            </Pressable>

            <Pressable 
                style={styles.sendBTN}
                onPress={()=>{sendMessageHandler(message)}}
            >
                <Ionicons name="send" size={20} color={colors.white}/>
                {/* <Text style={{fontSize:38,color:'white',alignSelf:'center'}}>&#x27A1;</Text> */}
            </Pressable>
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
                    <Image source={{uri:imageURL}} style={{height:250,width:"100%",borderRadius:10}}/>
                    <View style={[styles.row,{justifyContent:'flex-end',marginTop:15}]}>
                        {/* <TextInput
                            value={message}
                            placeholder='Messgae'
                            placeholderTextColor={'gray'}
                            onChangeText={(e)=>setMessage(e)}
                            style={styles.messageInput}
                        /> */}

                        <Pressable 
                            style={[styles.sendBTN]}
                            onPress={()=>{sendMessageHandler(message)}}
                        >
                            <Ionicons name="send" size={20} color={colors.white}/>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>



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
        height:40,
        width:40,
        marginRight:8,
        borderRadius:100,
        elevation:3,
        backgroundColor:colors.base,
        justifyContent:'center',
        alignItems:'center'
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
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor:'rgba(0,0,0,.6)'
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