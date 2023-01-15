import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAccount } from 'wagmi'
import { FaLongArrowAltLeft } from 'react-icons/fa'
import { Header } from '../components/Header'
import { NFTCards } from '../components/NFTCards'
import ModelViewer from '../components/ModelViewer'
import { LoadingModal } from '../components/LoadingModal'
import { toast } from 'react-toastify'
import { Button } from 'react-babylonjs'

const Home = () => {
    const router = useRouter()
    const { address, isConnected } = useAccount()
    const [avatars, setAvatars] = useState()
    const [avatar, setAvatar] = useState()
    const [equippedWearables, setEquippedWearables] = useState()
    const [showMenu, setShowMenu] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [type, setType] = useState("3D")

    const getAccessToken = async () => {
        setIsLoading(true)
        const { data: {access_token} }  = await api.post(`/api/v1/auth`, {
            apikey: process.env.API_KEY
        })
        window.localStorage.setItem('token', access_token)
    }

    const connectUser = async (address) => {
       
        const { data } = await api.post('/api/v1/auth/connect', {
            userAddress: address
        }, {
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            }
        })

        if (data.success) {
            await getUsersNFTs()
        }
        setIsLoading(false)
    }

    useEffect(() => {
        console.log(address)
        if (address) {
            
            getAccessToken()
            connectUser(address)
           
        }

        return () => {
            console.log('unmounted')
        }
    }, [address])

    const getUsersNFTs = useCallback(async() => {       
        const {data} = await api.post('/api/v1/users/verify', {
            userAddress: address,
            isDemo: true
        }, {
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            }
        })
       
        if (data.success) {
            setAvatars(data.avatars)
            selectAvatar(data.avatars[0])
        }
    })

    const selectAvatar = async(avatar) => {
        setAvatar(avatar)
        const wearables = avatar.wearables

        const defaultWearables = {}
        wearables.map((item) => {               
            defaultWearables = {...defaultWearables, [item.trait_type.toLowerCase()]: item }
        })

        if (wearables.length !== 0) {
            setEquippedWearables(defaultWearables)
        } 
    }

    const setSelectedAvatar = async () => {
        const { data } = await api.post(`/api/v1/avatars/select`, {
            userAddress: address,
            avatarId: avatar.id
        },{
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            }
        })

        setShowMenu(true)
    }

    return (
        <div className="h-screen flex flex-col bg-[#000203]">
            <Header/>
            <div id="main" className="h-[calc(100%-117.5px)] overflow-auto scrollbar-none ">
                <div className="absolute top-0 right-4 sm:relative h-full justify-between w-full sm:w-[35%] max-w-[450px] flex flex-col sm:p-0 md:p-2 z-20 ">
                    {
                        showMenu ? (
                            <div className="w-full h-full px-0 md:px-10 mt-0 md:my-auto flex items-center justify-center">
                                    <ul className="text-[34px] font-roboto-h text-white my-auto">
                                        <li>
                                            <a href={"/avatars/" + avatar?.id}>
                                                MULTIVERSE3D
                                            </a>
                                        </li>
                                        <li>
                                            <button onClick={() => setType('voxel')}>
                                                VOXELVERSE
                                            </button>
                                        </li>
                                        <li>
                                            <a href={"/avatars/vrm/" + avatar?.id}>
                                                LIVE3D
                                            </a>
                                        </li>
                                        <li>
                                            <div onClick={()=>setShowMenu(showMenu => !showMenu)} className="cursor-pointer">
                                                <FaLongArrowAltLeft className='inline' /> BACK
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                        ) : (
                            <div className="w-full h-full px-0 md:px-10 mt-0 md:my-auto">
                                <NFTCards avatars={avatars} selectAvatar={selectAvatar}/>      
                            </div>
                        )
                    }
                </div>              
                <div className="absolute -top-10 sm:top-0 right-0 left-0 bottom-0 z-10">
                    <div className="w-full flex items-center">
                        
                        {
                            avatar &&
                            <ModelViewer avatar={avatar} equippedWearables={equippedWearables} type={type}/>    
                        }
                       
                           
                    </div>
                </div>
                {
                    avatar &&
                    <button onClick={setSelectedAvatar} className="absolute right-10 bottom-10 z-50 py-4 px-10 rounded-full text-white bg-zinc-800 hover:bg-zinc-900 font-roboto-h font-lg">
                        SELECT
                    </button>
                }

                {
                    isLoading &&
                    <LoadingModal message={"while we are loading your avatars."}/>
                }
                
            </div>
       </div>
    )
  }

export default Home
