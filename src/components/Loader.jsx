import React, { useState } from 'react'
import { Html, useProgress } from '@react-three/drei'
import { useEffect } from 'react'

const Loader = ({ showMsg }) => {
  const [showMessage, setMessage] = useState()

  useEffect(() => {
    if (showMsg && showMsg !== false) {
      setMessage(true)
    } else {
      setMessage(false)
    }
  }, [])
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-center">
        <div className="w-11 rotate text-center">
          <svg
            width={49}
            height={49}
            viewBox="0 0 49 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.0416 4.65421L15.3333 8.62223M24.4999 1.58337V6.16671V1.58337ZM35.9582 4.65421L33.6666 8.62223L35.9582 4.65421ZM44.3457 13.0417L40.3766 15.3334L44.3457 13.0417ZM47.4166 24.5H42.8332H47.4166ZM44.3457 35.9584L40.3766 33.6667L44.3457 35.9584ZM35.9582 44.3459L33.6666 40.3767L35.9582 44.3459ZM24.4999 47.4167V42.8334V47.4167ZM13.0416 44.3459L15.3333 40.3767L13.0416 44.3459ZM4.65408 35.9584L8.62211 33.6667L4.65408 35.9584ZM1.58325 24.5H6.16658H1.58325ZM4.65408 13.0417L8.62211 15.3334L4.65408 13.0417Z"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {showMessage && (
          <p className="text-white font-VCR mt-4 text-center">
            {progress.toFixed(0)}% loaded
          </p>
        )}
      </div>
    </Html>
  )
}

export default Loader
