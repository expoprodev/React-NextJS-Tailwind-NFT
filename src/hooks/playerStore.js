import create from 'zustand'

const playerStore = create((set, get) => ({
    userAddress: null,
    setUserAddress: (address) => set({
        userAddress: address
    }),  
    position: null,
    setPosition: (position) => set({
        position: position
    }),  
    rotation: null,
    setRotation: (rotation) => set({
        rotation: rotation
    }),
    animation: null,
    setAnimation: (animation) => set({
        animation: animation
    })
}))

export default playerStore