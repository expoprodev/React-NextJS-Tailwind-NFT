import { useState, useEffect, Suspense, useRef } from 'react'
import api from '../lib/api'
import {
  Vector3,
  Color3,
  Color4,
  Animation,
  SceneLoader,
} from '@babylonjs/core'
import {
  Engine,
  FreeCamera,
  HemisphericLight,
  Scene,
  useScene,
  Model,
} from 'react-babylonjs'
import '@babylonjs/loaders/glTF'
import ScaledModelWithProgress from './ScaledModelWithProgress'

const BabylonMyMesh = ({ avatar, equippedWearables, type }) => {
  const [traits, setTraits] = useState([])

  const [slug, setSlug] = useState()

  const getWearableUrl = (wearable) => {
    switch (type) {
      case 'voxel':
        return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}/voxel`
        break
      case 'vrm':
        return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}/vrm`
        break
      default:
        return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}`
        break
    }
  }

  const inArray = (needle, haystack) => {
    var length = haystack.length
    for (var i = 0; i < length; i++) {
      if (haystack[i] == needle) return true
      ;``
    }
    return false
  }

  const getTraits = async () => {
    let raw_traits = []
    let avatar_data = []
    let _keys = []

    if (equippedWearables) {
      Object.keys(equippedWearables).forEach(async (key) => {
        if (key === 'Background') return
        const wearable = equippedWearables[key]
        raw_traits.push(wearable)
        _keys.push(key)
      })
    }

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
            const model = await modelLoader(wearableUrl, trait)
            console.log(
              '🚀 ~ file: BabylonMesh.jsx ~ line 78 ~ _keys.map ~ model',
              model
            )

            avatar_data.push({ ...trait, model })
          }
        } catch (err) {
          console.log(err)
        }
      })
    )

    setTraits(avatar_data)
    setSlug(avatar.base_avatar.slug)
  }

  useEffect(() => {
    getTraits()
  }, [equippedWearables])

  async function modelLoader(url, wearable) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      })

      const arrayBuffer = await res.arrayBuffer()
      let file = new File([arrayBuffer], wearable._id + '.glb')

      return file
    } catch (err) {
      console.log(err)
    }
  }

  const MyMesh = ({ wearable }) => {
    console.log(
      '🚀 ~ file: BabylonMesh.jsx ~ line 119 ~ MyMesh ~ wearable',
      wearable
    )
    const scene = useScene()
    scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001)

    const setUp = async () => {
      // const res = await fetch(
      //   `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}`,
      //   {
      //     method: 'GET',
      //     headers: {
      //       Authorization: `Bearer ${window.localStorage.getItem('token')}`,
      //     },
      //   }
      // )

      // const arrayBuffer = await res.arrayBuffer()
      // let file = new File([arrayBuffer], wearable._id + '.glb')

      SceneLoader.LoadAssetContainer(
        'file:',
        wearable.model,
        scene,
        function (container) {
          console.log(
            '🚀 ~ file: BabylonMesh.jsx ~ line 83 ~ setUp ~ animationGroups',
            container.animationGroups
          )
          container.meshes[0].scaling = new Vector3(3, 3, 3)
          container.meshes[0].position.y = -2.75
          container.meshes[0].rotationQuaternion = null
          container.meshes[0].rotation.y = -0.6
          container.position = new Vector3(0, 0, 0)

          container.addAllToScene()

          // let anim = container.animationGroups[6]
          // anim.play()
        }
      )
    }

    useEffect(() => {
      setUp()
    }, [])
    return null
  }

  return (
    <div className="absolute -top-10 sm:top-0 right-0 left-0 bottom-0 z-10">
      <div className="w-full h-full flex items-center">
        <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
          <Scene clearColor={new Color4(0, 0, 0, 0.0000000000000001)}>
            <freeCamera
              name="camera1"
              position={new Vector3(-5, 0, 10)}
              setTarget={[Vector3.Zero()]}
            />
            <hemisphericLight
              name="light1"
              intensity={0.7}
              direction={Vector3.Up()}
            />
            {traits.map((wearable) => (
              <MyMesh key={wearable._id} wearable={wearable} />
            ))}
          </Scene>
        </Engine>
      </div>
    </div>
  )
}

export default BabylonMyMesh
