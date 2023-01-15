import { useState, useRef, useEffect } from 'react'
import { AiFillAppstore } from 'react-icons/ai'

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
    <div className="w-[260px] h-full hidden sm:flex flex-col z-20 overflow-auto scrollbar-none ">
        <div className="pl-2 grid sm:grid-cols-3 sm:gap-1 md:grid-cols-1 md:gap-2 lg:gap-4 w-full h-fit transition-colors transform">
            
            {
                avatars?.map((data, i) =>  {     
                    return (
                        <div 
                            className="relative max-w-[260px]"
                            onMouseEnter={handleHover}
                            onMouseLeave={handleLeave}
                            key={i}>  
                            <button onClick={() => {
                                selectAvatar(data)
                                setSelected({collection: data.base_avatar.slug, tokenId: data.tokenId })
                                selectSound.current?.play()
                            }}
                            value={i}
                            className={`cardNFTShow ${(selected.collection === data.base_avatar.slug && selected.tokenId === data.tokenId) ? 'clipPath_shadow' : ''}` }>
                            {/* <img className="rounded-lg bg-cover object-cover w-full h-full  ease-in duration-500 sm:mb-1 md:mb-2 shadow-white/80 shadow-md   clipPath"
                                src={`/images/collections/${data.base_avatar.slug}/${data.base_avatar.slug}_${data.tokenId}.jpg`} 
                                alt={data.tokenId}/> */}
                            
                            
                            <svg viewBox="0 0 72.132362 64.724739"  width="100%" 
                                shapeRendering="geometricPrecision" 
	                            textRendering="geometricPrecision">
                                <defs>
                                    <clipPath id={`svgPath${i+1}`} transform="matrix(1.064147 0 0 1-66.60969-48.99748)">
                                        <path d="M256.250006,48.579455c-106.214573,0-191.710348,117.532562-191.710348,263.518908v2346.525181c0,145.986036,85.495775,263.568854,191.710348,263.518686l1575.60232-.741424c109.048089-53.777249,126.364574-138.367566,126.364574-239.26123v-147.268655c0-158.288354,83.563212-285.704504,198.728226-285.704504h109.36755c47.978317,0,120.080973-.820007,128.207049-148.231486l-1.078869-1788.83701c-.096904-145.986257-85.512281-263.518908-191.726887-263.518908Z"
         
                                        opacity={1}
                                        fill={'#000000'}
                                        fillOpacity={"0.28643218"} 
                                        stroke={'none'}
                                        strokeWidth="0.599108" 
                                        strokeLinecap={"round"} 
                                        strokeMiterlimit={4}
                                        strokeLinejoin={"round"} 
                                        strokeDasharray={'none'}
                                        strokeDashoffset="6"

                                        transform="matrix(.024199 0 0 0.02088 66.466252 50.629547)" 
                                        />
                                    </clipPath>
                                </defs>
                                <image xlinkHref={`/images/collections/${data.base_avatar.slug}/${data.base_avatar.slug}_${data.tokenId}.jpg`} x="0" y="0" height="100%" width="100%" clipPath={`url(#svgPath${i+1})`} />
                            </svg>

                            <div className='absolute left-5 top-2 flex flex-row justify-between text-xs text-left text-white p-2 w-full'>
                                <div className='flex flex-col'>
                                    <p>Name</p>
                                    <p>0.001ETH</p>
                                </div>
                                <p className='mr-11'>[{i+1}]</p>
                            </div>
            
                        </button>
                        <div className='bg-gray-600 absolute bottom-3 right-4 rounded-full p-2 text-white font-bold text-center justify-center items-center flex z-50'>
                            <AiFillAppstore className={`${(selected.collection === data.base_avatar.slug && selected.tokenId === data.tokenId) ? 'shadow-white/80 shadow-md' : ''}`}/>
                        </div>
                    </div>
                    )
                })
            }
        </div>
    </div>
  )
}
