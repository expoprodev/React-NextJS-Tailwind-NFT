import React, { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, extend } from '@react-three/fiber'
// import {
//   EffectComposer,
//   DepthOfField,
//   Bloom,
//   ChromaticAberration,
// } from '@react-three/postprocessing'
// import { BlendFunction } from 'postprocessing'

import {
  MeshReflectorMaterial,
  Environment,
  Circle,
  Html,
  PerspectiveCamera,
  CubeCamera,
  OrbitControls,
} from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import useKeyboardControls from '../../hooks/useKeyboardControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import Loader from '../Loader'
import { useGesture } from '@use-gesture/react'
import useTokenStore from '../../hooks/userStore'

import Ground from './Ground'
import FloatingGrid from './FloatingGrid'
import Car from './Car'
import Rings from './Rings'
import Boxes from './Boxes'
import Floor from './Floor'

extend({ RoomEnvironment })
let movementClip

const ModelShow = ({ avatar, equippedWearables, type }) => {
  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  const { accessToken } = useTokenStore()
  const [slug, setSlug] = useState()
  const [traits, setTraits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const group = useRef()
  const modelRef = useRef()

  const getWearableUrl = (wearable) => {
    switch (type) {
      case 'voxel':
        return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}/voxel`
        break
      case 'vrm':
        return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${
          typeof wearable._id == 'undefined' ? wearable.id : wearable._id
        }/vrm`
        break
      default:
        return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${
          typeof wearable._id == 'undefined' ? wearable.id : wearable._id
        }`
        break
    }
  }

  const inArray = (needle, haystack) => {
    var length = haystack.length
    for (var i = 0; i < length; i++) {
      if (haystack[i] == needle) return true
    }
    return false
  }

  function exportGLTF() {
    const gltfExporter = new GLTFExporter()

    new Array(traits.length).map((index) => {
      console.log(traits[index].name)
    })

    const anims = []
    traits[0].model.animations.map((animation) => {
      console.log(animation)

      for (let x = 1; x < traits.length; x++) {
        const anim = traits[x].model.animations.filter((a) =>
          a.name.toLowerCase().includes(animation.name)
        )[0]
        console.log(anim)
        animation.tracks.push(anim.tracks)
      }

      anims.push(animation)
    })

    const options = {
      binary: true,
      animations: anims,
    }

    gltfExporter.parse(
      modelRef.current,
      function (result) {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, 'scene.glb')
        } else {
          const output = JSON.stringify(result, null, 2)
          console.log(output)
          saveString(output, 'scene.gltf')
        }
      },
      function (error) {
        console.log('An error happened during parsing', error)
      },
      options
    )
  }

  function save(blob, filename) {
    const link = window.document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()

    // URL.revokeObjectURL( url ); breaks Firefox...
  }

  function saveString(text, filename) {
    save(new Blob([text], { type: 'text/plain' }), filename)
  }

  function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], { type: 'application/octet-stream' }), filename)
  }

  const getTraits = async () => {
    setIsLoading(true)

    let raw_traits = []
    let avatar_data = []
    let _keys = []

    Object.keys(equippedWearables).forEach(async (key) => {
      if (key === 'Background') return
      const wearable = equippedWearables[key]
      raw_traits.push(wearable)
      _keys.push(key)
    })

    //get loaded wearables id
    const loadedTraits = traits.filter((x) => x._id)

    await Promise.all(
      _keys.map(async (key) => {
        try {
          //get wearables by trait
          const trait = raw_traits.filter(
            (x) => x.trait_type.toLowerCase() === key
          )[0]

          //check if wearables are loaded if not then load
          if (!inArray(trait._id, loadedTraits)) {
            const wearableUrl = getWearableUrl(trait)
            const model = await modelLoader(wearableUrl)
            avatar_data.push({ ...trait, model })
          }
        } catch (err) {
          console.log(err)
        }
      })
    )
    setTraits(avatar_data)
    setSlug(avatar.base_avatar.slug)
    setIsLoading(false)
  }

  useEffect(() => {
    if (equippedWearables) {
      THREE.Cache.clear()
      dracoLoader.setDecoderConfig({ type: 'js' })
      dracoLoader.setDecoderPath(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/'
      )
      loader.setDRACOLoader(dracoLoader)
      getTraits()
    }
  }, [equippedWearables])

  async function modelLoader(url) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      })

      const data = await res.arrayBuffer()

      return new Promise((resolve, reject) => {
        loader.parse(data, '', (data) => resolve(data), null, reject)
      })
    } catch (err) {
      console.log(err)
    }
  }

  const LoadTrait = ({ data }) => {
    if (!data) return
    let gltf = data
    const { movement } = useKeyboardControls()
    const { scene, animations } = gltf

    scene.traverse((children) => {
      if (children instanceof THREE.Mesh) {
        children.castShadow = true
      }
    })
    let mixer
    try {
      mixer = new THREE.AnimationMixer(scene)
      let idleClip =
        animations.filter((a) => a.name.toLowerCase().includes('idle'))[0] ||
        animations[0]

      //keyboard triggered animation
      if (movement && !movement.includes('rotate')) {
        movementClip =
          animations.filter((a) =>
            a.name.toLowerCase().includes(movement)
          )[0] || animations[0]
        mixer.clipAction(idleClip).fadeOut(0.5).stop()
        mixer.clipAction(movementClip).reset().fadeIn(0.5).play()
      }
      //default and selected animation
      else {
        //remove previous keyboard triggered animation
        if (movementClip) {
          mixer.clipAction(movementClip).fadeOut(0.5).reset().stop()
        }
        mixer.clipAction(idleClip).reset().fadeIn(0.5).play()
      }
    } catch (err) {
      console.log(err)
      return
    }

    useEffect(() => {
      if (equippedWearables) {
        THREE.Cache.clear()
        dracoLoader.setDecoderPath(
          'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/'
        )
        loader.setDRACOLoader(dracoLoader)
        getTraits()
      }
    }, [equippedWearables])

    useFrame((state, delta) => {
      mixer?.update(delta)
    })

    //boredape scale: 4.5
    return (
      <group ref={group} position={[0, 0, 0]}>
        <primitive
          castShadow
          receiveShadows
          object={scene}
          scale={type === '3D' ? (slug == 'cool-cats' ? 6 : 4) : 0.12}
          position={type === '3D' ? [0, -3.5, -0.67] : [0, -3.5, 0]}
          rotation={[0, type === '3D' ? 0 : Math.PI / 1, 0]}
        ></primitive>
      </group>
    )
  }

  const Model = (props) => {
    const { movement } = useKeyboardControls()

    const LoadTrait = ({ data }) => {
      if (!data) return
      let gltf = data
      const { movement } = useKeyboardControls()
      const { scene, animations } = gltf

      scene.traverse((children) => {
        if (children instanceof THREE.Mesh) {
          children.castShadow = true
        }
      })
      let mixer
      try {
        mixer = new THREE.AnimationMixer(scene)
        let idleClip =
          animations.filter((a) => a.name.toLowerCase().includes('idle'))[0] ||
          animations[0]

        //keyboard triggered animation
        if (movement && !movement.includes('rotate')) {
          movementClip =
            animations.filter((a) =>
              a.name.toLowerCase().includes(movement)
            )[0] || animations[0]
          mixer.clipAction(idleClip).fadeOut(0.5).stop()
          mixer.clipAction(movementClip).reset().fadeIn(0.5).play()
        }
        //default and selected animation
        else {
          //remove previous keyboard triggered animation
          if (movementClip) {
            mixer.clipAction(movementClip).fadeOut(0.5).reset().stop()
          }
          mixer.clipAction(idleClip).reset().fadeIn(0.5).play()
        }
      } catch (err) {
        console.log(err)
        return
      }

      useEffect(() => {
        return () => {
          //fix bugs on crawl and idle transition (arm becomes broken)
          mixer.stopAllAction()
          mixer.uncacheRoot(mixer.getRoot())
          mixer = null
          movementClip = null
        }
      })

      useFrame((state, delta) => {
        mixer?.update(delta)
      })

      //boredape scale: 4.5
      return (
        <group ref={group} position={[0, 0, 0]}>
          <primitive
            castShadow
            receiveShadows
            object={scene}
            scale={type === '3D' ? (slug == 'bayc' ? 2.8 : 2.8) : 0.12}
            position={type === '3D' ? [0, -2, -0.67] : [0, -3.5, 0]}
            rotation={[0, type === '3D' ? 0 : Math.PI / 1, 0]}
          ></primitive>
        </group>
      )
    }

    const Model = (props) => {
      const { movement } = useKeyboardControls()

      useFrame(() => {
        if (movement === 'rotate_right') {
          modelRef.current.rotation.y += 0.1
        } else if (movement === 'rotate_left') {
          modelRef.current.rotation.y -= 0.1
        }
      })

      return (
        <group ref={modelRef} {...props}>
          {traits.map((trait, i) => (
            <LoadTrait key={trait.wearableId + '_' + i} data={trait.model} />
          ))}
        </group>
      )
    }

    const bind = useGesture({
      onWheel: ({ direction: [, scrollY] }) => {
        modelRef.current
          ? (modelRef.current.rotation.y += scrollY > 0 ? 0.5 : -0.5)
          : null
      },
      onDrag: ({ direction: [scrollX, _] }) => {
        modelRef.current
          ? (modelRef.current.rotation.y += scrollX > 0 ? 0.1 : -0.1)
          : null
      },
    })

    return (
      <group ref={modelRef} {...props}>
        {traits.map((trait, i) => (
          <LoadTrait key={trait.wearableId + '_' + i} data={trait.model} />
        ))}
      </group>
    )
  }

  const bind = useGesture({
    onWheel: ({ direction: [, scrollY] }) => {
      modelRef.current
        ? (modelRef.current.rotation.y += scrollY > 0 ? 0.5 : -0.5)
        : null
    },
    onDrag: ({ direction: [scrollX, _] }) => {
      modelRef.current
        ? (modelRef.current.rotation.y += scrollX > 0 ? 0.1 : -0.1)
        : null
    },
  })

  return (
    <div className="w-full h-full flex justify-center items-center z-0">
      <div className="w-full  h-full">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <Suspense fallback={null}>
            <Canvas shadows>
              <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
              <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />

              <color args={[0, 0, 0]} attach="background" />

              <CubeCamera resolution={256} frames={Infinity}>
                {(texture) => (
                  <>
                    <Environment map={texture} />
                    {/* <Car /> */}
                    <Model />
                  </>
                )}
              </CubeCamera>
              <fog attach="fog" args={['#06161D', 0, 30]} /> 
              <hemisphereLight intensity={0.45} />
              {/* <spotLight castShadow position={[5,10,3]} intensity={2} /> */}

              <spotLight
                color={[1, 0.25, 0.7]}
                intensity={1.5}
                angle={0.6}
                penumbra={0.5}
                position={[5, 5, 0]}
                castShadow
                shadow-bias={-0.0001}
              />
              <spotLight
                color={[0.14, 0.5, 1]}
                intensity={2}
                angle={0.6}
                penumbra={0.5}
                position={[-5, 5, 0]}
                castShadow
                shadow-bias={-0.0001}
              />
              <Ground />
              {/* <Floor /> */}
              <FloatingGrid />
              {/* <Boxes /> */}
              {/* <Rings /> */}
            </Canvas>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ModelShow
