/* eslint-disable react-hooks/exhaustive-deps */
import React, { Suspense, useRef, useState, useEffect } from 'react'
import useKeyboardControls from '../hooks/useKeyboardControls'

import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  ArcRotateCamera,
  Color4,
  SceneOptimizerOptions,
  HardwareScalingOptimization,
  CustomOptimization,
  SceneOptimizer,
  DynamicTexture,
  StandardMaterial,
  Texture,
  Color3,
  SceneSerializer,
  AssetsManager,
  Mesh,
} from '@babylonjs/core'
import '@babylonjs/loaders'

import useTokenStore from '../hooks/userStore'
import Loader from './Loader'
import SceneComponent from './SceneComponent'
import { GLTF2Export } from 'babylonjs-serializers'

const BBModelViewer = ({ avatar, equippedWearables, type }) => {
  const [slug, setSlug] = useState()
  const [traits, setTraits] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const group = useRef()
  const modelRef = useRef()

  let box

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
    setIsLoading(true)

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
    getTraits()
  }, [equippedWearables])

  async function modelLoader(url, trait) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      })

      const arrayBuffer = await res.arrayBuffer()
      let file = new File(
        [arrayBuffer],
        type == 'voxel' ? trait._id + '.gltf' : trait._id + '.glb'
      )

      return file
    } catch (err) {
      console.log(err)
    }
  }

  const onSceneReady = async (scene) => {
    // var camera = new FreeCamera('camera1', new Vector3(-5, 0, 10), scene)
    var camera = new ArcRotateCamera(
      'camera1',
      (3 * Math.PI) / 2,
      Math.PI / 2,
      3,
      new Vector3(-5, 0, 10),
      scene
    )
    camera.useFramingBehavior = true

    camera.setTarget(Vector3.Zero())

    const canvas = scene.getEngine().getRenderingCanvas()

    camera.attachControl(canvas, true)

    var light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001)
    SceneLoader.ShowLoadingScreen = false

    SceneLoader.OnPluginActivatedObservable.addOnce(function (loader) {
      // This is just a precaution as this isn't strictly necessary since
      // the only loader in use is the glTF one.
      if (loader.name !== 'gltf' || loader.name !== 'glb') return

      // See what the loader is doing in the console.
      loader.loggingEnabled = true

      // Use HTTP range requests to load the glTF binary (GLB) in parts.
      loader.useRangeRequests = true

      // Register for when extension are loaded.
      loader.onExtensionLoadedObservable.add(function (extension) {
        // Ignore extensions except MSFT_lod.
        if (extension.name !== 'MSFT_lod') return

        // Extensions are loaded after glTF has been parsed and
        // thus it is now loading the first LOD.
        lodNext = 0

        // Update the status text and next LOD index when each set
        // of LODs are loaded.
        extension.onMaterialLODsLoadedObservable.add(function (index) {
          topLine.text = "Viewing '" + lodNames[index] + "' LOD"
          lodNext = index + 1
        })

        // Uncomment the following line to stop at the specified LOD.
        //extension.maxLODsToLoad = 1;
      })

      // Update the status text when loading is complete, i.e. when
      // all the LODs are loaded.
      loader.onCompleteObservable.add(function () {
        bottomLine.text = 'Loading Complete'
        setTimeout(function () {
          topLine.text = ''
          bottomLine.text = ''
        }, 3000)
      })
    })

    // Create default camera for initial rendering.
    scene.createDefaultCamera()

    let characterSkeleton
    var characterData = {}
    characterData.meshes = []
    characterData.animationGroups = []

    const switchCharacterClothing = (characterClothingMeshes) => {
      console.log('Clearing meshes')
      console.log(characterData)
      characterData.meshes.forEach((meshList) => {
        meshList.forEach((mesh) => {
          mesh.isVisible = false
        })
      })
      console.log(characterClothingMeshes)
      characterClothingMeshes.forEach((mesh) => {
        mesh.isVisible = true
      })
    }

    const switchAnimationGroup = (animationGroup) => {
      characterData.animationGroups.forEach((animationGroup) => {
        animationGroup.stop()
      })
      animationGroup.play(true)
    }

    const loadAsset = async (trait) => {
      await SceneLoader.LoadAssetContainer(
        'file:`',
        trait.model,
        scene,
        function (container) {
          container.meshes[0].scaling =
            type == 'voxel'
              ? new Vector3(0.09, 0.09, 0.09)
              : new Vector3(2.5, 2.5, 2.5)
          container.meshes[0].position.y = type == 'voxel' ? -3 : -2
          container.position = new Vector3(0, 0, 0)
          if (type != 'voxel') {
            container.meshes[0].rotationQuaternion = null
            container.meshes[0].rotation.y = -0.6
          }

          let idleAnim = container.animationGroups[6]
          idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false)

          container.addAllToScene()

          // Create a default ground and skybox.
          var environment = scene.createDefaultEnvironment({
            createGround: false,
            createSkybox: false,
            enableGroundMirror: true,
            groundMirrorSizeRatio: 0.5,
            groundShadowLevel: 0.6,
            groundYBias: 0.01,
          })

          // Options (target 80fps (which is not possible) with a check every 500ms)
          var options = new SceneOptimizerOptions(70, 500)
          options.addOptimization(new HardwareScalingOptimization(0, 1))

          options.addOptimization(new ToggleReflectionTextureOptimization(2))

          // Using shorthand syntax, fn(onApply, onGetDescrition, priority)

          options.addOptimization(
            new BABYLON.HardwareScalingOptimization(0, 1.5)
          )

          // Attach out SceneOptimizer to our Scene
          var optimizer = new SceneOptimizer(scene, options)

          // Wiring
          optimizer.onSuccessObservable.add(function () {
            console.log('State: Done')
          })
          optimizer.start()
        }
      )
    }

    var loader = new AssetsManager(scene)
    loader.useDefaultLoadingScreen = false
    traits.map((trait) => {
      // loadAsset(trait)
      // setIsLoading(false)

      let loadModel = loader.addMeshTask(trait._id, '', 'file:', trait.model)
      loadModel.onSuccess = (container) => {
        container.loadedMeshes[0].scaling =
          type == 'voxel'
            ? new Vector3(0.08, 0.08, 0.08)
            : new Vector3(2.5, 2.5, 2.5)
        container.loadedMeshes[0].position.y = type == 'voxel' ? -2.5 : -2
        container.position = new Vector3(0, 0, 0)
        if (type != 'voxel') {
          container.loadedMeshes[0].rotationQuaternion = null
          container.loadedMeshes[0].rotation.y = -0.6
        }

        let idleAnim =
          type == 'voxel'
            ? container.loadedAnimationGroupsName('idle')
            : container.loadedAnimationGroups[6]
        idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false)
      }
    })
    // const mergedModel = Mesh.MergeMeshes(assets, true)
    // console.log(
    //   '🚀 ~ file: BBModelViewer.jsx ~ line 316 ~ onSceneReady ~ mergedModel',
    //   mergedModel
    // )
    // console.log('assets: ', assets)

    loader.onFinish = function (tasks) {
      var environment = scene.createDefaultEnvironment({
        createGround: true,
        createSkybox: false,
        enableGroundMirror: true,
        groundMirrorSizeRatio: 0.5,
        groundShadowLevel: 0.6,
        groundYBias: 0.01,
      })
    }
    loader.onTaskSuccess = function (tasks) {
      setIsLoading(false)
    }
    loader.load()

    var options = new SceneOptimizerOptions(70, 500)
    options.addOptimization(new HardwareScalingOptimization(0, 1))

    // Optimizer
    var optimizer = new SceneOptimizer(scene, options)
    SceneOptimizerOptions.LowDegradationAllowed()
    SceneOptimizerOptions.ModerateDegradationAllowed()
    SceneOptimizerOptions.HighDegradationAllowed()

    // var serializedScene = SceneSerializer.Serialize(scene)
    // var strScene = JSON.stringify(serializedScene)

    // here is the serialized scene
    // console.log(strScene)

    // Our built-in 'ground' shape.
    const positionY = type == 'voxel' ? -2.5 : -2
    var groundInner = MeshBuilder.CreateDisc('ground', { radius: 1 }, scene)
    groundInner.rotation.x = Math.PI / 2
    groundInner.position.y = positionY

    var groundInnerBackground = MeshBuilder.CreateDisc(
      'ground',
      { radius: 1 },
      scene
    )
    groundInnerBackground.rotation.x = Math.PI / 2
    groundInnerBackground.position.y = positionY

    var groundOuter = MeshBuilder.CreateDisc('ground', { radius: 2 }, scene)
    groundOuter.rotation.x = Math.PI / 2
    groundOuter.position.y = positionY

    var mat = new StandardMaterial('', scene)
    mat.diffuseTexture = new Texture('/images/bayc.png', scene)
    mat.alpha = 0.5

    groundInner.material = mat
  }

  const onRender = (scene) => {
    if (box !== undefined) {
      var deltaTimeInMillis = scene.getEngine().getDeltaTime()

      const rpm = 10
      box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000)
    }
  }

  var objectUrl
  function doDownload(filename, scene) {
    if (objectUrl) {
      window.URL.revokeObjectURL(objectUrl)
    }

    var serializedScene = SceneSerializer.Serialize(scene)

    var strMesh = JSON.stringify(serializedScene)

    // if (
    //   filename.toLowerCase().lastIndexOf('.babylon') !== filename.length - 8 ||
    //   filename.length < 9
    // ) {
    //   filename += '.babylon'
    // }

    // var blob = new Blob([strMesh], { type: 'octet/stream' })

    // // turn blob into an object URL; saved as a member, so can be cleaned out later
    // objectUrl = (window.webkitURL || window.URL).createObjectURL(blob)

    // var link = window.document.createElement('a')
    // link.href = objectUrl
    // link.download = filename
    // var click = document.createEvent('MouseEvents')
    // click.initEvent('click', true, false)
    // link.dispatchEvent(click)

    GLTF2Export.GLTFAsync(scene, filename).then((gltf) => {
      gltf.downloadFiles()
    })
  }

  return (
    <div className="w-full h-full flex justify-center items-center z-0">
      <div className="w-full  h-full">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <div className="flex flex-1 w-screen h-screen">
            {isLoading && (
              <div
                id="loadingScreen"
                className="w-full h-full flex text-center justify-center items-center absolute left-0 top-0 right-0 bottom-0"
              >
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
              </div>
            )}

            <SceneComponent
              antialias
              adaptToDeviceRatio
              onSceneReady={onSceneReady}
              onRender={onRender}
              id="renderCanvas"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BBModelViewer
