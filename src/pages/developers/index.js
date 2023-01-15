import { useRouter } from 'next/router'
import { Header } from '../../components/Header'
import React, { useState, useEffect, useRef } from 'react'
import { FaArrowAltCircleRight } from 'react-icons/fa'
import {
  FiHome,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiLock,
  FiBook,
  FiTrash2,
} from 'react-icons/fi'
import api from '../../lib/api'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Swal from 'sweetalert2'

export default function Developers() {
  const { address } = useAccount()
  const apiInputRef = useRef()
  const router = useRouter()
  const [navigate, setNavigate] = useState('home')
  const [apikeys, setApiKeys] = useState([])
  const [showApiKey, setShowApiKey] = useState({})

  const fetchApikey = async () => {
    const { data } = await api.get(`/api/v1/apikeys/${address}`, {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('token')}`,
      },
    })
    setApiKeys(data.apikeys)
  }

  useEffect(() => {
    if (!address) return
    fetchApikey()
  }, [address])

  const generateApi = async () => {
    const gameName = apiInputRef.current.value
    if (gameName === '') return

    await api
      .post(
        `/api/v1/apikeys`,
        {
          userAddress: address,
          gameName,
        },
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          },
        }
      )
      .then(({ data }) => {
        if (data.success) {
          toast.success('Success! you have generated your API Key!')
          fetchApikey()
        } else {
          toast.error(data.message)
        }
      })
  }

  const deleteApiKey = (gameId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { data: res } = await api.put(
          `/api/v1/apikeys`,
          {
            gameId,
          },
          {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
          }
        )

        if (res.success) {
          toast.success('Successfully deleted an API key!')
          fetchApikey()
        } else {
          toast.error(res.message)
        }
      }
    })
  }

  const viewApiKey = (gameId) => {
    const apikeyList = { ...showApiKey }
    if (apikeyList[gameId]) {
      delete apikeyList[gameId]
    } else {
      apikeyList[gameId] = true
    }
    setShowApiKey(apikeyList)
  }

  return (
    <div className="w-screen h-max flex flex-col  overflow-y-auto overflow-x-hidden scrollbar-x">
      <Header />
      <div id="main" className="w-screen h-full bg-[#000203] py-2 relative">
        <div className="container mx-auto h-full flex overflow-hidden">
          <aside className="min-w-[239px] hidden sm:block min-h-full py-4 bg-transparent">
            <ul className="flex flex-col gap-2 text-xl mt-4 list-none justify-start text-white">
              <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'home' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('home')}
              >
                <FiHome className="w-[30px]" />
                <span>Home</span>
              </li>
              <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'api' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('api')}
              >
                <FiLock className="w-[30px]" />
                <span>APIs</span>
              </li>
              <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black`}
                onClick={() =>
                  router.push(
                    'https://jm-de-leon.gitbook.io/cross-world-avatars/'
                  )
                }
              >
                <FiBook className="w-[30px]" />
                <span>Documentation</span>
              </li>
            </ul>
          </aside>
          <div className="min-h-full w-full mx-6 py-4">
            {navigate === 'home' && (
              <div className="w-[calc(100% - 240px)] h-full">
                <h1 className="text-white text-4xl font-bold">
                  Hi There &#128075;
                </h1>
                <section className="w-full h-[258px] flex flex-col justify-center bg-zinc-800 rounded-2xl text-white mt-4 p-10 gap-2">
                  <p className="text-xl">Need Help?</p>
                  <h1 className="text-4xl font-bold">
                    Looking to get started?
                  </h1>
                  <div className="flex gap-2 mt-2">
                    <button className="border border-gray-500 rounded-lg flex justify-between items-center px-4 py-1 gap-4">
                      API References <FaArrowAltCircleRight />
                    </button>
                    <button className="border border-gray-500 rounded-lg flex justify-between items-center px-4 py-1 gap-4">
                      Tutorials <FaArrowAltCircleRight />
                    </button>
                  </div>
                </section>
              </div>
            )}

            {navigate === 'api' && (
              <div className="w-[calc(100% - 240px)] h-full">
                <section className="w-full h-[258px] flex flex-row bg-zinc-800 rounded-2xl text-black mt-4">
                  <div className="w-full flex flex-col justify-center p-8 space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                      Generate API Key
                    </h1>
                    <div>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          ref={apiInputRef}
                          type="text"
                          name="gamename"
                          className="block h-[50px] w-full rounded-md border-gray-300 pl-2 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Game Name"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 mr-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={generateApi}
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative w-2/3 flex gap-4 text-gray-600 items-center"></div>
                  </div>
                </section>

                <div className="mt-4 rounded-t-lg grid grid-cols-1 md:grid-cols-2 gap-4 transform relative">
                  {apikeys.map((data, i) => (
                    <div
                      className="p-6 rounded-lg shadow-md bg-zinc-800 text-gray-800"
                      key={i + 1}
                    >
                      <a href="#">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
                          {data.gameName}
                        </h5>
                      </a>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          type={showApiKey[data.gameId] ? 'text' : 'password'}
                          name="apikey"
                          className="block h-[50px] w-full rounded-md border-gray-300 pl-2 pr-16 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Game Name"
                          value={data.apikey}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center mr-2 gap-2">
                          <span
                            className="inline-flex items-center p-2 cursor-pointer border-r border-gray"
                            onClick={() => viewApiKey(data.gameId)}
                          >
                            {showApiKey[data.gameId] ? <FiEyeOff /> : <FiEye />}
                          </span>
                          <CopyToClipboard
                            text={data.apikey}
                            onCopy={() => toast.success('Copied!')}
                          >
                            <button>
                              <FiCopy />
                            </button>
                          </CopyToClipboard>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <a
                          href={'/developers/' + data.gameId}
                          className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 focus:ring-4 focus:outline-none "
                        >
                          View
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 ml-2 -mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </a>
                        <button
                          onClick={() => deleteApiKey(data.gameId)}
                          className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 focus:ring-4 focus:outline-none "
                        >
                          <FiTrash2 className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
