import React, { useEffect, useRef } from 'react'
import { Engine, Scene } from '@babylonjs/core'

const SceneComponent = ({
  antialias,
  engineOptions,
  adaptToDeviceRatio,
  sceneOptions,
  onRender,
  onSceneReady,
  ...rest
}) => {
  const reactCanvas = useRef(null)

  useEffect(() => {
    const { current: canvas } = reactCanvas

    if (!canvas) return

    const engine = new Engine(
      canvas,
      antialias,
      engineOptions,
      adaptToDeviceRatio
    )
    // engine.displayLoadingUI()
    const scene = new Scene(engine, sceneOptions)

    if (scene.isReady()) {
      onSceneReady(scene)
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene))
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === 'function') onRender(scene)
      scene.render()
    })

    const resize = () => {
      scene.getEngine().resize()
    }

    if (window) {
      window.addEventListener('resize', resize)
    }

    return () => {
      scene.getEngine().dispose()

      if (window) {
        window.removeEventListener('resize', resize)
      }
    }
  }, [
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
  ])

  return <canvas ref={reactCanvas} {...rest} />
}

export default SceneComponent
