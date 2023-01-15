import React from 'react'
import Connect from '../components/Connect'
export const Header = () => {
    return (
        <>
            <nav className="w-full h-fit sm:h-20 md:h-32 px-4 py-2 lg:px-10 bg-[#000203] flex flex-row gap-4 md:gap-[182px] justify-between items-center z-50">
                <div className='flex flex-row w-[100px] sm:w-full h-full z-50'>
                    <a href="/" className="cursor-pointer">
                        <img  src="/logo.png" className=' h-full w-[60px] md:w-[100px] md:h-[100px] object-contain' /> 
                    </a>
                </div>
                <div className='flex flex-row gap-6 items-center justify-center'>
                    <Connect/>
                </div>
            </nav>
        </>
    )
}
