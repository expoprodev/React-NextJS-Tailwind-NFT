import { useState, useEffect, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import api from '../../lib/api'
import { FaRedo, FaUndo, FaTimes, FaRandom } from 'react-icons/fa'
import ModelViewer from '../../components/ModelViewer'
import { LoadingModal } from '../../components/LoadingModal'
import { WearablesCard } from '../../components/WearablesCard'
import { Header } from '../../components/Header'
import { toast } from 'react-toastify'
import { traitsLogo } from '../../lib/traitsLogo'
import BBModelViewer from '../../components/BBModelViewer'
import { GLTF2Export } from 'babylonjs-serializers'

const Customize = () => {
    const router = useRouter()
    const traitRef = useRef()
    const { slug } = router.query
    const [traits, setTraits] = useState()
    const [selectedTrait, setSelectedTrait] = useState()
    const [avatar, setAvatar] = useState()
    const [wearables, setWearables] = useState()
    const [filteredWearables, setFilteredWearables] = useState()
    const [equippedWearables, setEquippedWearables] = useState()
    const [selectedWearable, setSelectedWearable] = useState()

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const getAvatar = async () => {
        const { data } = await api.get(`/api/v1/avatars/${slug}`, {
            headers: {
                Authorization: 'Bearer ' + window.localStorage.getItem('token'),
            },
        })
        const avatar = data.avatar
        console.log(data.avatar)
        setAvatar({ ...avatar, traits: null })
        setWearables(data.avatar.wearables)
        getExtraWearables(data.avatar?.base_avatar?.slug)
    }

    const getExtraWearables = async (collection) => {
        const { data } = await api.get(`/api/v1/wearables/extra?collection=${collection}`, {
            headers: {
                Authorization: 'Bearer ' + window.localStorage.getItem('token'),
            },
        })

        setFilteredWearables(data.wearables)
    }

    useEffect(() => {
        if (slug) {
            getAvatar()

        }
    }, [slug])

    const getWearables = async () => {
        if (wearables) {
            const _traits = wearables
                .filter(
                    (wearable) =>
                        wearable.collection.id == '632daa246a347d43d705a4a6'
                )
                .reduce((result, current) => {
                    const isFound = result.filter(
                        (res) => res === current.trait_type.toLowerCase()
                    )
                    if (isFound.length === 0) {
                        result.push(current.trait_type.toLowerCase())
                    }
                    return result
                }, [])

            setTraits(_traits)
            setSelectedTrait(_traits[0])

            const defaultWearables = {}

            avatar.wearables.map((item) => {
                defaultWearables = {
                    ...defaultWearables,
                    [item.trait_type.toLowerCase()]: item,
                }
            })

            if (avatar.wearables.length !== 0) {
                setEquippedWearables(defaultWearables)
            } else {
                let slug = 'bayc'
                if (slug === 'bayc') {
                    const fur = wearables.filter(
                        (wearable) =>
                            wearable.trait_type.toLowerCase() === 'fur' &&
                            wearable.slug === 'brown'
                    )[0]
                    const eyes = wearables.filter(
                        (wearable) =>
                            wearable.trait_type.toLowerCase() === 'eyes' &&
                            wearable.slug === 'bored'
                    )[0]
                    const mouth = wearables.filter(
                        (wearable) =>
                            wearable.trait_type.toLowerCase() === 'mouth' &&
                            wearable.slug === 'bored'
                    )[0]

                    setEquippedWearables({ fur, eyes, mouth })
                }

                if (slug == 'cool-cats') {
                    const face = wearables.filter(
                        (wearable) =>
                            wearable.trait_type.toLowerCase() === 'face' &&
                            wearable.slug === 'angry' &&
                            wearable.collection.id === avatar.default_wearable
                    )[0]
                    setEquippedWearables({ face })
                }
            }
        }
    }

    const handleTraitSelection = (trait) => {
        setSelectedTrait(trait)
        setFilteredWearables(
            wearables.filter(
                (wearable) =>
                    wearable.trait_type.toLowerCase() === trait &&
                    wearable.collection.id == '632daa246a347d43d705a4a6'
            )
        )
    }

    useEffect(() => {
        if (avatar && wearables) {
            getWearables()
        }
    }, [avatar, wearables])

    const equipped = (data) => {
        let wearable = data
        if (!data) {
            let slug = 'bayc'
            if (slug === 'bayc') {
                const fur = wearables.filter(
                    (wearable) =>
                        wearable.trait_type.toLowerCase() === 'fur' &&
                        wearable.slug === 'brown'
                )[0]
                const eyes = wearables.filter(
                    (wearable) =>
                        wearable.trait_type.toLowerCase() === 'eyes' &&
                        wearable.slug === 'bored'
                )[0]
                const mouth = wearables.filter(
                    (wearable) =>
                        wearable.trait_type.toLowerCase() === 'mouth' &&
                        wearable.slug === 'bored'
                )[0]
                setEquippedWearables({ fur, eyes, mouth })
            }

            if (slug == 'cool-cats') {
                const face = wearables.filter(
                    (wearable) =>
                        wearable.trait_type.toLowerCase() === 'face' &&
                        wearable.slug === 'angry'
                )[0]
                setEquippedWearables({ face })
            }

            wearable = null
        } else {
            const _avatar = avatar
            let _traits = {
                ...equippedWearables,
                [wearable.trait_type.toLowerCase()]: wearable,
            }
            _avatar.traits = _traits

            setSelectedWearable(wearable)
            setEquippedWearables(_traits)
        }
    }

    const saveWearables = async () => {
        setIsLoading(true)
        setMessage('Saving changes of your avatar.')
        let _wearables = []
        Object.keys(equippedWearables).forEach(async (key, i) => {
            if (key === 'Background') return
            const wearable = equippedWearables[key]
            _wearables.push(wearable.id)
        })

        const { data: saveRes } = await api.post(
            '/api/v1/wearables',
            {
                avatarId: avatar.id,
                wearables: _wearables,
            },
            {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem('token')}`,
                },
            }
        )

        if (saveRes.success) {
            toast.success("Equipped item's successfully saved.")
        } else {
            toast.error(saveRes.message)
        }

        setIsLoading(false)
    }

    const resetWearables = async () => {
        setIsLoading(true)
        setMessage("Resetting your avatars' wearables.")

        try {
            const { data: saveRes } = await api.post(
                '/api/v1/wearables/reset',
                {
                    avatarId: avatar.id,
                    tokenId: avatar.tokenId,
                    slug: avatar.base_avatar.slug,
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
                    },
                }
            )

            if (saveRes.success) {
                const defaultWearables = {}
                saveRes.wearables.map((item) => {
                    defaultWearables = {
                        ...defaultWearables,
                        [item.trait_type.toLowerCase()]: item,
                    }
                })

                if (saveRes.wearables.length !== 0) {
                    setEquippedWearables(defaultWearables)
                }

                toast.success('Wearables successfully reset.')
            } else {
                toast.error(saveRes.message)
            }
        } catch (error) {
            toast.error(error?.message)
        }

        setIsLoading(false)
    }

    if (!avatar) return <LoadingModal />

    return (
        <div className="w-screen h-screen flex flex-col">
            <Header />
            <div id="main" className="w-screen h-[100vh] bg-[#000203] py-2 text-white overflow-hidden lg:scrollbar-x relative">
                <div className="w-full h-full">
                    <div className="w-full h-full flex flex-row justify-between gap-2 px-4 lg:px-10 ">
                        <div className="flex flex-col sm:w-[35%] lg:max-w-[450px] md:space-y-4">
                            <div className="w-full h-full hidden sm:flex flex-col p-2 md:max-h-[calc(100%-100px)] lg:flex-row gap-3">
                                <div className="sm:w-full lg:w-[60px] z-50 lg:skew-y-3 ">
                                    <h1 className="h-fit hidden sm:flex sm:my-1 lg:block justify-center items-center lg:pb-2 lg:skew-y-3 text-center font-roboto-b">
                                        {selectedTrait?.toUpperCase()}
                                    </h1>
                                    <ul ref={traitRef} className="lg:skew-y-3 flex sm:flex-row lg:flex-col sm:w-full lg:w-[60px] h-fit gap-2 lg:gap-0 bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-lg justify-between text-sm font-medium text-center">
                                        {traits?.map((trait, i) => (
                                            <li className={
                                                'justify-center items-center px-1 lg:p-3 hover:text-white' +
                                                (trait === selectedTrait
                                                    ? ' text-white'
                                                    : ' bg-transparent')
                                            }
                                                key={i}>
                                                <button
                                                    className="w-full sm:h-full py-2 h-[100%] flex hover:bg-transparent"
                                                    onClick={() => handleTraitSelection(trait)}>
                                                    {traitsLogo[trait]}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <WearablesCard
                                    wearables={filteredWearables}
                                    equipped={equipped}
                                    equippedWearables={equippedWearables}
                                    selectedTrait={selectedTrait}
                                />
                            </div>
                        </div>

                        <div className="absolute top-[2rem] right-4 sm:relative h-full justify-between w-full sm:w-[35%] max-w-[450px] flex flex-col sm:p-0 md:p-2 overflow-auto scrollbar-none z-20 ">
                            <div className="flex flex-col justify-between w-full items-end mr-2 md:mr-0 md:items-center mt-2 md:mt-5 lg:my-0 lg:items-start lg:justify-start">
                                <div className="hidden sm:block sm:text-sm lg:text-lg lg:block">
                                    {selectedWearable ? (
                                        <>
                                            <h2 className="font-roboto-h sm:text-xl md:text-2xl text-[33px] md:skew-y-[-2deg] mb-5">
                                                {selectedWearable?.name.toUpperCase()}
                                            </h2>
                                            <div className="flex flex-row justify-between items-center sm:mt-1 sm:gap-1 lg:gap-3 lg:mt-5 skew-y-[-2deg]">
                                                <div className="flex flex-col w-full">
                                                    <span className="mb-4">TRAIT TYPE</span>
                                                    <div className="text-center rounded-2xl bg-[#A7CA52] w-full p-2 items-center text-black sm:text-[1.2rem] lg:text-[24px] font-roboto-h">
                                                        {selectedWearable.trait_type.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col w-full">
                                                    <span className="mb-4">SPONSOR</span>
                                                    <div className="text-center rounded-2xl items-center text-black text-[24px] font-roboto-b">
                                                        <img
                                                            src="/images/forj.png"
                                                            className="h-[40px] lg:h-[60px]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <h2 className="font-roboto-h text-xl md:text-2xl lg:text-[2rem] skew-y-[-2deg] mb-5">
                                            {avatar?.name?.toUpperCase()}
                                        </h2>
                                    )}
                                    <p className="sm:my-2 hidden lg:block lg:my-5 font-roboto-r skew-y-[-2deg]">
                                        Your avatar can serve as your digital identity in cross
                                        world, and open digital doors for you. Your avatar will be
                                        stored as ERC-721 tokens on the Ethereum blockchain and
                                        hosted on IPFS.
                                    </p>
                                </div>

                                <div className="mt-2 md:mt-3 flex justify-between gap-3">
                                    <button
                                        onClick={() => resetWearables(null)}
                                        className="h-[52px] w-[52px] rounded-full bg-zinc-800 hover:bg-zinc-900 p-2 sm:p-1 md:p-3 items-center text-white text-xs md:text-xl lg:text-[24px] font-roboto-h text-center "
                                    >
                                        <FaUndo className="m-[3px] " />
                                    </button>
                                    <a
                                        target="_blank"
                                        href={`https://testnets.opensea.io/assets/mumbai/${avatar?.base_avatar?.contract_address}/${avatar?.tokenId}`}
                                        className="btn btn-primary btn_auction btn-sm w-[50px]"
                                    >
                                        <img
                                            src="/images/opensea.png"
                                            className="h-[50px] w-[50px]"
                                        />
                                    </a>
                                </div>
                                <div className="mt-0 md:mt-5 lg:skew-y-[2deg] flex flex-row gap-2">
                                    <button
                                        onClick={() => saveWearables()}
                                        className="mt-3 rounded-full bg-zinc-800 hover:bg-zinc-900 w-[50px] sm:w-[180px] lg:w-[300px] p-1 sm:p-1 md:p-3 items-center text-white text-xs md:text-xl lg:text-[24px] font-roboto-h text-center"
                                    >
                                        SAVE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-10 sm:top-0 right-0 left-0 bottom-0 z-10">
                        <div className="w-full flex items-center">
                            {avatar && (
                                <ModelViewer
                                    avatar={avatar}
                                    equippedWearables={equippedWearables}
                                    type="3D"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isLoading && <LoadingModal message={message} />}
        </div>
    )
}

export default Customize
