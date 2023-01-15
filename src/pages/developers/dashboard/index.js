import React, {useState, useEffect, Fragment} from 'react'
import SideBar from '../../../components/dashboard/SideBar'
import TopBar from '../../../components/dashboard/TopBar'
import { Transition } from '@headlessui/react'

export default function Dashboard() {
  

    return (
        <>
            <p className='text-white text-3xl mb-16 font-bold'>Dashboard</p>

            <div className='grid lg:grid-cols-3 gap-5 mb-16'>
                <div className='rounded bg-zinc-800 h-40 shadow-sm'>
                    
                </div>
                <div className='rounded bg-zinc-800 h-40 shadow-sm'>
                    
                </div>
                <div className='rounded bg-zinc-800 h-40 shadow-sm'>
                    
                </div>
            </div>
            <div className='grid col-1 bg-zinc-800 h-96 shadow-sm'></div>
        </>
    )
}

