import { useState, useEffect, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { FaLongArrowAltLeft } from 'react-icons/fa'
import api from '../lib/api'
import { Header } from '../components/Header'
import { NFTCards } from '../components/NFTCards'
import ModelViewer from '../components/ModelViewer'
import { toast } from 'react-toastify'
import { LoadingModal } from '../components/LoadingModal'

import {
  Vector3,
  Color3,
  Color4,
  Animation,
  SceneLoader,
  AssetsManager,
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
import ScaledModelWithProgress from '../components/ScaledModelWithProgress'

const Home = ({ avatar, wearables, access_token }) => {
  const [loadedWearables, setLoadedWearables] = useState()

  const loadWearables = async (wearables) => {
    const _wearables = []
    await Promise.all(
      wearables.map(async (wearable) => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )

        const arrayBuffer = await res.arrayBuffer()
        let file = new File([arrayBuffer], wearable._id + '.glb')

        _wearables.push({ ...wearable, file })
      })
    )

    console.log(_wearables)
    setLoadedWearables(_wearables)
  }

  async function loadTestModel(scene) {
    return new Promise((resolve, reject) => {
      // let setOfLoadedPieces: any[any] = [];

      const assetsManager = new AssetsManager(scene)

      const meshTask1 = assetsManager.addMeshTask(
        'testModel',
        '',
        'https://raw.githubusercontent.com/933459/test/main/',
        'testmodel2.glb'
      )

      meshTask1.onSuccess = async function (task) {
        //   let modelMergeArray = []

        const modelTask = task.loadedMeshes

        for (const el of modelTask) {
          // modelMergeArray.push(el)
          el.scaling.x = 0.25
          el.scaling.y = 0.25
          el.scaling.z = 0.25
          // el.metadata.groupBy = {}
        }

        // find((model) => model.name === "skullBoi")!;

        // skullBoiMerge.push(skullBoi2)

        // for (const el of skullBoiMerge)

        // skullBoi2.position = new Vector3(1, 0, -3.75);
        // skullBoi2.position.y = 1;
        // skullBoi2.scaling.x = .25
        // skullBoi2.scaling.y = .25
        // skullBoi2.scaling.z = .25
        // skullBoi2.rotationQuaternion = null;
        // skullBoi2.rotation = new Vector3(0, 0, 0);
        // skullBoi2.rotation.y = deg(0);
        // inputScene.beginAnimation(inputScene.skeletons[0], 0, 80, true, 1.0);
        //   console.log(modelMergeArray)
        // console.log9
        // console.log

        //   const mergedModel = Mesh.MergeMeshes(modelMergeArray, true)
        //   console.log('merged', mergedModel)

        resolve(modelTask)
      }
      assetsManager.load()
    })
  }

  useEffect(() => {
    if (wearables) {
      loadWearables(wearables)
    }
  }, [wearables])

  const MyMesh = ({ wearable }) => {
    const scene = useScene()
    scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001)

    console.log(wearable.file)
    const setUp = async () => {
      SceneLoader.LoadAssetContainer(
        'file:',
        wearable.file,
        scene,
        function (container) {
          console.log('here')
          container.meshes[0].scaling = new Vector3(5, 5, 5)
          container.position = new Vector3(0, -3, 0)
          container.addAllToScene()
        }
      )
    }

    useEffect(() => {
      setUp()
    }, [])

    return null
  }

  return (
    <div className="h-screen flex flex-col bg-[#000203]">
      <Header />
      <div
        id="main"
        className="h-[calc(100%-117.5px)] overflow-auto scrollbar-none "
      >
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
                {loadedWearables &&
                  loadedWearables.map((wearable) => (
                    <MyMesh key={wearable._id} wearable={wearable} />
                  ))}
              </Scene>
            </Engine>
          </div>
        </div>
      </div>
    </div>
  )
}

Home.getInitialProps = async () => {
  const {
    data: { access_token },
  } = await api.post(`/api/v1/auth`, {
    apikey: process.env.API_KEY,
  })

  const { data } = await api.get(`/api/v1/avatars/6384f75ef074b27d673649d5`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  const avatar = data.avatar
  return {
    avatar: { ...avatar, traits: null },
    wearables: avatar.wearables,
    access_token,
  }
}

export default Home
