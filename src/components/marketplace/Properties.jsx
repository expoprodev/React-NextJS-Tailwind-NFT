import React from 'react'
import { useState } from 'react'
import DropButton from './DropButton'

const Properties = () => {
  const Property = ({ data }) => {
    const [showDrop, setShowDrop] = useState(true)
    return (
      <div className="">
        <div
          onClick={() => {
            setShowDrop(showDrop ? false : true)
          }}
          className="market-dropdown-button group"
        >
          {data.name}{' '}
          <button className="w-[22px] h-[22px] p-[3px] border border-black rounded-full text-black group-hover:border-white group-hover:text-white">
            <DropButton isUp={showDrop} />
          </button>
        </div>
        {showDrop ? (
          <div className="w-full flex flex-col items-center bg-transparent">
            <ul className="w-11/12 p-2">
              {data.list && data.list.length
                ? data.list.map((item, i) => {
                    return (
                      <li
                        key={item + i}
                        className="flex flex-row justify-between"
                      >
                        <label>{item}</label>
                        <input
                          name={`radio${data.name}`}
                          className="rounded-full"
                          type="radio"
                        />
                      </li>
                    )
                  })
                : ''}
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
      <h1 className="underline mb-4">PROPERTIES</h1>
      <Property
        data={{ name: 'Shirt', list: ['Turtleneck', 'Sweater', 'Puffer'] }}
      />
      <Property data={{ name: 'Lips', list: ['Thick', 'Thin'] }} />
      <Property data={{ name: 'Eyes', list: ['Blue', 'Brown', 'Black'] }} />
      <Property
        data={{ name: 'Eyeglasses', list: ['Square', 'Circle', 'Rectangle'] }}
      />
    </div>
  )
}

export default Properties
