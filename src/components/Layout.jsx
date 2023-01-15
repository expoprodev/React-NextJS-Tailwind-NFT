import React, {useState, useEffect, Fragment} from 'react'
import Meta from './Meta'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import SideBar from './dashboard/SideBar'
import TopBar from './dashboard/TopBar'
import { Transition } from '@headlessui/react'
import { useRouter } from 'next/router'

const Layout = ({children}) => {
    const router = useRouter()
    const [showNav, setShowNav] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    const handleResize = () => {
        if(innerWidth <= 640){
            setShowNav(false)
            setIsMobile(true)
        } else {
            setShowNav(true)
            setIsMobile(false)
        }
    }

    useEffect(() => {
        if(typeof window != undefined){
            addEventListener("resize", handleResize)
        }

        return () => {
            removeEventListener("resize", handleResize)
        }
    }, [])

    return (
        router.pathname.includes('/developers/dashboard') ?
            <>
                <TopBar showNav={showNav} setShowNav={setShowNav} />
                <Transition 
                    as={Fragment}
                    show={showNav}
                    enter="transform transition duration-[400ms]"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform duration-[400ms] transition ease-in-out"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                >
                    <SideBar showNav={showNav} />
                </Transition>
                <main className={`pt-16 transition-all duration-[400ms] ${showNav && !isMobile ? "pl-56" : ""}`}>
                    <div className='px-4 md:px-16'>
                        {/* Children Here!!! */}
                        {children} 
                    </div>
                </main>
            </>
        :
            <>
                <Meta/>    
                <div className="h-screen overflow-auto">               
                    {children}  
                </div>
                <ToastContainer
                    theme="colored"
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </>
        
    )
}

export default Layout
