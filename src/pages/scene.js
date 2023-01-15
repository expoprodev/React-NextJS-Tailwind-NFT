/* eslint-disable react/display-name */
/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { FaLongArrowAltLeft } from 'react-icons/fa'
import api from '../lib/api'
import { Header } from '../components/Header'
import { NFTCards } from '../components/NFTCards'
import ModelViewer from '../components/ModelViewer'
import { toast } from 'react-toastify'

import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  ArcRotateCamera,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import SceneComponent from '../components/SceneComponent'

export default () => {
  const router = useRouter()
  const [access_token, setAccessToken] = useState()
  const { address, isConnected } = useAccount()
  const [avatars, setAvatars] = useState()
  const [avatar, setAvatar] = useState()
  const [equippedWearables, setEquippedWearables] = useState()
  const [showMenu, setShowMenu] = useState()

  let box

  const getAccessToken = async () => {
    const {
      data: { access_token },
    } = await api.post(`${process.env.NEXT_PUBLIC_URL}/api/v1/auth`, {
      apikey: process.env.API_KEY,
    })

    setAccessToken(access_token)
    window.localStorage.setItem('token', access_token)
  }

  useEffect(() => {
    //if(access_token) setAccessToken(access_token)
    getAccessToken()
  }, [])

  useEffect(() => {
    if (address) {
      getUsersNFTs()
    }
  }, [isConnected])

  const getUsersNFTs = async () => {
    const { data } = await api.post(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/users/verify`,
      {
        userAddress: address,
      },
      {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      }
    )
    console.log('🚀 ~ file: index.js ~ line 53 ~ getUsersNFTs ~ data', data)

    if (data.success) {
      setAvatars(data.avatars)
      const { collection, tokenId } = data.avatars[0]
      selectAvatar(collection, tokenId)
      console.log(data)
    }
  }

  const selectAvatar = async (collection, tokenId) => {
    try {
      const { data } = await api.get(
        `${process.env.NEXT_PUBLIC_URL}/api/v1/collections/${collection}/${tokenId}`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          },
        }
      )

      if (data.success) {
        const avatarData = data.isMinted
          ? data.avatar
          : { base_avatar: { slug: collection } }
        console.log(avatarData)
        setAvatar(avatarData)
        const wearables = data.isMinted ? data.avatar.wearables : data.wearables

        const defaultWearables = {}
        wearables.map((item) => {
          defaultWearables = {
            ...defaultWearables,
            [item.trait_type.toLowerCase()]: item,
          }
        })

        if (wearables.length !== 0) {
          setEquippedWearables(defaultWearables)
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.message)
    }
  }

  const setSelectedAvatar = async () => {
    const { data } = await api.post(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/avatars/select`,
      {
        userAddress: address,
        avatarId: avatar._id,
      },
      {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      }
    )

    setShowMenu(true)
    console.log(data)
  }

  const onSceneReady = (scene) => {
    // var camera = new FreeCamera('camera1', new Vector3(0, 140, 120), scene)
    var camera = new ArcRotateCamera(
      'camera1',
      (3 * Math.PI) / 2,
      Math.PI / 2,
      3,
      new Vector3(0, 5, 0),
      scene
    )
    camera.useFramingBehavior = true

    camera.setTarget(Vector3.Zero())

    const canvas = scene.getEngine().getRenderingCanvas()

    camera.attachControl(canvas, true)

    var light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    //   box = MeshBuilder.CreateBox('box', { size: 2 }, scene)
    //   box.position.y = 1

    //   MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene)

    const model = async () => {
      await SceneLoader.ImportMeshAsync(
        '',
        `${process.env.NEXT_PUBLIC_URL}/uploads/wearables/`,
        '630cde446a2ef8d029f63b2f/assets/630cde446a2ef8d029f63b2f_fur.cheetah.glb'
      )
      // await SceneLoader.ImportMeshAsync(
      //   '',
      //   `/uploads/wearables/630cde446a2ef8d029f63b2f/assets/`,
      //   '630cde446a2ef8d029f63b2f_eyes.sad.glb'
      // )
      // await SceneLoader.ImportMeshAsync(
      //   '',
      //   `/uploads/wearables/630cde446a2ef8d029f63b2f/assets/`,
      //   '630cde446a2ef8d029f63b2f_clothes.bayc.t.black.glb'
      // )
      // await SceneLoader.ImportMeshAsync(
      //   '',
      //   `/uploads/wearables/630cde446a2ef8d029f63b2f/assets/`,
      //   '630cde446a2ef8d029f63b2f_mouth.bored.pizza.glb'
      // )
    }
    model()
  }

  const onRender = (scene) => {
    if (box !== undefined) {
      var deltaTimeInMillis = scene.getEngine().getDeltaTime()

      const rpm = 10
      box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', height: '100vh', width: '100vw' }}>
      <SceneComponent
        antialias
        onSceneReady={onSceneReady}
        onRender={onRender}
        id="my-canvas"
      />
    </div>
  )
}
