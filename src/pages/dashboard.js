import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectCoverflow } from "swiper";
import { ModelPreview } from '../components/ModelPreview';
import { Header } from '../components/Header';
import {  FaLongArrowAltLeft } from 'react-icons/fa'
import { useAccount } from 'wagmi'
import 'swiper/css';
import "swiper/css/navigation";

const Home = () => {
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const [selectedAvatar, setSelectedAvatar] = useState()
    const [avatars, setAvatars] = useState()
    const [showControl, setShowControl] = useState()

    const getNFTs = async () => {
        const { data }  = await api.get(`/api/users/avatars/${address}`)
        setAvatars(data.avatars)
    }
    
    useEffect(()=>{
        getNFTs()
    }, [address, router.isReady])

    const getUserAvatars = async (userAddress) => {
        const {data} = await api.get(`/api/users/avatars/${userAddress}`)
        setAvatars(data.avatars)
    }

    const gotoViewer = (index) => {
        const avatar = typeof selectedAvatar === 'undefined' ? avatars[0] : selectedAvatar
        if (index === 2) {
            router.push(`/avatars/vrm/${avatar?._id}`)
        } else if (index === 1) {
            router.push(`/avatars/voxel/${avatar?._id}`)
        } else {
            router.push(`/avatars/${avatar?._id}`)
        }
    }

    return (
        <div className="h-screen flex flex-col bg-[#000203]">
            <Header/>
            <div id="main" className="h-[100vh] py-2 text-white overflow-auto scrollbar-x">
                <div className="w-full h-full px-10 pb-[116px] flex flex-row gap-[50px] z-50">
                    <div className='w-full rounded-3xl'>
                        <Swiper  
                            //effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={3}
                            // coverflowEffect={{
                            //     rotate: 0,
                            //     stretch: 0,
                            //     depth: 100,
                            //     modifier: 1,
                            //     slideShadows: false
                            // }}
                            pagination={true}
                            navigation={true}
                            modules={[Pagination, EffectCoverflow, Navigation]}
                            className="swiper h-full"
                            onSlideChange={(swiperCore) => {
                                const { activeIndex } = swiperCore
                            }}
                            onSwiper={(swiper) => console.log(swiper)}>
                            {
                                avatars && avatars?.map((item) => (                                        
                                    <SwiperSlide key={item._id} className="h-full w-full">
                                        <div className="carousel-slider-animate-opacity">
                                            <button onClick={()=> {
                                                setShowControl(showControl ? false : true)
                                                setSelectedAvatar(item)
                                            }} className='text-[36px] text-bold font-roboto-h'>{item.name}
                                                <ModelPreview avatar={item} />
                                            </button>
                                        </div>                                        
                                    </SwiperSlide>
                                ))
                            }
                        </Swiper>
                    </div>
                </div>
                {
                    showControl &&
                    <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[100]">
                    <div className='w-screen h-full bg-zinc-800 text-white pb-2'>
                        <div className="modal-content h-full overflow-none text-left p-6">                    
                            <div className="flex justify-between items-center font-roboto-b">
                                <p className="text-2xl font-bold"></p>
                                <div onClick={()=>setShowControl(showControl ? false : true) } className="modal-close cursor-pointer z-50">
                                    <svg className="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 18 18">
                                    <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                                    </svg>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between absolute top-0 left-0 bottom-0 right-0 pt-5 px-6">
                                <div className="w-1/2 flex flex-col h-full justify-center ">
                                    <ul className="text-[34px] font-roboto-h text-white mx-auto">
                                        <li>
                                            <a href={"/avatars/" + selectedAvatar?._id}>
                                                MULTIVERSE3D
                                            </a>
                                        </li>
                                        <li>
                                            <a href={"/avatars/voxel/" + selectedAvatar?._id}>
                                                VOXELVERSE
                                            </a>
                                        </li>
                                        <li>
                                            <a href={"/avatars/vrm/" + selectedAvatar?._id}>
                                                LIVE3D
                                            </a>
                                        </li>
                                        <li>
                                            <a href={"/avatars/vrm/" + selectedAvatar?._id}>
                                                PIXELVERSE
                                            </a>
                                        </li>
                                        <li>
                                            <a href={"/avatars/vrm/" + selectedAvatar?._id}>
                                                <FaLongArrowAltLeft className='inline' /> BACK
                                            </a>
                                        </li>
                                    </ul>

                                </div>
                                <div className="w-1/2 relative">
                                    <ModelPreview avatar={selectedAvatar || avatars[0]} />
                                </div>
                            </div>
                            
                        </div>

                    </div>
                </div>
                }
            </div>
        </div>
    )
}

export default Home
