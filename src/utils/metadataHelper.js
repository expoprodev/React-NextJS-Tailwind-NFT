import dbConnect from './dbConnect'
import Wearable from '../models/wearable'
import api from '../lib/api'

dbConnect();

//const baseTokenUri = slug === 'bayc' ? 'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq' : 'https://api.coolcatsnft.com/cat' 
const fetchMetadata = async (url) => {
    const  { data } = await api.get(url)
    const slugs = []
    let background = ""
    
    data.attributes.map((item) => {
        if (item.trait_type !== 'Background') {
            slugs.push(`${item.trait_type.toLowerCase()}-${item.value.split(' ').join('-').toLowerCase()}`)
        } else {
            background = item.value.toLowerCase()
        }
    })                
   
    return { slugs, background }
}

// const collectionId = slug === 'bayc' ?  '630cde446a2ef8d029f63b2f' : '631346a89197da096146c752'
const findWearables = async (collectionId, slugs) => {
    return await Wearable.find({ slug: { $in: slugs}, collectionItem: collectionId})
}

export { fetchMetadata, findWearables }
