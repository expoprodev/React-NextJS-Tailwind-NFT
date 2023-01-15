import React, { useEffect, useState } from 'react'
import { Image } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'
import { useRouter } from 'next/router'

export const CircleFloor = ({ slug }) => {
  if (!slug) return
  const [rotation, setRotation] = useState([0, 0, 0])
  const router = useRouter()
  const [isHome, setIsHome] = useState(router.asPath === '/' ? true : false)

  // useEffect(() => {
  //   if (router.query) {
  //     setIsHome(router.asPath === '/')
  //   }
  // }, [router.query])

  const spring = useSpring({
    rotation,
    config: {
      friction: 80,
    },
  })

  useEffect(() => {
    let timeout

    const rotate = () => {
      setRotation([0, (Math.random() - 0.5) * Math.PI * 3, 0])

      timeout = setTimeout(rotate, (0.5 + Math.random() * 2) * 1000)
    }

    rotate()

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      {!isHome && (
        <Image
          scale={1.5}
          position={[0, -3.495, -0.7]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 6]}
          url={`/images/${slug}.png`}
          transparent={true}
        />
      )}

      <mesh
        receiveShadow
        scale={1.5}
        position={[0, -3.495, -0.7]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
      >
        <ringGeometry args={[0.98, 1, 70, 1]} />
      </mesh>
      <mesh
        receiveShadow
        scale={2.4}
        position={[0, -3.495, -0.7]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
      >
        <ringGeometry args={[0.99, 1, 70, 1]} />
      </mesh>
      <a.group position={[0, -3.495, -0.7]} {...spring}>
        <mesh
          receiveShadow
          scale={2.5}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[0.99, 1, 70, 1, 0, Math.PI / 4]} />
        </mesh>
        <mesh
          receiveShadow
          scale={2.5}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[0.99, 1, 70, 1, 90, Math.PI / 4]} />
        </mesh>
        <mesh
          receiveShadow
          scale={2.5}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[0.99, 1, 70, 1, 180, Math.PI / 4]} />
        </mesh>

        <mesh
          receiveShadow
          scale={2.6}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[0.99, 1, 70, 1, 50, Math.PI / 4]} />
        </mesh>
        <mesh
          receiveShadow
          scale={2.6}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[0.99, 1, 70, 1, 140, Math.PI / 4]} />
        </mesh>
        <mesh
          receiveShadow
          scale={2.6}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[0.99, 1, 70, 1, 210, Math.PI / 4]} />
        </mesh>
      </a.group>
    </>
  )
}
