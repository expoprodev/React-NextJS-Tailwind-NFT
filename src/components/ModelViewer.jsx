import React, { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { MeshReflectorMaterial, Environment, Circle, Html  } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import useKeyboardControls from '../hooks/useKeyboardControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CircleFloor } from './CircleFloor'
import Loader from './Loader'
import { useGesture } from '@use-gesture/react'
import useTokenStore from '../hooks/userStore'

extend({ RoomEnvironment })
let movementClip

const ModelViewer = ({ avatar, equippedWearables, type }) => {
    const [modelType, setModelType] = useState('3D')

    const manager = new THREE.LoadingManager();

    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    
    };
    
    manager.onLoad = function ( ) {
        console.log( 'Loading complete!');
    };
    
    
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    
    };

    const loader = new GLTFLoader(manager)
    const dracoLoader = new DRACOLoader()
    const {accessToken} = useTokenStore()
    const [slug, setSlug] = useState()
    const [traits, setTraits] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const group = useRef()
    const modelRef = useRef()

    const getWearableUrl = (wearable) => {
        switch(type){
            case 'voxel':
                return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable.id}/voxel`
                break;
            case 'vrm':
                return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable.id}/vrm`
                break;
            default: 
                return `${process.env.NEXT_PUBLIC_URL}/api/v1/assets/wearables/${wearable.id}`
                break;
        }
        
    }

    const inArray = (needle, haystack) => {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
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
        const loadedTraits = traits.filter(x => x._id)

        await Promise.all(
            _keys.map(async (key) => {
                try {
                    //get wearables by trait
                    const trait = raw_traits.filter((x) => x.trait_type.toLowerCase() === key)[0]

                    //check if wearables are loaded if not then load 
                    if (!inArray(trait._id, loadedTraits)) {
                        const wearableUrl = getWearableUrl(trait)

                        console.log(wearableUrl)
                        const model = await modelLoader(wearableUrl)
                        avatar_data.push({ ...trait, model })
                    }
                } catch (err) {
                    console.log(err)
                }
            })
        )
        setModelType(type)
        setTraits(avatar_data)
        setSlug(avatar.base_avatar.slug)
        setIsLoading(false)
    }

    useEffect(() => {
        if (equippedWearables) {
            THREE.Cache.clear()
            dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/')
            loader.setDRACOLoader(dracoLoader)           
            getTraits()
        }
    }, [equippedWearables, type])

    async function modelLoader(url) {
        try {
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Authorization": `Bearer ${window.localStorage.getItem('token')}`
                }
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
                    object={scene}
                    scale={modelType === '3D' ? (slug == 'bayc' ? 4: 6) : 0.12}
                    position={modelType === '3D' ? [0, -3.5, -0.67] : [0, -3.5, 0]}
                    rotation={[0, modelType === '3D' ? 0 : Math.PI / 1, 0]}></primitive>
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
                {traits.map((trait, i) =>  
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
                     
                        <Suspense fallback={null}>
                            {isLoading && <Loader showMsg={false} />}
                            <Model  />
                        </Suspense>
                        <CircleFloor slug={avatar.base_avatar.slug} />
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
                        <Html>
                            {/* <button onClick={exportGLTF}>Export</button> */}
                        </Html>
                        <Environment files="/environments/venice_sunset_4k.hdr" />
                    </Canvas>
                </div>
            </div>
        </div>
    )
}

export default ModelViewer