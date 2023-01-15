import { useState, useEffect, lazy } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAccount } from 'wagmi'
import { FaLongArrowAltLeft } from 'react-icons/fa'
import { Header } from '../components/Header'
import { NFTCards } from '../components/show/NFTCards'
import ModelViewer from '../components/ModelViewer'
import { toast } from 'react-toastify'
import ModelShow from '../components/show/ModelShow'

const LandingPage = () => {
  const router = useRouter()
  const [access_token, setAccessToken] = useState()
  const { address, isConnected } = useAccount()
  const [avatars, setAvatars] = useState()
  const [avatar, setAvatar] = useState()
  const [equippedWearables, setEquippedWearables] = useState()
  const [showMenu, setShowMenu] = useState()


  const getAccessToken = async () => {
    const {
      data: { access_token },
    } = await api.post(`/api/v1/auth`, {
      apikey: process.env.API_KEY,
    })

    setAccessToken(access_token)
    window.localStorage.setItem('token', access_token)
  }

  const connectUser = async (address) => {
    const { data } = await api.post(
      '/api/v1/auth/connect',
      {
        userAddress: address,
      },
      {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      }
    )
  }

  useEffect(() => {
    getAccessToken()
  }, [])

  useEffect(() => {
    if (address) {
      getUsersNFTs()
      connectUser(address)
    }
  }, [isConnected])

  const getUsersNFTs = async () => {
    const { data } = await api.post(
      '/api/v1/users/verify',
      {
        userAddress: address,
        isDemo: true,
      },
      {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      }
    )

    if (data.success) {
      const _avatars = data.avatars.sort(
        (a, b) =>
          a.base_avatar.slug > b.base_avatar.slug && a.tokenId > b.tokenId
      )
      setAvatars(_avatars)
      selectAvatar(_avatars[0])
    }
  }

  const selectAvatar = async (avatar) => {
    setAvatar(avatar)
    const wearables = avatar.wearables

    const defaultWearables = {}
    wearables.map((item) => {
      defaultWearables = {
        ...defaultWearables,
        [item.trait_type.toLowerCase()]: item,
      }
    })

    if (wearables.length !== 0) {
      setEquippedWearables(defaultWearables)
    }
  }

  const setSelectedAvatar = async () => {
    const { data } = await api.post(
      `/api/v1/avatars/select`,
      {
        userAddress: address,
        avatarId: avatar.id,
      },
      {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      }
    )

    setShowMenu(true)
  }

  return (
    <div className="h-screen flex flex-col bg-[#000203]">
      <Header />
      <div
        id="main"
        className="h-[calc(100%-117.5px)] overflow-hidden scrollbar-none w-full relative"
      >
        <div className="absolute -top-10 sm:top-0 right-0 left-0 bottom-0 z-10">
          <div className="w-full flex items-center">
            {avatar && (
              <ModelShow
                avatar={avatar}
                equippedWearables={equippedWearables}
                type={'3D'}
              />
            )}
          </div>
        </div>

        <div className="absolute top-0 right-4 sm:relative h-screen items-center w-full sm:w-[35%] max-w-[450px] flex flex-col sm:p-0 md:p-2 z-20">
              <div className='px-8 py-4 mt-16 ml-8'>
                <h1 className='text-white text-[6rem] leading-[6rem] uppercase h-full '>get ready for a new casual</h1>
                <button onClick={setSelectedAvatar} className="py-3 px-16 rounded-full text-white bg-zinc-800 hover:bg-zinc-900 font-roboto-h font-lg">
                  EXPLORE
                </button>
                {/* <svg viewBox="0 0 80 80" width="100%">
                  <defs>
        
                  <clipPath id="svgPath" transform="matrix(1.064147 0 0 1-66.60969-48.99748)">
                    <path d="M256.250006,48.579455c-106.214573,0-191.710348,117.532562-191.710348,263.518908v2346.525181c0,145.986036,85.495775,263.568854,191.710348,263.518686l1575.60232-.741424c109.048089-53.777249,126.364574-138.367566,126.364574-239.26123v-147.268655c0-158.288354,83.563212-285.704504,198.728226-285.704504h109.36755c47.978317,0,120.080973-.820007,128.207049-148.231486l-1.078869-1788.83701c-.096904-145.986257-85.512281-263.518908-191.726887-263.518908Z" 
                      transform="matrix(.024199 0 0 0.02088 66.466252 50.629547)" fillOpacity="0.286432" strokeWidth="0.599108" strokeLinecap="round" strokeLinejoin="round" strokeDashoffset="6"/>
            
                    </clipPath>
   
                    </defs>
                    <image xlinkHref="http://i.stack.imgur.com/3DR2G.jpg" x="0" y="0" height="500" width="500" clipPath="url(#svgPath)" />
                  </svg> */}
              </div>
        </div>

        <div className="absolute top-0 right-0 h-full  w-full sm:w-[35%] max-w-[450px] flex flex-col sm:p-0 md:p-2 z-50">
            <div className="w-full h-full px-0 md:px-10 mt-0 md:my-auto flex justify-end">
              <NFTCards avatars={avatars} selectAvatar={selectAvatar} />
            </div>
        </div>
        
      </div>
    </div>
  )
}

export default LandingPage
