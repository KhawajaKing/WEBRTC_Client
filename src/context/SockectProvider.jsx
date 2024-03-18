import React,{createContext,useContext,useMemo, useState} from 'react'
import {io} from 'socket.io-client'
import { localhost } from '../constant/common'
const SocketContext=createContext(null)

export const useSocket=()=>{
    const socket = useContext(SocketContext)
    return socket;
}


export const SockectProvider=(props)=>{

    const socket =useMemo(()=>io(localhost),[])

    return(
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}

// 192.168.100.7  M

// 192.168.0.102  O