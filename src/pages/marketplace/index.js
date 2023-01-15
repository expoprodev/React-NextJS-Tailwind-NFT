import { useState } from 'react'
import { router } from 'next/router'
import Filter from '../../components/marketplace/Filter'
import Properties from '../../components/marketplace/Properties'
import Card from '../../components/marketplace/Card'
import { Header } from '../../components/Header'

const MarketPlace = () => {
  //TEST CARDS
  let cards = []
  for (var i = 0; i < 12; i++) {
    cards.push({ name: 'Item ' + i, id: `10001${i}` })
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-[#000203]">
        <Header />
        <div
          id="main"
          className="h-[calc(100%-117.5px)] overflow-auto scrollbar-none "
        >
          <div className="h-fit items-center text-left flex flex-col justify-center place-items-center text-white mb-10 font-VCR">
            <div className="w-[1280px] border-b border-b-white flex flex-row justify-between py-4 ">
              <div className="ml-0 mt-0 text-white font-VCR">
                <h1 className="text-4xl leading-10 place-self-start">
                  MARKETPLACE
                </h1>
                <p className="text-sm place-self-start">
                  Browse your favorite NFTs from our collection.
                </p>
              </div>
              <div className="relative w-[600px] flex flex-row gap-8 justify-end py-3">
                <div className="relative">
                  <input
                    type="search"
                    className="border border-white w-52 rounded-md bg-[#333333] text-white py-1 px-5 appearance-none"
                    placeholder="Search"
                  />
                  <button className="absolute top-0 right-0 bg-white w-[40px] h-[34px] p-2 rounded-r-lg">
                    <svg
                      width={19}
                      height={19}
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 16C9.77498 15.9996 11.4988 15.4054 12.897 14.312L17.293 18.708L18.707 17.294L14.311 12.898C15.405 11.4997 15.9996 9.77544 16 8C16 3.589 12.411 0 8 0C3.589 0 0 3.589 0 8C0 12.411 3.589 16 8 16ZM8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2Z"
                        fill="black"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-2">SORT BY</p>
                <div className="relative">
                  <select className="w-52 rounded-md bg-white] text-black py-1 px-5 ">
                    <option>Newest</option>
                    <option>Latest</option>
                    <option>Highest Price</option>
                    <option>Lowest Price</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="h-full mt-4 flex flex-row">
              <div className="h-full w-72 flex flex-col items-center py-6">
                <Filter />
                <Properties />
              </div>
              <div className="h-full w-[1030px] grid grid-cols-4 p-7 gap-7">
                {cards && cards.length
                  ? cards.map((card, i) => {
                      return (
                        <div key={card.name + i}>
                          <Card data={card} />
                        </div>
                      )
                    })
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MarketPlace
