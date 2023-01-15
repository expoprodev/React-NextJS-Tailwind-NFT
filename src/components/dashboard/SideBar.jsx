import React, {forwardRef} from 'react'
// import Link from 'next/link'
import {HomeIcon, CreditCardIcon, UserIcon} from '@heroicons/react/24/solid'
import { useRouter } from 'next/router'

const SideBar = forwardRef(({showNav}, ref) =>{
    const router = useRouter()
    // const navItems = [
    //     {
    //         name: 'Home',
    //         link: '/',
    //         icon: <HomeIcon className="h-5 w-5" />,
    //     },
    //     {
    //         name: 'Account',
    //         link: '/account',
    //         icon: <UserIcon className="h-5 w-5" />,
    //     },
    //     {
    //         name: 'Billing',
    //         link: '/billing',
    //         icon: <CreditCardIcon className="h-5 w-5" />,
    //     },
    // ]
    return (
        <div ref={ref} className='fixed w-56 h-full bg-gray-800 shadow-sm'>
            <div className='flex justify-center mt-6 mb-14'>
                <picture>
                    <img className='w-32 h-auto ' src="/logo.png" alt='Metaprints' />
                </picture>
            </div>

            <div className='flex flex-col'>
                {/* {navItems.map((navItem, i) => (
                    <Link href={{pathname: `${navItem.link}`}} key={i+1} passHref>
                        <div className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${router.pathname == `/developers/dashboard${navItem.link}` ? "bg-orange-100 text-orange-500" : "text-white hover:bg-orange-100 hover:text-orange-500"}`}>
                            <div className="mr-2">
                                {navItem.icon}
                            </div>
                            <div>
                                <p>{navItem.name}</p>
                            </div>
                        </div>
                    </Link>
                ))} */}
                
            </div>
        </div>
    )
}) 

SideBar.displayName = "SideBar"
export default SideBar