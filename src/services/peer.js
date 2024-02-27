import { RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";

class PeerService{
    constructor(){
        if(!this.peer){
            this.peer=new RTCPeerConnection({
                iceServers:[{
                    urls:[
                        'stun:stun.l.google.com:19302',
                        'stun:globalstun.twilio.com:3478',
                    ]

                }]
            })
        }
    }

    // async getOffer(){
    //     if (this.peer) {
    //         const offer = this.peer.createOffer()
    //         await this.peer.setLocalDescription(new RTCSessionDescription(offer))
    //         return offer
    //     }
    // }

    async getAnswer(offer){
        if (this.peer) {
            try {
                await this.peer.setRemoteDescription(offer)
                const ans=await this.peer.createAnswer()
                await this.peer.setLocalDescription(new RTCSessionDescription(ans));
                return ans
            } catch (error) {
                console.error("Error in Incomming Call:", error);
                return null; // Return null or handle the error as appropriate
            }
            
        }
    }
    async setLocalDescription(ans){
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
        }
    }

    async getOffer() {
        if (this.peer) {
            try {
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(new RTCSessionDescription(offer));
                return offer;
            } catch (error) {
                console.error("Error creating offer:", error);
                return null; // Return null or handle the error as appropriate
            }
        }
        return null;
    }
}

export default new PeerService();