import React from 'react'
import { useState } from 'react'
import DropButton from './DropButton'

const Filter = () => {
  function statusChange(e) {
    console.log(e.target.value)
  }

  function itemQuantityChange(e) {
    console.log(e.target.value)
  }

  function priceMaxChange(e) {
    let value = parseInt(e.target.value)
    if (value - value === 0) console.log(value)
    else e.target.value = ''
  }

  function priceMinChange(e) {
    let value = parseInt(e.target.value)
    if (value - value === 0) console.log(value)
    else e.target.value = ''
  }

  const Status = () => {
    const [showDrop, setShowDrop] = useState(true)
    return (
      <div className="">
        <div
          onClick={() => {
            setShowDrop(showDrop ? false : true)
          }}
          className="market-dropdown-button group"
        >
          Status{' '}
          <button className="w-[22px] h-[22px] p-[3px] border border-black rounded-full text-black group-hover:border-white group-hover:text-white">
            <DropButton isUp={showDrop} />
          </button>
        </div>
        {showDrop ? (
          <div className="w-full flex flex-col items-center bg-transparent">
            <ul className="w-11/12 p-2">
              <li className="flex flex-row justify-between">
                <label>Buy Now</label>
                <input
                  onChange={statusChange}
                  value="buy now"
                  name="radioStatus"
                  className="rounded-full"
                  type="radio"
                  defaultChecked
                />
              </li>
              <li className="flex flex-row justify-between">
                <label>On Auction</label>
                <input
                  onChange={statusChange}
                  value="on auction"
                  name="radioStatus"
                  className="rounded-full"
                  type="radio"
                />
              </li>
            </ul>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }

  const Price = () => {
    const [showDrop, setShowDrop] = useState(true)
    return (
      <div className="">
        <div
          onClick={() => {
            setShowDrop(showDrop ? false : true)
          }}
          className="market-dropdown-button group"
        >
          Price{' '}
          <button className="w-[22px] h-[22px] p-[3px] border border-black rounded-full text-black group-hover:border-white group-hover:text-white">
            <DropButton isUp={showDrop} />
          </button>
        </div>
        {showDrop ? (
          <div className="w-full flex flex-col items-center bg-transparent text-base">
            <div className="w-11/12 p-2 flex flex-col gap-y-4">
              <div className="flex flex-row justify-between gap-x-1">
                <div className="relative overflow-hidden">
                  <select className="bg-transparent text-white text-xs w-20 block appearance-none rounded-full dark:text-white">
                    <option className="text-white bg-black rounded-t-lg">
                      ETH
                    </option>
                    <option className="text-white bg-black rounded-b-lg">
                      SOL
                    </option>
                    <option className="text-white bg-black rounded-b-lg">
                      POL
                    </option>
                  </select>
                  <div className="w-6 h-6 bg-black pointer-events-none absolute inset-y-[4px] right-[3px] rounded-full flex items-center px-2 text-gray-700">
                    <svg
                      className="w-8"
                      width={7}
                      height={12}
                      viewBox="0 0 7 12"
                      fill="black"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.599426 4.7998L3.42043 0.899805L6.19943 4.7998L0.599426 4.7998Z"
                        fill="white"
                      />
                      <path
                        d="M6.1994 7.2002L3.3784 11.1002L0.599402 7.2002L6.1994 7.2002Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <input
                    onChange={priceMinChange}
                    className="text-xs bg-transparent text-white w-12 rounded-full appearance-none"
                    type={'text'}
                    placeholder="MIN"
                  />
                </div>
                <div className="py-2 text-xs ">to</div>
                <div>
                  <input
                    onChange={priceMaxChange}
                    className="text-xs bg-transparent text-white w-12 rounded-full appearance-none"
                    type={'text'}
                    placeholder="MAX"
                  />
                </div>
              </div>
              <div className="w-full">
                <button className="w-full bg-sky-800 rounded-full hover:bg-sky-100 hover:text-sky-800">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }

  const ItemQuantity = () => {
    const [showDrop, setShowDrop] = useState(true)
    return (
      <div className="">
        <div
          onClick={() => {
            setShowDrop(showDrop ? false : true)
          }}
          className="market-dropdown-button group"
        >
          Item Quantity{' '}
          <button className="w-[22px] h-[22px] p-[3px] border border-black rounded-full text-black group-hover:border-white group-hover:text-white">
            <DropButton isUp={showDrop} />
          </button>
        </div>
        {showDrop ? (
          <div className="w-full flex flex-col items-center bg-transparent">
            <ul className="w-11/12 p-2">
              <li className="flex flex-row justify-between">
                <label>All Items</label>
                <input
                  onChange={itemQuantityChange}
                  value="all items"
                  name="radioItemQuantity"
                  className="rounded-full"
                  type="radio"
                  defaultChecked
                />
              </li>
              <li className="flex flex-row justify-between">
                <label>Single Items</label>
                <input
                  onChange={itemQuantityChange}
                  value="single items"
                  name="radioItemQuantity"
                  className="rounded-full"
                  type="radio"
                />
              </li>
              <li className="flex flex-row justify-between">
                <label>Bundles</label>
                <input
                  onChange={itemQuantityChange}
                  value="bundles"
                  name="radioItemQuantity"
                  className="rounded-full"
                  type="radio"
                />
              </li>
            </ul>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }

  return (
    <div className="text-white flex flex-col items-center gap-y-1 mb-10">
      <h1 className="underline mb-4">FILTER</h1>
      <Status />
      <Price />
      <ItemQuantity />
    </div>
  )
}

export default Filter
