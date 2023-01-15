import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import Blockies from 'react-blockies'
import { FaAngleDown } from 'react-icons/fa'
import { useIsMounted } from '../hooks/useIsMounted'

const Connect = () => {
    const router = useRouter()
    const isMounted = useIsMounted()
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const [showMenu, setShowMenu] = useState(false)

    const handleCloseMenu = (e) => {
        const btnMenu = document.getElementById('btnMenu')
        if (btnMenu && !btnMenu.contains(e.target)) setShowMenu(false)   
    }
    
    useEffect(()=> {
        document.addEventListener('click', handleCloseMenu)

        return () => {
            document.removeEventListener('click', handleCloseMenu)
        }
    }, [])

    if (isMounted && isConnected) {
        return (
          <div className="relative cursor-default py-3">
            <div className="flex flex-row justify-between min-w-[200px] gap-2 ">
                <div className="bg-zinc-800 rounded-full text-white font-bold p-1 pr-3 flex flex-row items-center">
                    <Blockies seed={"metaprints" + address} size={6} scale={7} className="rounded-full mr-2 ml-1" />
                    {ensName ? `${ensName} (${address.substring(0, 5)}...${address.slice(0-3)})` : `${address.substring(0, 5)}...${address.slice(0-3)}`}
                </div>
                <div className="bg-yellow flex relative">
                            <div onClick={() => setShowMenu(showMenu ? false : true)} className="hover:cursor-pointer" id="btnMenu">
                                <div className="rounded-full text-white bg-zinc-800 hover:bg-zinc-900 p-4 md:p-5"><FaAngleDown /></div>
                            </div>
                            {showMenu ? (
                                <div className="absolute top-[70px] -right-0 z-[9999] bg-[#333333] rounded-xl w-[250px] text-center text-white font-roboto-b cursor-pointer">
                                    <ul>
                                        <li onClick={() => {
                                            setShowMenu(false)
                                            router.push("/")
                                        }}
                                            className="border-b rounded-t-xl p-3 border-zinc-800 hover:bg-zinc-900">
                                            Dashboard
                                        </li>           
                                        <li onClick={() => {
                                            setShowMenu(false)
                                            router.push("/developers")
                                        }}
                                            className="border-b p-3 border-zinc-700 hover:bg-zinc-900">
                                            Developers
                                        </li>                                                                                   
                                        <li onClick={disconnect}
                                            className="rounded-b-xl text-red-600 p-3 border-zinc-800 hover:bg-zinc-900">
                                            Logout
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
            </div>
               
          </div>
        )
    }

    return (
        <>
            <div className="bg-zinc-800 rounded-full text-white font-bold flex flex-row items-center p-4 px-10">Connect</div>
            <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center">    
                <div className="fixed top-0 left-0 w-screen h-screen bg-black opacity-75 z-40"></div>    
                <div className="bg-zinc-800 border w-96 p-5 rounded-lg flex items-center  justify-center flex-col z-50 text-white">
                    <div className="flex items-center justify-around mb-4">
                        <h3 className="text-3xl font-semibold text-left">Connect wallet</h3>
                    </div>
                    <div>
                        {isMounted && connectors.filter((connector) => connector.name !== 'Injected').map((connector) => (
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
        </>    
    )
}

export default Connect