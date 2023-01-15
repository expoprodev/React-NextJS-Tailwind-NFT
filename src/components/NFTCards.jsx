import { useState, useRef, useEffect } from 'react'

export const NFTCards = ({ avatars, selectAvatar }) => {
    const [selected, setSelected] = useState({collection: '', tokenId: 0 })
    const selectSound = useRef(typeof Audio !== "undefined" ? new Audio('/audio/select.mp3') : undefined)
    const hoverSound = useRef(typeof Audio !== "undefined" ? new Audio('/audio/hover.mp3') : undefined)
    
    const handleHover = (e) => {
        hoverSound.current?.play()
    }

    const handleLeave = (e) => {    
        if (!!hoverSound.current) {
            hoverSound.current?.pause();
            hoverSound.current?.load()
        }      
    }

    useEffect(()=> {
        if (avatars) {
            setSelected({collection: avatars[0].base_avatar.slug, tokenId: avatars[0].tokenId })
        }
    }, [avatars])

    useEffect(() => {
        if (!!selectSound.current) {
            selectSound.current.volume = 0.2;
        }

        if (!!hoverSound.current) {
            hoverSound.current.volume = 0.2;
        }
      }, [selectSound, hoverSound])
    
    return (
        <>
            <div className="w-full h-full hidden sm:flex flex-col md:skew-y-2 z-20 ">
                <div className="pl-2 grid sm:grid-cols-3 sm:gap-1 md:grid-cols-2 md:gap-2 lg:gap-4 w-full h-fit transition-colors transform relative">               
                    {
                        avatars?.map((data, i) =>  {     
                            return (
                                    <div className='relative'
                                        onMouseEnter={handleHover}
                                        onMouseLeave={handleLeave}
                                        key={i}>  
                                        <button onClick={() => {
                                            selectAvatar(data)
                                            setSelected({collection: data.base_avatar.slug, tokenId: data.tokenId })
                                            selectSound.current?.play()
                                        }}
                                        value={i}
                                        className={'bg-transparent flex flex-col p-0 lg:p-1 z-50 h-full max-h-[180px]'}>
                                        <img className="rounded-lg bg-cover object-cover w-full h-full scale-100 hover:scale-105 ease-in duration-500 sm:mb-1 md:mb-2"
                                            src={`/images/collections/${data.base_avatar.slug}/${data.base_avatar.slug}_${data.tokenId}.jpg`} 
                                            alt={data.tokenId}/>
                                    {
                                            selected.collection === data.base_avatar.slug && selected.tokenId === data.tokenId &&
                                        <div className='flex w-1/2 md:w-[50px] sm:h-[3px] md:h-[5px] z-40 bg-white ml-[10px]'></div>
                                    }
                                    </button>
                                </div>
                                )
                            })
                    }
                </div>
            </div>
        </>
    )
}
