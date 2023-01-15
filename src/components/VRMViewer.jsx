import React, { Suspense, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import * as THREE from 'three'
import * as Kalidokit from 'kalidokit'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { MeshReflectorMaterial, Environment, Circle } from '@react-three/drei'
import Loader from './Loader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import useKeyboardControls from '../hooks/useKeyboardControls'
import CameraControls from 'camera-controls'

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CircleFloor } from './CircleFloor'
import { VRM, VRMUtils, VRMSchema } from '@pixiv/three-vrm'
import { Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS } from '@mediapipe/holistic'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import api from '../lib/api'
import io from "socket.io-client";

//Import Helper Functions from Kalidokit
const remap = Kalidokit.Utils.remap
const clamp = Kalidokit.Utils.clamp
const lerp = Kalidokit.Vector.lerp

CameraControls.install({ THREE })
extend({ CameraControls, RoomEnvironment })

export const VRMViewer = ({ avatar, equippedWearables, type }) => {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()

    const [traits, setTraits] = useState([])
    const [vrms, setVrms] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [slug, setSlug] = useState()
    const group = useRef()
    const modelRef = useRef()

    const [video, setVideo] = useState('/video/video.mp4')

    const canvasRef = useRef()
    const videoRef = useRef()
    const holisticRef = useRef()

    const getWearableUrl = (type, wearable) => {
        switch(type){
            case 'voxel':
                return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}/voxel`
                break;
            case 'vrm':
                return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}/vrm`
                break;
            default: 
                return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable._id}`
                break;
        }
    }

    const getTraits = async () => {
        setIsLoading(true)

        let raw_traits = []
        let avatar_data = []
        let _keys = []
        if (!equippedWearables) {     
            const model = await modelLoader(avatar.model_url)
            avatar_data.push({
                wearableId: 'iidididid',
                key: 'base',
                path: `${avatar.model_url}`,
                model
            })
        } else {

            Object.keys(equippedWearables).forEach(async (key, i) => {
                if (key === 'Background') return
                const wearable = equippedWearables[key]
                raw_traits.push(wearable)
                _keys.push(key)
            })
            
            const  loadedWearables = traits.filter((loadedtrait) => raw_traits.filter((newtrait) => loadedtrait._id === newtrait._id))
            avatar_data = [...loadedWearables]
        
            await Promise.all(
                _keys.map(async (key) => {
                    try {
                        console.log(key)
                        const trait = raw_traits.filter((x) => x.trait_type.toLowerCase() === key)[0]

                        const isLoaded = traits.filter((x) => x._id === trait._id)
                        const changeIndex = traits.findIndex( (x) => x.trait_type.toLowerCase() === trait.trait_type.toLowerCase() && x._id !== trait._id)
                        
                        if (isLoaded.length === 0 || changeIndex > -1) {
                            console.log('loaded here: ' + trait._id)
                            const wearableUrl = getWearableUrl(type, trait)
                            const model = await modelLoader(wearableUrl)
                            if (changeIndex > -1) {
                                const oldtrait = traits.filter( (x) => x.trait_type.toLowerCase() === trait.trait_type.toLowerCase() && x._id !== trait._id)[0]
                                console.log('loaded here: ', oldtrait)
                                const index = avatar_data.findIndex((x) => x._id === oldtrait._id)
                                console.log(index, changeIndex)
                                avatar_data.splice(index, 1, { ...trait, model })
                            } else {
                                avatar_data.push({ ...trait, model })
                            }
                        }
                    } catch (err) {
                        console.log(err)
                    }
                })
            )
        }

        setTraits(avatar_data)
        setIsLoading(false)
    }

    useEffect(()=>{
        if (avatar){
            setSlug(avatar?.slug)
        }
    }, [avatar])

    useEffect(() => {
        if (equippedWearables) {
            THREE.Cache.clear()
            dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/')
            loader.setDRACOLoader(dracoLoader)
            getTraits()
        }
    }, [equippedWearables])

    async function modelLoader(url) {
        try {
            return new Promise(async(resolve, reject) => {

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Authorization": `Bearer ${window.localStorage.getItem('token')}`
                    }
                })
    
                const data = await res.arrayBuffer()

                
                loader.parse(data, '', (data) => {
                    VRMUtils.removeUnnecessaryJoints(data.scene)
                    VRM.from(data).then((vrm) => {
                        // add the loaded vrm to the scene
                        //_scene.add(vrm.scene)
                        //setVrm(vrm)
                        let currentVrm = vrm
                        currentVrm.scene.rotation.y = Math.PI // Rotate model 180deg to face camera
                        setVrms(vrms => [...vrms, currentVrm])
                    })
                    resolve(data)
                }, null, reject)
            })
        } catch (err) {
            console.log(err)
        }
    }

    const LoadTrait = ({ data }) => {
        if (!data) return
        let gltf = data
        const { scene } = gltf

        scene.traverse((children) => {
            if (children instanceof THREE.Mesh) {
                children.castShadow = true;
            }
        });

        return (
            <group ref={group} position={[0, 0, 0]}>
                <primitive
                    castShadow
                    receiveShadows
                    object={scene}
                    scale={(slug == 'cool-cats' ? 10 : 4)}
                    position={type === '3D' ? [0, -3.5, -0.67] : [0, -3.5, 0]}
                    rotation={[0, type === '3D' ? 0 : Math.PI / 1, 0]}></primitive>
            </group>
        )
    }

    const Model = (props) => {
        const { movement } = useKeyboardControls()
        
        useFrame(() => {            
            if ( movement === 'rotate_right' ) {
                modelRef.current.rotation.y += .1
            } else if ( movement === 'rotate_left' ) {
                modelRef.current.rotation.y -= .1
            } 
        })

        return (
            <group ref={modelRef} {...props} >
                {traits.map((trait, i) => {
                    const { animations } = trait.model
                    if (!animations)
                        setModelAnimations(animations)
                    return (
                        <LoadTrait key={trait.wearableId + '_' + i} data={trait.model}/>
                    )
                })}
                 <CircleFloor logo={avatar?.logo} />
            </group>
        )
    }

    const rigRotation = (currentVrm, name, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.1 ) => {
        if (!currentVrm) {
            return
        }
        
        const Part = currentVrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName[name]
        )
        if (!Part) {
            return
        }

        let euler = new THREE.Euler(
            rotation.x * dampener,
            rotation.y * dampener,
            rotation.z * dampener
        )
        let quaternion = new THREE.Quaternion().setFromEuler(euler)
        Part.quaternion.slerp(quaternion, lerpAmount) // interpolate
    }

    // Animate Position Helper Function
    const rigPosition = (currentVrm, name, position = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.1) => {
        if (!currentVrm) {
            return
        }
        const Part = currentVrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName[name]
        )
        if (!Part) {
            return
        }
        let vector = new THREE.Vector3(
            position.x * dampener,
            position.y * dampener,
            position.z * dampener
        )
        Part.position.lerp(vector, lerpAmount) // interpolate
    }

    let oldLookTarget = new THREE.Euler()
    const rigFace = (currentVrm, riggedFace) => {
        if (!currentVrm && !riggedFace) {
            return
        }

        try {

            rigRotation(currentVrm, 'Neck', riggedFace.head, 0.7)

       
        // Blendshapes and Preset Name Schema
        const Blendshape = currentVrm.blendShapeProxy
        const PresetName = VRMSchema.BlendShapePresetName

        // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
        // for VRM, 1 is closed, 0 is open.
        riggedFace.eye.l = lerp(
            clamp(1 - riggedFace.eye.l, 0, 1),
            Blendshape.getValue(PresetName.Blink),
            0.5
        )
        riggedFace.eye.r = lerp(
            clamp(1 - riggedFace.eye.r, 0, 1),
            Blendshape.getValue(PresetName.Blink),
            0.5
        )
        riggedFace.eye = Kalidokit.Face.stabilizeBlink(
            riggedFace.eye,
            riggedFace.head.y
        )
        Blendshape.setValue(PresetName.Blink, riggedFace.eye.l)

        // Interpolate and set mouth blendshapes
        Blendshape.setValue(
            PresetName.I,
            lerp(
                riggedFace.mouth.shape.I,
                Blendshape.getValue(PresetName.I),
                0.5
            )
        )
        Blendshape.setValue(
            PresetName.A,
            lerp(
                riggedFace.mouth.shape.A,
                Blendshape.getValue(PresetName.A),
                0.5
            )
        )
        Blendshape.setValue(
            PresetName.E,
            lerp(
                riggedFace.mouth.shape.E,
                Blendshape.getValue(PresetName.E),
                0.5
            )
        )
        Blendshape.setValue(
            PresetName.O,
            lerp(
                riggedFace.mouth.shape.O,
                Blendshape.getValue(PresetName.O),
                0.5
            )
        )
        Blendshape.setValue(
            PresetName.U,
            lerp(
                riggedFace.mouth.shape.U,
                Blendshape.getValue(PresetName.U),
                0.5
            )
        )

        //PUPILS
        //interpolate pupil and keep a copy of the value
        let lookTarget = new THREE.Euler(
            lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
            lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
            0,
            'XYZ'
        )
        oldLookTarget.copy(lookTarget)
        currentVrm.lookAt.applyer.lookAt(lookTarget)

        } catch (error) {
            console.log(error)
        }
    }

    /* VRM Character Animator */
    const animateVRM = (vrm, results) => {
        if (!vrm) {
            return
        }
        // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
        let riggedPose, riggedLeftHand, riggedRightHand, riggedFace

        const faceLandmarks = results.faceLandmarks
        // Pose 3D Landmarks are with respect to Hip distance in meters
        const pose3DLandmarks = results.ea
        // Pose 2D landmarks are with respect to videoWidth and videoHeight
        const pose2DLandmarks = results.poseLandmarks
        // Be careful, hand landmarks may be reversed
        const leftHandLandmarks = results.rightHandLandmarks
        const rightHandLandmarks = results.leftHandLandmarks

        // Animate Face
        if (faceLandmarks) {
            riggedFace = Kalidokit.Face.solve(faceLandmarks, {
                runtime: 'mediapipe',
                video: videoRef.current,
            })
            rigFace(vrm, riggedFace)
        }

        // Animate Pose
        if (pose2DLandmarks && pose3DLandmarks) {
            riggedPose = Kalidokit.Pose.solve(
                pose3DLandmarks,
                pose2DLandmarks,
                {
                    runtime: 'mediapipe',
                    video: videoRef.current,
                }
            )
            rigRotation(vrm, 'Hips', riggedPose.Hips.rotation, 0.7)
            rigPosition(vrm, 'Hips',
                {
                    x: -riggedPose.Hips.position.x, // Reverse direction
                    y: riggedPose.Hips.position.y + 1, // Add a bit of height
                    z: -riggedPose.Hips.position.z, // Reverse direction
                },
                1,
                0.07
            )

            rigRotation(vrm, 'Chest', riggedPose.Spine, 0.25, 0.3)
            rigRotation(vrm, 'Spine', riggedPose.Spine, 0.45, 0.3)

            rigRotation(vrm, 'RightUpperArm', riggedPose.RightUpperArm, 1, 0.3)
            rigRotation(vrm, 'RightLowerArm', riggedPose.RightLowerArm, 1, 0.3)
            rigRotation(vrm, 'LeftUpperArm', riggedPose.LeftUpperArm, 1, 0.3)
            rigRotation(vrm, 'LeftLowerArm', riggedPose.LeftLowerArm, 1, 0.3)

            rigRotation(vrm, 'LeftUpperLeg', riggedPose.LeftUpperLeg, 1, 0.3)
            rigRotation(vrm, 'LeftLowerLeg', riggedPose.LeftLowerLeg, 1, 0.3)
            rigRotation(vrm, 'RightUpperLeg', riggedPose.RightUpperLeg, 1, 0.3)
            rigRotation(vrm, 'RightLowerLeg', riggedPose.RightLowerLeg, 1, 0.3)
        }

        // Animate Hands
        if (leftHandLandmarks) {
            riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, 'Left')
            rigRotation(vrm, 'LeftHand', {
                // Combine pose rotation Z and hand rotation X Y
                z: riggedPose.LeftHand.z,
                y: riggedLeftHand.LeftWrist.y,
                x: riggedLeftHand.LeftWrist.x,
            })
            rigRotation(vrm, 'LeftRingProximal', riggedLeftHand.LeftRingProximal)
            rigRotation(vrm, 
                'LeftRingIntermediate',
                riggedLeftHand.LeftRingIntermediate
            )
            rigRotation(vrm, 'LeftRingDistal', riggedLeftHand.LeftRingDistal)
            rigRotation(vrm, 'LeftIndexProximal', riggedLeftHand.LeftIndexProximal)
            rigRotation(vrm, 
                'LeftIndexIntermediate',
                riggedLeftHand.LeftIndexIntermediate
            )
            rigRotation(vrm, 'LeftIndexDistal', riggedLeftHand.LeftIndexDistal)
            rigRotation(vrm, 'LeftMiddleProximal', riggedLeftHand.LeftMiddleProximal)
            rigRotation(vrm, 
                'LeftMiddleIntermediate',
                riggedLeftHand.LeftMiddleIntermediate
            )
            rigRotation(vrm, 'LeftMiddleDistal', riggedLeftHand.LeftMiddleDistal)
            rigRotation(vrm, 'LeftThumbProximal', riggedLeftHand.LeftThumbProximal)
            rigRotation(vrm, 
                'LeftThumbIntermediate',
                riggedLeftHand.LeftThumbIntermediate
            )
            rigRotation(vrm, 'LeftThumbDistal', riggedLeftHand.LeftThumbDistal)
            rigRotation(vrm, 'LeftLittleProximal', riggedLeftHand.LeftLittleProximal)
            rigRotation(vrm, 
                'LeftLittleIntermediate',
                riggedLeftHand.LeftLittleIntermediate
            )
            rigRotation(vrm, 'LeftLittleDistal', riggedLeftHand.LeftLittleDistal)
        }
        if (rightHandLandmarks) {
            riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, 'Right')
            rigRotation(vrm, 'RightHand', {
                // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
                z: riggedPose.RightHand.z,
                y: riggedRightHand.RightWrist.y,
                x: riggedRightHand.RightWrist.x,
            })
            rigRotation(vrm, 'RightRingProximal', riggedRightHand.RightRingProximal)
            rigRotation(vrm, 
                'RightRingIntermediate',
                riggedRightHand.RightRingIntermediate
            )
            rigRotation(vrm, 'RightRingDistal', riggedRightHand.RightRingDistal)
            rigRotation(vrm, 
                'RightIndexProximal',
                riggedRightHand.RightIndexProximal
            )
            rigRotation(vrm, 
                'RightIndexIntermediate',
                riggedRightHand.RightIndexIntermediate
            )
            rigRotation(vrm, 'RightIndexDistal', riggedRightHand.RightIndexDistal)
            rigRotation(vrm, 
                'RightMiddleProximal',
                riggedRightHand.RightMiddleProximal
            )
            rigRotation(vrm, 
                'RightMiddleIntermediate',
                riggedRightHand.RightMiddleIntermediate
            )
            rigRotation(vrm, 'RightMiddleDistal', riggedRightHand.RightMiddleDistal)
            rigRotation(vrm, 
                'RightThumbProximal',
                riggedRightHand.RightThumbProximal
            )
            rigRotation(vrm, 
                'RightThumbIntermediate',
                riggedRightHand.RightThumbIntermediate
            )
            rigRotation(vrm, 'RightThumbDistal', riggedRightHand.RightThumbDistal)
            rigRotation(vrm, 
                'RightLittleProximal',
                riggedRightHand.RightLittleProximal
            )
            rigRotation(vrm, 
                'RightLittleIntermediate',
                riggedRightHand.RightLittleIntermediate
            )
            rigRotation(vrm, 'RightLittleDistal', riggedRightHand.RightLittleDistal)
        }
    }

    const onResults = (results) => {
        // Draw landmark guides
        drawResults(results)
        // Animate model
        vrms.map((vrm)=>{
            animateVRM(vrm, results)
        })
       
    }

    const drawResults = (results) => {
        // console.log(videoRef)
        //if (!videoRef) return
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        let canvasCtx = canvasRef.current.getContext('2d')
        canvasCtx.save()
        canvasCtx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        )
        // Use `Mediapipe` drawing functions
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00cff7',
            lineWidth: 4,
        })
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#ff0364',
            lineWidth: 2,
        })

        //console.log(results.faceLandmarks)

        drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
            color: '#C0C0C070',
            lineWidth: 1,
        })
        if (results.faceLandmarks && results.faceLandmarks.length === 478) {
            //draw pupils
            drawLandmarks(
                canvasCtx,
                [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
                {
                    color: '#ffe603',
                    lineWidth: 2,
                }
            )
        }
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
            color: '#eb1064',
            lineWidth: 5,
        })
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {
            color: '#00cff7',
            lineWidth: 2,
        })
        drawConnectors(
            canvasCtx,
            results.rightHandLandmarks,
            HAND_CONNECTIONS,
            {
                color: '#22c3e3',
                lineWidth: 5,
            }
        )
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {
            color: '#ff0364',
            lineWidth: 2,
        })
    }

    useEffect(() => {
        let frame = []
        if (!vrms || !video) return
        const holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`
            },
        })

        holisticRef.current = holistic

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            refineFaceLandmarks: true,
        })
        // Pass holistic a callback function
        holistic.onResults((results) => {
            onResults(results)
            frame.push(results)
        })

        const onFrame = async () => {
            if (!videoRef.current.paused && !videoRef.current.ended) {
                await holistic.send({
                    image: videoRef.current,
                })

                await new Promise(requestAnimationFrame)

                onFrame()
            } else if (videoRef.current.ended) {
                // setMotion(frame)
                // const body = new FormData()
                // // body.append('userAddress', user.userAddress)
                // body.append('motion', JSON.stringify(frame))

                // const body = {
                //     motion: JSON.stringify(frame),
                // }

                //const data = await api.post(`/api/motion`, body)

                console.log('video ended')
                console.log('frames: ', frame)
            } else {
                setTimeout(onFrame, 500)
            }
        }

        // // must be same domain otherwise it will taint the canvas!
        videoRef.current.src = video
        videoRef.current.onloadeddata = (evt) => {
            videoRef.current.play()
            onFrame()
            const stream = videoRef.current.captureStream()
            console.log(
                '🚀 ~ file: upload-vrm.js ~ line 511 ~ useEffect ~ stream',
                stream
            )
        }
        return () => {
            holisticRef.current && holisticRef.current.close()
        }
    }, [vrms])

    

    return (
        <div className="w-full h-full flex justify-center items-center z-0">
            <div className="w-full  h-full">   
                <div className="absolute bottom-[20px] right-0 z-50 max-w-[350px]">
                    <video
                        className="-scale-x-100 scale-y-100 max-w-[350px] rounded-lg"
                        id="input_video"
                        ref={videoRef}
                        width="640px"
                        height="480px"
                        autoPlay
                        muted
                        playsInline
                    ></video>
                    <canvas
                        id="guides"
                        className="absolute top-0 left-0 -scale-x-100 scale-y-100 max-w-[350px]"
                        ref={canvasRef}
                    ></canvas>
                </div>

                <div className="absolute top-0 left-0 right-0 bottom-0">
                    <Canvas
                        id="canvas"
                        shadows
                        resize={{ scroll: false }}
                        camera={{ position: [-5, 0, 10], fov: 50 }}
                        dpr={2}
                        onCreated={(state) => {
                            state.gl.setClearColor(0x130a28, 0)
                            state.gl.toneMapping = THREE.ACESFilmicToneMapping 
                        }}>
                        <fog attach="fog" args={['#06161D', 0, 30]} /> 
                        <hemisphereLight intensity={0.45} />
                        <spotLight castShadow position={[5,10,3]} intensity={1} />
                        <Suspense fallback={<Loader  />}>
                            {isLoading && <Loader showMsg={false} />}
                            <Model  />
                        </Suspense>
                        <CircleFloor slug={slug} />
                        <Circle receiveShadow
                            opacity={0.5} 
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, -3.5, 0]}
                            scale={5}
                            args={[50, 50]}>
                            <MeshReflectorMaterial
                                blur={[150, 50]}
                                resolution={1024}
                                mixBlur={3}
                                mixStrength={40}
                                roughness={1}
                                depthScale={1.2}
                                minDepthThreshold={0.4}
                                maxDepthThreshold={1.4}
                                color="#101010"
                                metalness={0.5}/>
                        </Circle>
                        <Environment files={"/environments/venice_sunset_4k.hdr"}></Environment>
                    </Canvas>
                </div>
            </div>
        </div>
    )
}
