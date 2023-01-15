import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import api from '../../lib/api'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { toast } from 'react-toastify'
import io from "socket.io-client"
import Blockies from 'react-blockies'
import { useIsMounted } from '../../hooks/useIsMounted'
let socket

const Connect = () => {
    const router = useRouter()
    const isMounted = useIsMounted()
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const [connected, setConnected] = useState(false)
    //http://localhost:3001/auth/connect?apikey=lJfSitK7eOv2wfIsMbGKS1QZ8IBN66snfjHCrQPw0fvW3LkevI&uuid=1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
    console.log(router.query)

    if (router.query) {
        console.log(router.query)
    }

    
    const socketInitializer = useCallback(async () => {
        // We just call it because we don't need anything else out of it
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/socket`);

        socket = io(`${process.env.NEXT_PUBLIC_URL}`);

        socket.on("TOTAL_CLIENT", (total)=> {
            console.log(total)
        })
    })
    useEffect(() => {
        socketInitializer()
    }, [])

    useEffect(()=> {
        if (socket) socket.emit('REACT_CONNECT_WITH_UUID', router.query.uuid)
    },[router.query.uuid])

    const getAccessToken = async (apikey) => {
        const { data: {access_token} }  = await api.post(`/api/v1/auth`, {
            apikey: apikey
        })

        return access_token
    }

    const connectUser = useCallback(async (address) => {
        const { data } = await api.post('/api/v1/auth/connect', {
            userAddress: address
        }, {
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            }
        })

        if (data.success) {
            
        }
    })

    useEffect(() => {
        if (address && router.query.uuid) {
            if (socket) socket.emit('SIGN_RESULT_WALLET_EVENT', router.query.uuid)
        }

        return () => {
            console.log('unmounted')
        }
    }, [address])

    if (isMounted) {
    return (
        <div className="h-screen flex flex-col bg-[#000203]">
            {/* <Header/> */}
            <div id="main" className="h-[calc(100%-117.5px)] overflow-auto scrollbar-none ">
                <div className="absolute top-0 right-4 sm:relative h-full justify-between w-full sm:w-[35%] max-w-[450px] flex flex-col sm:p-0 md:p-2 z-20 ">
                  {
                    !isConnected ?  
                    <div>
                        <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center">    
                            <div className="fixed top-0 left-0 w-screen h-screen bg-black opacity-75 z-40"></div>    
                            <div className="bg-zinc-800 border w-96 p-5 rounded-lg flex items-center  justify-center flex-col z-50 text-white">
                                <div className="flex items-center justify-around mb-4">
                                    <h3 className="text-2xl font-semibold text-left">Log-in to Unreal Engine</h3>
                                </div>
                                <div>
                                    {connectors.filter((connector) => connector.name !== 'Injected').map((connector) => (
                                        <button disabled={!connector.ready} key={connector.id} onClick={() => connect({ connector }) } className="bg-[#1e1e1e] hover:bg-[#2e2e2e] active:bg-[#3e3e3e] w-full my-1 inline-flex text-center items-center px-6 py-3 text-base rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                                        <img src={`/images/${connector.id}.svg`} alt={connector.name} height={32} width={32}/>
                                        <span className='ml-2'>{connector.name}</span>
                                        {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                                        </button>
                                    ))}
                                </div>

                                {error && <div>{error.message}</div>}
                            </div>
                        </div>
                    </div>
                    :
                    <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center gap-5"> 
                        <div className="bg-zinc-800 rounded-full text-white font-bold p-1 pr-3 flex flex-row items-center h-[50px]">
                            <Blockies seed={"metaprints" + address} size={6} scale={7} className="rounded-full mr-2" />
                            {ensName ? `${ensName} (${address.substring(0, 5)}...${address.slice(0-3)})` : `${address.substring(0, 5)}...${address.slice(0-3)}`}
                        </div>
                        <button onClick={disconnect} className="bg-zinc-800 rounded-full text-white font-bold p-3 px-5 flex flex-row items-center h-[50px]">
                            Disconnect
                        </button>
                    </div>
                  }
                </div>    
            </div>
       </div>
    )
  }
}
export default Connect
