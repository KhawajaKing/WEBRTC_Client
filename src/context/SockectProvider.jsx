import React,{createContext,useContext,useMemo, useState} from 'react'
import {io} from 'socket.io-client'
const SocketContext=createContext(null)

export const useSocket=()=>{
    const socket = useContext(SocketContext)
    return socket;
}


export const SockectProvider=(props)=>{

    const socket =useMemo(()=>io('http://192.168.0.112:8000'),[])

    return(
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}

// 192.168.100.7  M

// 192.168.0.112  O