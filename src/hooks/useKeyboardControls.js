import React, {useCallback, useEffect, useState} from 'react'

const keys = {KeyE: "hide_ui", KeyW: "forward", KeyS: "backward", KeyA: "rotate_left", KeyD: "rotate_right", Space: "jump", 
            ArrowLeft: 'walk_right', ArrowRight: 'walk_left', ArrowUp: 'jump', ArrowDown: 'seank' }
const useKeyboardControls = () => {
    const [movement, setMovement] = useState()

    const handleKeyDown = (e) =>  {
        if (keys[e.code] !== null && keys[e.code] !== movement){            
            e.preventDefault()            
            setMovement(keys[e.code])
        }
    }
      const handleKeyUp = (e) => {      
        e.preventDefault()  
        if (keys[e.code] !== null && (e.code === 'Space' || e.code === 'ArrowUp')){ 
            setTimeout(()=>{ 
                setMovement(null)
            }, 1934)
        }
        else {
            setMovement(null)
        } 
      }

    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("keyup", handleKeyUp)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
        document.removeEventListener("keyup", handleKeyUp)
      }
    }, [])
    return  { movement }
}

export default useKeyboardControls