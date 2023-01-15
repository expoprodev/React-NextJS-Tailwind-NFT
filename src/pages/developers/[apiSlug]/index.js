import { useRouter } from 'next/router'
import { Header } from '../../../components/Header'
import React, { useState, useEffect, useRef, Fragment } from 'react'
import { FaArrowAltCircleRight } from 'react-icons/fa'
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiTwitch,
} from 'react-icons/fi'
import {BsNewspaper} from 'react-icons/bs'
import {RiCoupon2Line} from 'react-icons/ri'
import api from '../../../lib/api'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import Swal from 'sweetalert2'
import { Dropdown } from 'flowbite-react'
import { Listbox, Transition } from '@headlessui/react'

export default function Dashboard() {
    const router = useRouter()
    const { address } = useAccount()
    const [navigate, setNavigate] = useState('dashboard')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [gameUsers, setgameUsers] = useState([])
    const [totalUsers, setTotalUsers] = useState(0)
    const [loginCounter, setLoginCounter] = useState(0)
    const [totalConnectedUsers, setTotalConnectedUsers] = useState(0)
    const apiId = router.query.apiSlug

    const fetchData = async() => {
      const users = await api.get(`/api/${apiId}/users`, {
        headers: {
          Authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      })
      console.log("🚀 ~ file: index.js:33 ~ fetchData ~ users", users.data.users)
      if(users.data){
        setTotalUsers(users.data.users.length)
        setgameUsers(users.data.users)
        setLoginCounter(users.data.loginCounter)
        setTotalConnectedUsers(users.data.activeUsers)
      }
    }

    useEffect(()=> {
      if (!address) return
      if(apiId){
        fetchData()
      }
    }, [apiId, address])

    return (
        <div className="w-screen h-max flex flex-col  overflow-y-auto overflow-x-hidden scrollbar-x">
      <Header />
      <div id="main" className="w-screen h-full bg-[#000203] py-2 relative">
        <div className="container mx-auto h-full flex overflow-hidden">
          <aside className="min-w-[239px] hidden sm:block min-h-full py-4 bg-transparent">
            <ul className="flex flex-col gap-2 text-xl mt-4 list-none justify-start text-white">
                {/* Dashboard */}
              <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'dashboard' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('dashboard')}
              >
                <FiHome className="w-[30px]" />
                <span>Dashboard</span>
              </li>
              {/* Users */}
              <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'users' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('users')}
              >
                <FiUsers className="w-[30px]" />
                <span>Users</span>
              </li>
              {/* Coupons */}
              {/* <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'coupons' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('coupons')}
              >
                <RiCoupon2Line className="w-[30px]" />
                <span>Coupons</span>
              </li> */}

              {/* Reviews */}
              {/* <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'reviews' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('reviews')}
              >
                <FiTwitch className="w-[30px]" />
                <span>Reviews</span>
              </li> */}

              {/* News */}
              {/* <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'news' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('news')}
              >
                <BsNewspaper className="w-[30px]" />
                <span>News</span>
              </li> */}

              {/* Settings */}
              <li
                className={`flex flex-row gap-1 justify-start items-center pl-4 py-2 cursor-pointer rounded-lg hover:bg-slate-400 hover:text-black ${
                  navigate === 'settings' ? 'bg-slate-400 text-black' : ''
                }`}
                onClick={() => setNavigate('settings')}
              >
                <FiSettings className="w-[30px]" />
                <span>Settings</span>
              </li>
             
            </ul>
          </aside>

          <div className="min-h-full w-full mx-6 py-4">
            {navigate === 'dashboard' && (
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

            {navigate === 'users' && (
              <div className="w-[calc(100% - 240px)] h-full">
                
                <div className="mt-4 rounded-t-lg grid grid-cols-1 md:grid-cols-3 gap-4 transform relative">
                    <div
                      className="p-6 rounded-lg shadow-md bg-zinc-800 text-gray-800"
                    >
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                          {totalUsers}
                        </h1>
                        <p className='text-xl tracking-normal text-white'>Total Users</p>
                    </div>

                    <div
                      className="p-6 rounded-lg shadow-md bg-zinc-800 text-gray-800"
                    >
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                          {loginCounter}
                        </h1>
                        <p className='text-xl tracking-normal text-white'>Login Counter</p>
                    </div>

                    <div
                      className="p-6 rounded-lg shadow-md bg-zinc-800 text-gray-800"
                    >
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                          {totalConnectedUsers}
                        </h1>
                        <p className='text-xl tracking-normal text-white'>Connected User</p>
                    </div>
                </div>

                <section className="w-full min-h-[258px] flex flex-col justify-center bg-zinc-800 rounded-2xl text-white mt-4 p-10 gap-2">
                    
                    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                        <div className="flex justify-between items-center pb-4 pt-2 px-2 bg-gray-900">
                            <div>
                              
                              <Listbox as='div' className="relative inline-block text-left" value={selectedStatus} onChange={setSelectedStatus}>
                                <div>
                                    <Listbox.Button className="inline-flex items-center border focus:outline-none focus:ring-4 font-medium rounded-lg text-sm px-3 py-1.5 bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700">
                                      <span className='mr-2 w-full h-full text-center text-gray-400 capitalize'>{selectedStatus}</span>
                                    </Listbox.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform scale-95"
                                    enterTo="transform scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform scale-100"
                                    leaveTo="transform scale-95"
                                >
                                    <Listbox.Options className="absolute left-0  mt-2 origin-top-right z-10 w-48 rounded divide-y shadow bg-gray-700 divide-gray-600">
                                        <div className='p-1'>
                                            <Listbox.Option value={'all'}>
                                                {/* <a href="#" className="block py-2 px-4 hover:bg-gray-600 hover:text-white">Online</a> */}
                                                <div className="py-2 px-4 hover:bg-gray-600 hover:text-white flex items-center cursor-pointer">
                                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div> All
                                                </div>
                                            </Listbox.Option>
                                            <Listbox.Option value={'online'}>
                                                {/* <a href="#" className="block py-2 px-4 hover:bg-gray-600 hover:text-white">Online</a> */}
                                                <div className="py-2 px-4 hover:bg-gray-600 hover:text-white flex items-center cursor-pointer">
                                                    <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> Online
                                                </div>
                                            </Listbox.Option>
                                            <Listbox.Option value={'offline'}>
                                              {/* <a href="#" className="block py-2 px-4 hover:bg-gray-600 hover:text-white">Offline</a> */}
                                              <div className="py-2 px-4 hover:bg-gray-600 hover:text-white flex items-center cursor-pointer">
                                                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div> Offline
                                              </div>
                                            </Listbox.Option>
                                        </div>
                                    </Listbox.Options>
                                </Transition>
                            </Listbox>
                                
                            </div>
                            <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                                </div>
                                <input type="text" id="table-search-users" className="block p-2 pl-10 w-80 text-sm rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Search for users" />
                            </div>
                        </div>
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs uppercasebg-gray-700 text-gray-400">
                                <tr>
                                    <th scope="col" className="py-3 px-6">
                                        Username
                                    </th>
                                    <th scope="col" className="py-3 px-6">
                                        Useraddress
                                    </th>
                                    <th scope="col" className="py-3 px-6">
                                        Character Name
                                    </th>
                                    <th scope="col" className="py-3 px-6">
                                        Classification
                                    </th>
                                    <th scope="col" className="py-3 px-6">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                              {gameUsers.length > 0 ? 
                                gameUsers.map((user, i) => 
                                <tr className="border-b bg-gray-800 border-gray-700 hover:bg-gray-600" key={user._id}>
                                  <th scope="row" className="flex items-center py-4 px-6 whitespace-nowrap text-white">
                                      <div className="pl-3">
                                          <div className="text-base font-semibold">{user.userId.username}</div>
                                          <div className="font-normal text-gray-500">{user.userId.email}</div>
                                      </div>  
                                  </th>
                                  <td className="py-4 px-6">
                                      {(user.userId.userAddress).substring(0, 5)}...{(user.userId.userAddress).slice(0-3)}
                                  </td>
                                  <td className="py-4 px-6">
                                    <a href="#" className="font-medium text-blue-500 hover:underline">{user.name}</a>  
                                  </td>
                                  <td className="py-4 px-6">
                                      <p className="font-medium text-blue-500 hover:underline">{user.classification}</p>
                                  </td>
                                  <td className="py-4 px-6">
                                      <div className="flex items-center">
                                          <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> Online
                                      </div>
                                  </td>
                                  
                              </tr>)
                                 : 
                                <tr>
                                  <td colSpan='5' className='text-center text-md font-bold p-4'>No user data</td>
                                </tr>
                              }
                                
                            </tbody>
                        </table>
                    </div>

                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    )
}