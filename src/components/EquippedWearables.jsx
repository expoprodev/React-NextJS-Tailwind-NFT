import { useState } from 'react'
import { useColor } from 'color-thief-react'
import { useEffect } from 'react'

const Wearable = ({ data }) => {
    
    const { data: color } = useColor('/uploads/wearables/' + data.image, 'hex')
    const bgGradient = { background: `linear-gradient(45deg, ${color}, transparent 100%)`, opacity: 0.5, zIndex: -1}
    return (
        <div className='relative'
            key={data.wearableId}>          
            <button
                value={data._id}
                className={'bg-transparent p-1 z-50 h-[120px] md:h-[160px] lg:h-[180px]'}>
                <img
                    className="rounded-lg bg-cover "
                    src={'/uploads/wearables/' + data.image}
                    alt={data.name}
                />
               
            </button>
            <div className='absolute top-0 w-full h-full rounded-tl-xl rounded-br-xl' style={bgGradient}></div>
            <div className='absolute bottom-0 left-0 w-[30px] h-[5px] z-40' style={{background: color}}></div>          
        </div>
        
    )
}



export const EquippedWearables = ({ equippedWearables, traits }) => {   
    const [wearables, setWearables] = useState([])
    const [slots, setSlots] = useState()

    useEffect(()=> {
        const _wearables = []
        Object.keys(equippedWearables).forEach(async (key, i) => {
            if (key === 'Background') return
            const wearable = equippedWearables[key]
            _wearables.push(wearable)
        })

        setWearables(_wearables)

    }, [equippedWearables])
    useEffect(()=>{
        if (wearables && traits) {
            let arr = []
            for (let i = 0; i < (traits.length - wearables.length); i++){
                arr.push(i)
            }
    
            console.log(arr)
            setSlots(arr)
        }
        
    },[wearables, traits])

    if (!equippedWearables) return null
    return (
        <>
            <div className='hidden lg:block w-[60px] z-50 md:skew-y-2'>
                <div className="h-[40px]"></div>
                {slots && slots.map((data)=> <div key={data} className='bg-gray-900 w-full h-[5px] mb-2'></div>)}
                {wearables.map((wearable, i) => <div key={wearable._id + '' + i} className='bg-gray-200 w-full h-[5px] mb-2'/>)}                                                
            </div>
            <div className="hidden w-full sm:flex flex-col skew-y-2 z-20">
                <ul className="pl-2 my-3 flex z-50 flex-row font-lg font-roboto-b justify-between text-gray-500">
                    <li>EQUIPPED WITH</li>
                    <li>{wearables.length}/{traits.length}</li>
                </ul>
                <div className="flex flex-row md:pl-2 sm:grid sm:grid-cols-3 sm:gap-2 md:grid-cols-2 md:gap-2 lg:gap-4 w-full transition-colors transform relative">               
                    {wearables.map((wearable, i) => <Wearable key={wearable._id + '' + i} data={wearable}/>)}
                    {slots && slots.map((data)=> 
                            <div className='relative' key={data}>          
                                <button className={'bg-transparent p-1 z-50 h-[120px] md:h-[160px] lg:h-[180px]'}> 
                                </button>
                                <div className='absolute top-0 w-full h-full rounded-tl-xl rounded-br-xl' style={{background: `linear-gradient(45deg, gray, transparent 100%)`, opacity: 0.3, zIndex: -1}}></div>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}
