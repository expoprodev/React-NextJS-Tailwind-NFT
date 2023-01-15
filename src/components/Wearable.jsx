import React, { useEffect, useState, useRef } from 'react'
import { useColor } from 'color-thief-react'
import useTokenStore from '../hooks/userStore'
import Router, { useRouter } from 'next/router'

const Wearable = ({ data, equipped, equippedWearables, selectedTrait }) => {
  const router = useRouter()
  const [image, setImage] = useState()
  const selectSound = new Audio('/audio/select.mp3')
  selectSound.volume = 0.2
  const hoverSound = new Audio('/audio/hover.mp3')
  hoverSound.volume = 0.2

  // const { data: color } = useColor(`${process.env.NEXT_PUBLIC_URL}/uploads/wearables/${data.image}`, 'hex')
  const bgGradient = {
    background: `linear-gradient(45deg, #535555, transparent 100%)`,
    opacity: 0.5,
    zIndex: -1,
  }
  const bgGray = {
    background: `linear-gradient(45deg, gray, transparent 100%)`,
    opacity: 0.3,
    zIndex: -1,
  }
  const [hoverStyle, setHoverStyle] = useState(bgGray)
  const isSelected =
    selectedTrait && equippedWearables
      ? equippedWearables[selectedTrait]?._id === data._id
      : false

  const getImage = async (imageId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${imageId}/image`,
      {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      }
    )

    const arrayBuffer = await res.arrayBuffer()

    var blob = new Blob([arrayBuffer], { type: 'image/png' })
    var urlCreator = window.URL || window.webkitURL
    var imageUrl = urlCreator.createObjectURL(blob)

    setImage(imageUrl)
  }

  useEffect(() => {
    if (!router.isReady) return
    getImage(data.id)
  }, [])

  const handleHover = (e) => {
    setHoverStyle(bgGradient)
    var isPlaying =
      hoverSound.currentTime > 0 &&
      !hoverSound.paused &&
      !hoverSound.ended &&
      hoverSound.readyState > hoverSound.HAVE_CURRENT_DATA
    if (isPlaying) {
      hoverSound.play()
    }
  }

  const handleLeave = (e) => {
    setHoverStyle(bgGray)
    var isPlaying =
      hoverSound.currentTime > 0 &&
      !hoverSound.paused &&
      !hoverSound.ended &&
      hoverSound.readyState > hoverSound.HAVE_CURRENT_DATA

    if (!isPlaying) {
      hoverSound.pause()
      hoverSound.currentTime = 0
    }
  }

  return (
    <div
      className="relative w-full h-full flex flex-shrink-0 justify-items-center items-center"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      key={data.wearableId}
    >
      <button
        onClick={() => {
          equipped(data)
          var playPromise = selectSound.play()
          if (playPromise !== undefined) {
            playPromise.then((_) => {
              selectSound.pause()
            })
          }
        }}
        value={data.id}
        className={'bg-transparent p-1 z-50 h-[120px]'}>
        {
            image ?
            <img className="rounded-lg bg-cover scale-100 hover:scale-[140%] ease-in duration-500 "
                src={image}
                alt={data.name}/>
            :
            <div className="rounded-lg bg-cover scale-100 hover:scale-[140%] ease-in duration-500 h-[120px]"></div>
        }
        
      </button>
      <div
        className="absolute top-0 w-full h-full rounded-tl-xl rounded-br-xl"
        style={isSelected ? bgGradient : hoverStyle}
      ></div>
      {isSelected && (
        <div
          className="absolute bottom-0 left-0 w-[30px] h-[5px] z-40"
          style={{ background: '#535555' }}
        ></div>
      )}
    </div>
  )
}

export default Wearable
