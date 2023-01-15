import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import api  from '../../../lib/api'
import Image from 'next/image'
import { VRMViewer } from '../../../components/VRMViewer'

const Customize = ({ avatar }) => {
    const [equippedWearables, setEquippedWearables] = useState()
    const router = useRouter()

    const getWearables = async () => {
        const defaultWearables = {}
        avatar.wearables.map((item) => {           
            defaultWearables = {...defaultWearables, [item.trait_type.toLowerCase()]: item }
        })

        setEquippedWearables(defaultWearables)
    }

    useEffect(() => {
        if (avatar) {
            getWearables()
        }
    }, [avatar])


    return (
        <div className="w-screen h-screen flex flex-col">           
            <div id="main" className="w-screen h-[100vh] bg-[#000203] py-2 text-white overflow-hidden lg:overflow-auto scrollbar-x relative">
            
                <div className="w-full h-full">
                <div className="absolute top-0 right-0 left-0 bottom-0 z-10">
                        <div className="w-full flex items-center">
                            <VRMViewer avatar={avatar} equippedWearables={equippedWearables} type={'vrm'}/>                   
                        </div>
                    </div>
                    </div>
            </div>
           
        </div>
    )
}

Customize.getInitialProps = async ({ query }) => {
    const { slug  } = query
    const { data }  = await api.get(`/api/v1/avatars/${slug}`)
    const avatar = data.avatar
    return {
       avatar: {...avatar, traits: null}
    }
}

export default Customize
