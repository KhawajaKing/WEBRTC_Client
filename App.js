// import React, {useEffect, useState, useRef} from 'react';
// import {
//   Platform,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
//   View,
//   Text,
//   TouchableOpacity,
// } from 'react-native';
// import TextInputContainer from './src/components/TextInputContainer';
// import CallAnswer from './src/svgs/CallAnswer';
// import CallEnd from './src/svgs/CallEnd';
// import MicOn from "./src/svgs/MicOn";
// import MicOff from "./src/svgs/MicOff";
// import VideoOn from "./src/svgs/VideoOn";
// import VideoOff from "./src/svgs/VideoOff";
// import CameraSwitch from "./src/svgs/CameraSwitch";
// import IconContainer from "./src/components/IconContainer";
// import SocketIOClient, { Socket } from 'socket.io-client'; // import socket io
// // import WebRTC 
// import {
//   mediaDevices,
//   RTCPeerConnection,
//   RTCView,
//   RTCIceCandidate,
//   RTCSessionDescription,
// } from 'react-native-webrtc';

// export default function App({}) {

//   const [type, setType] = useState('JOIN');

//   const [callerId] = useState(
//     Math.floor(100000 + Math.random() * 900000).toString(),
//   );

//   const otherUserId = useRef(null);





//   // useEffect(() => {
//   //   InCallManager.start();
//   //   InCallManager.setKeepScreenOn(true);
//   //   InCallManager.setForceSpeakerphoneOn(true);

//   //   return () => {
//   //     InCallManager.stop();
//   //   };
//   // }, []);





//   let remoteRTCMessage = useRef(null);

//   useEffect(() => {
//     socket.on("newCall", (data) => {
//       remoteRTCMessage.current = data.rtcMessage;
//       otherUserId.current = data.callerId;
//       setType("INCOMING_CALL");
//     });

//     socket.on("callAnswered", (data) => {
//       // 7. When Alice gets Bob's session description, she sets that as the remote description with `setRemoteDescription` method.

//       remoteRTCMessage.current = data.rtcMessage;
//       peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(remoteRTCMessage.current)
//       );
//       setType("WEBRTC_ROOM");
//     });

//     socket.on("ICEcandidate", (data) => {
//       let message = data.rtcMessage;

//       // When Bob gets a candidate message from Alice, he calls `addIceCandidate` to add the candidate to the remote peer description.

//       if (peerConnection.current) {
//         peerConnection?.current
//           .addIceCandidate(new RTCIceCandidate(message.candidate))
//           .then((data) => {
//             console.log("SUCCESS");
//           })
//           .catch((err) => {
//             console.log("Error", err);
//           });
//       }
//     });

//     // Alice creates an RTCPeerConnection object with an `onicecandidate` handler, which runs when network candidates become available.
//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         // Alice sends serialized candidate data to Bob using Socket
//         sendICEcandidate({
//           calleeId: otherUserId.current,
//           rtcMessage: {
//             label: event.candidate.sdpMLineIndex,
//             id: event.candidate.sdpMid,
//             candidate: event.candidate.candidate,
//           },
//         });
//       } else {
//         console.log("End of candidates.");
//       }
//     };
//   },[]);

//   async function processCall() {
//     try {
//       const sessionDescription = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(sessionDescription);
//       sendCall({
//         calleeId: otherUserId.current,
//         rtcMessage: sessionDescription,
//       });
//     } catch (error) {
//       console.error("Error processing call:", error);
//     }
//   }

//   async function processAccept() {
//     try {
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(remoteRTCMessage.current)
//       );
//       const sessionDescription = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(sessionDescription);
//       answerCall({
//         callerId: otherUserId.current,
//         rtcMessage: sessionDescription,
//       });
//     } catch (error) {
//       console.error("Error processing call acceptance:", error);
//     }
//   }

//   function answerCall(data) {
//     socket.emit("answerCall", data);
//   }

//   function sendCall(data) {
//     socket.emit("call", data);
//   }









//     // Stream of local user
//   const [localStream, setlocalStream] = useState(null);

// /* When a call is connected, the video stream from the receiver is appended to this state in the stream*/
//   const [remoteStream, setRemoteStream] = useState(null);

// // This establishes your WebSocket connection
//   const socket = SocketIOClient('http://192.168.1.10:3500', {
//     transports: ['websocket'],
//     query: {
//         callerId, 
//     /* We have generated this `callerId` in `JoinScreen` implementation */
//     },
//   });

//  /* This creates an WebRTC Peer Connection, which will be used to set local/remote descriptions and offers. */
//   const peerConnection = useRef(
//     new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: 'stun:stun.l.google.com:19302',
//         },
//         {
//           urls: 'stun:stun1.l.google.com:19302',
//         },
//         {
//           urls: 'stun:stun2.l.google.com:19302',
//         },
//       ],
//     }),
//   );

//   useEffect(() => {
//     socket.on('newCall', data => {
//      /* This event occurs whenever any peer wishes to establish a call with you. */
//     });

//     socket.on('callAnswered', data => {
//       /* This event occurs whenever remote peer accept the call. */
//     });

//     socket.on('ICEcandidate', data => {
//       /* This event is for exchangin Candidates. */

//     });

//     let isFront = false;

// /*The MediaDevices interface allows you to access connected media inputs such as cameras and microphones. We ask the user for permission to access those media inputs by invoking the mediaDevices.getUserMedia() method. */
//     mediaDevices.enumerateDevices().then(sourceInfos => {
//       let videoSourceId;
//       for (let i = 0; i < sourceInfos.length; i++) {
//         const sourceInfo = sourceInfos[i];
//         if (
//           sourceInfo.kind == 'videoinput' &&
//           sourceInfo.facing == (isFront ? 'user' : 'environment')
//         ) {
//           videoSourceId = sourceInfo.deviceId;
//         }
//       }


//       mediaDevices
//         .getUserMedia({
//           audio: true,
//           video: {
//             mandatory: {
//               minWidth: 500, // Provide your own width, height and frame rate here
//               minHeight: 300,
//               minFrameRate: 30,
//             },
//             facingMode: isFront ? 'user' : 'environment',
//             optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
//           },
//         })
//         .then(stream => {
//           // Get local stream!
//           setlocalStream(stream);

//           // setup stream listening
//           peerConnection.current.addStream(stream);
//         })
//         .catch(error => {
//           // Log error
//         });
//     });

//     peerConnection.current.onaddstream = event => {
//       setRemoteStream(event.stream);
//     };

//     // Setup ice handling
//     peerConnection.current.onicecandidate = event => {

//     };

//     return () => {
//       socket.off('newCall');
//       socket.off('callAnswered');
//       socket.off('ICEcandidate');
//     };
//   }, []);







//   const [localMicOn, setlocalMicOn] = useState(true);

//   // Handling Camera status
//   const [localWebcamOn, setlocalWebcamOn] = useState(true);

//   // Switch Camera
//   function switchCamera() {
//     localStream.getVideoTracks().forEach((track) => {
//       track._switchCamera();
//     });
//   }

//   // Enable/Disable Camera
//   function toggleCamera() {
//     localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
//     localStream.getVideoTracks().forEach((track) => {
//       localWebcamOn ? (track.enabled = false) : (track.enabled = true);
//     });
//   }

//   // Enable/Disable Mic
//   function toggleMic() {
//     localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
//     localStream.getAudioTracks().forEach((track) => {
//       localMicOn ? (track.enabled = false) : (track.enabled = true);
//     });
//   }

//   // Destroy WebRTC Connection
//   function leave() {
//     peerConnection.current.close();
//     setlocalStream(null);
//     setType("JOIN");
//   }

//   const WebrtcRoomScreen = () => {
//     return (
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "#050A0E",
//           paddingHorizontal: 12,
//           paddingVertical: 12,
//         }}
//       >
//         {localStream ? (
//           <RTCView
//             objectFit={"cover"}
//             style={{ flex: 1, backgroundColor: "#050A0E" }}
//             streamURL={localStream.toURL()}
//           />
//         ) : null}
//         {remoteStream ? (
//           <RTCView
//             objectFit={"cover"}
//             style={{
//               flex: 1,
//               backgroundColor: "#050A0E",
//               marginTop: 8,
//             }}
//             streamURL={remoteStream.toURL()}
//           />
//         ) : null}
//         <View
//           style={{
//             marginVertical: 12,
//             flexDirection: "row",
//             justifyContent: "space-evenly",
//           }}
//         >
//           <IconContainer
//             backgroundColor={"red"}
//             onPress={() => {
//               leave();
//               setlocalStream(null);
//             }}
//             Icon={() => {
//               return <CallEnd height={26} width={26} fill="#FFF" />;
//             }}
//           />
//           <IconContainer
//             style={{
//               borderWidth: 1.5,
//               borderColor: "#2B3034",
//             }}
//             backgroundColor={!localMicOn ? "#fff" : "transparent"}
//             onPress={() => {
//               toggleMic();
//             }}
//             Icon={() => {
//               return localMicOn ? (
//                 <MicOn height={24} width={24} fill="#FFF" />
//               ) : (
//                 <MicOff height={28} width={28} fill="#1D2939" />
//               );
//             }}
//           />
//           <IconContainer
//             style={{
//               borderWidth: 1.5,
//               borderColor: "#2B3034",
//             }}
//             backgroundColor={!localWebcamOn ? "#fff" : "transparent"}
//             onPress={() => {
//               toggleCamera();
//             }}
//             Icon={() => {
//               return localWebcamOn ? (
//                 <VideoOn height={24} width={24} fill="#FFF" />
//               ) : (
//                 <VideoOff height={36} width={36} fill="#1D2939" />
//               );
//             }}
//           />
//           <IconContainer
//             style={{
//               borderWidth: 1.5,
//               borderColor: "#2B3034",
//             }}
//             backgroundColor={"transparent"}
//             onPress={() => {
//               switchCamera();
//             }}
//             Icon={() => {
//               return <CameraSwitch height={24} width={24} fill="#FFF" />;
//             }}
//           />
//         </View>
//       </View>
//     );
//   };













//   const JoinScreen = () => {
//     return (
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{
//           flex: 1,
//           backgroundColor: '#050A0E',
//           justifyContent: 'center',
//           paddingHorizontal: 42,
//         }}>
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <>
//             <View
//               style={{
//                 padding: 35,
//                 backgroundColor: '#1A1C22',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 borderRadius: 14,
//               }}>
//               <Text
//                 style={{
//                   fontSize: 18,
//                   color: '#D0D4DD',
//                 }}>
//                 Your Caller ID
//               </Text>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   marginTop: 12,
//                   alignItems: 'center',
//                 }}>
//                 <Text
//                   style={{
//                     fontSize: 32,
//                     color: '#ffff',
//                     letterSpacing: 6,
//                   }}>
//                   {callerId}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={{
//                 backgroundColor: '#1A1C22',
//                 padding: 40,
//                 marginTop: 25,
//                 justifyContent: 'center',
//                 borderRadius: 14,
//               }}>
//               <Text
//                 style={{
//                   fontSize: 18,
//                   color: '#D0D4DD',
//                 }}>
//                 Enter call id of another user
//               </Text>
//               <TextInputContainer
//                 placeholder={'Enter Caller ID'}
//                 value={otherUserId.current}
//                 setValue={text => {
//                   otherUserId.current = text;
//                 }}
//                 keyboardType={'number-pad'}
//               />
//               <TouchableOpacity
//                 onPress={() => {
//                   processCall();
//                   setType("OUTGOING_CALL");
//                 }}
//                 style={{
//                   height: 50,
//                   backgroundColor: "#5568FE",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   borderRadius: 12,
//                   marginTop: 16,
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: 16,
//                     color: "#FFFFFF",
//                   }}
//                 >
//                   Call Now
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     );
//   };

//   const OutgoingCallScreen = () => {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'space-around',
//           backgroundColor: '#050A0E',
//         }}>
//         <View
//           style={{
//             padding: 35,
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderRadius: 14,
//           }}>
//           <Text
//             style={{
//               fontSize: 16,
//               color: '#D0D4DD',
//             }}>
//             Calling to...
//           </Text>

//           <Text
//             style={{
//               fontSize: 36,
//               marginTop: 12,
//               color: '#ffff',
//               letterSpacing: 6,
//             }}>
//             {otherUserId.current}
//           </Text>
//         </View>
//         <View
//           style={{
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}>
//           <TouchableOpacity
//             onPress={() => {
//               setType('JOIN');
//               otherUserId.current = null;
//             }}
//             style={{
//               backgroundColor: '#FF5D5D',
//               borderRadius: 30,
//               height: 60,
//               aspectRatio: 1,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <CallEnd width={50} height={12} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const IncomingCallScreen = () => {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'space-around',
//           backgroundColor: '#050A0E',
//         }}>
//         <View
//           style={{
//             padding: 35,
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderRadius: 14,
//           }}>
//           <Text
//             style={{
//               fontSize: 36,
//               marginTop: 12,
//               color: '#ffff',
//             }}>
//             {otherUserId.current} is calling..
//           </Text>
//         </View>
//         <View
//           style={{
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}>
//           <TouchableOpacity
//             onPress={() => {
//               processAccept();
//               setType('WEBRTC_ROOM');
//             }}
//             style={{
//               backgroundColor: 'green',
//               borderRadius: 30,
//               height: 60,
//               aspectRatio: 1,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <CallAnswer height={28} fill={'#fff'} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // switch (type) {
//   //   case 'JOIN':
//   //     return JoinScreen();
//   //   case 'INCOMING_CALL':
//   //     return IncomingCallScreen();
//   //   case 'OUTGOING_CALL':
//   //     return OutgoingCallScreen();
//   //   default:
//   //     return null;
//   // }

//   console.log(type,'=============')

//   switch (type) {
//     case 'JOIN':
//       return JoinScreen();
//     case 'INCOMING_CALL':
//       return IncomingCallScreen();
//     case 'OUTGOING_CALL':
//       return OutgoingCallScreen();
//     case 'WEBRTC_ROOM':
//       return WebrtcRoomScreen();
//     default:
//       return null;
//   }
// }

import 'react-native-gesture-handler';

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { SockectProvider } from './src/context/SockectProvider'
import Main from './src/screens/Main'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Room from './src/screens/Room';
import Toast from 'react-native-toast-message';
import { GlobalStateProvider } from './src/context/GlobalStateProvider';
import Chat from './src/screens/Chat';
import Navigation from './src/Navigation';
const Stack = createStackNavigator();

const App = () => {

  return (
    <GlobalStateProvider>
      <SockectProvider>
        <NavigationContainer>
          <Navigation/>
          <Toast />
        </NavigationContainer>
      </SockectProvider>
    </GlobalStateProvider>
  )
}

export default App

const styles = StyleSheet.create({})