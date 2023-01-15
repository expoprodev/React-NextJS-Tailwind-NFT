import React, { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { MeshReflectorMaterial, Environment, Circle   } from '@react-three/drei'
import useKeyboardControls from '../hooks/useKeyboardControls'
import { useWheel } from '@use-gesture/react'
import Loader from './Loader'
import { CircleFloor } from './CircleFloor'

extend({ RoomEnvironment })
let movementClip

export const ModelPreview = ({ avatar}) => {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    const [model, setModel] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const group = useRef()
    const modelRef = useRef()

    const loadAvatar = async () => {
        setIsLoading(true)
        const model = await modelLoader(`/avatars/${avatar._id}.glb`)
        setModel(model)
        setIsLoading(false)
    }

    useEffect(() => {
        THREE.Cache.clear()
        dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/')
        loader.setDRACOLoader(dracoLoader)
        loadAvatar()
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
        if (!data) return
        let gltf = data
        const { movement } = useKeyboardControls()
        const { scene, animations } = gltf

        scene?.traverse((children) => {
            if (children instanceof THREE.Mesh) {
                children.castShadow = true;
            }
        });
        let mixer
        try {
            mixer = new THREE.AnimationMixer(scene)         
            let idleClip = animations.filter((a) => a.name.toLowerCase().includes('idle'))[0] || animations[0]
          
            //keyboard triggered animation
            if ( movement && !movement.includes('rotate') ) {
                movementClip = animations.filter((a) => a.name.toLowerCase().includes(movement) )[0] || animations[0]
                mixer.clipAction(idleClip).fadeOut(0.5)
                mixer.clipAction(movementClip).reset().fadeIn(0.5).play()
            }
            //default and selected animation
            else {
                //remove previous keyboard triggered animation
                if (movementClip) {
                    mixer.clipAction(movementClip).fadeOut(0.5)                  
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
                mixer.stopAllAction();
                mixer.uncacheRoot(mixer.getRoot());
                mixer = null;
                movementClip = null
            }
        })

        useFrame((state, delta) => {
            mixer?.update(delta)
        })

        return (
            <group ref={group} position={[0, 0, 0]}>
                <primitive
                    castShadow
                    receiveShadows
                    object={scene}
                    scale={avatar.base_avatar.slug == 'cool-cats' ? 6 : 4}
                    position={[0, -3.5, 0]}
                    rotation={[ 0, 0 , 0]}></primitive>
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
                {
                    model &&
                    <LoadTrait data={model}/>
                }               
            </group>
        )
    }

    const bind = useWheel(
        ({ offset: [x, y], direction: [, scrollX] }) => {
            modelRef.current ? (modelRef.current.rotation.y += (scrollX > 0 ? 0.5 : -0.5)) : null
        },
        { pointerEvents: true }
    )

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
                        }} {...bind()}>
                        <fog attach="fog" args={['#06161D', 0, 30]} /> 
                        <hemisphereLight intensity={0.45} />
                        <spotLight castShadow position={[5,10,3]} intensity={1} />
                     
                        <Suspense fallback={<Loader  />}>
                            {isLoading && <Loader showMsg={false} />}
                            <Model  />
                        </Suspense>
                        <CircleFloor slug={avatar.slug} />
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
                        <Environment>
                            <roomEnvironment/>
                        </Environment>
                    </Canvas>
                </div>
            </div>
        </div>
    )
}