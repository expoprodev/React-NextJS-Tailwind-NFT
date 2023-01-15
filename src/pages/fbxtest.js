import React, { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { MeshReflectorMaterial, Environment, Circle  } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import useKeyboardControls from '../hooks/useKeyboardControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CircleFloor } from '../components/CircleFloor'
import Loader from '../components/Loader'
import { useGesture } from '@use-gesture/react'

extend({ RoomEnvironment })
let movementClip

const ModelViewer = ({ avatar, equippedWearables, type }) => {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    const [slug, setSlug] = useState()
    const [traits, setTraits] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [mixamoAnim, setMixamoAnim] = useState()
    const group = useRef()
    const modelRef = useRef()



    useEffect(() => {
        const loader = new FBXLoader()

        //load model
        loader.load('/animations/BAYC_fbx_set/fur.fbx', function (object) {
            object.updateMatrixWorld();
            let box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3()).length();

            //var shift = box.getCenter();
            object.position.set(0, 0, 0)

            const scalar = 3; // Change this to set the general size for each object
            object.scale.set(scalar/size,scalar/size,scalar/size);
            //object.rotation.set(0, Math.PI/2, 0)
            const _traits = traits
            _traits.push({
                wearableId: '123123123',
                model: object
            })
            setTraits(_traits)

            console.log(object.animations[0])
          
        })

        loader.load('/animations/Mad Dance - Retargeted Metahuman FBX', function (object) {
           
            object.rotation.set(0, 0,  Math.PI/2)
            setMixamoAnim(object.animations[0])
        })


    }, [])


    async function modelLoader(url) {
        try {
            return new Promise((resolve, reject) => {
                loader.load(url, (data) => resolve(data), null, reject)
            })
        } catch (err) {
            console.log(err)
        }
    }

    const LoadTrait = ({ data }) => {
        if (!data && !mixamoAnim) return
        let gltf = data
        //const { movement } = useKeyboardControls()
        //const { scene, animations } = gltf

        // scene.traverse((children) => {
        //     if (children instanceof THREE.Mesh) {
        //         children.castShadow = true;
        //     }
        // });
        let mixer
        try {
            mixer = new THREE.AnimationMixer(gltf)         
            mixer.clipAction(mixamoAnim).reset().fadeIn(0.5).play()             
        } catch (err) {
            console.log(err)
            return
        }

        useEffect(() => {
            return () => {
                //fix bugs on crawl and idle transition (arm becomes broken)
                mixer.stopAllAction();
                mixer.uncacheRoot(mixer.getRoot());
                mixer = null;
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
                    object={gltf}
                    // scale={0.03}
                    position={type === '3D' ? [0, -3.5, -0.67] : [0, -3.5, 0]}
                    rotation={[0, Math.PI / 1, 0]}></primitive>
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
                {mixamoAnim && traits.map((trait, i) =>  
                    <LoadTrait key={trait.wearableId + '_' + i} data={trait.model}/>
                )}
            </group>
        )
    }

    const bind = useGesture({
        onWheel: ({ direction: [, scrollY] }) => {
            modelRef.current ? (modelRef.current.rotation.y += (scrollY > 0 ? 0.5 : -0.5)) : null
        },
        onDrag: ({ direction: [scrollX, _] }) => {  
            modelRef.current ? (modelRef.current.rotation.y += (scrollX > 0 ? 0.1 : -0.1)) : null
        },
    },{ pointerEvents: true })

    return (
        <div className="w-full h-full flex justify-center items-center z-0">
            <div className="w-full  h-full">    
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
                            state.gl.toneMappingExposure = 0.5
                        }} {...bind()}>
                        <fog attach="fog" args={['#06161D', 0, 30]} /> 
                        <hemisphereLight intensity={0.45} />
                        <spotLight castShadow position={[5,10,3]} intensity={2} />
                     
                        <Suspense fallback={<Loader  />}>
                           
                            <Model  />
                        </Suspense>
                        <CircleFloor slug={""} />
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
                        <Environment files="/environments/venice_sunset_4k.hdr" />
                    </Canvas>
                </div>
            </div>
        </div>
    )
}

export default ModelViewer