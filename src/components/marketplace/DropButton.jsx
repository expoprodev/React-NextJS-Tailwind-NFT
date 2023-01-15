import React from 'react'

const DropButton = ({ isUp }) => {
  return (
    <div className={isUp ? 'rotate-180' : ''}>
      <svg
        width={13}
        height={9}
        viewBox="0 0 13 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.251495 8.91748L6.46544 0.458943L12.5869 8.91748L0.251495 8.91748Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export default DropButton
