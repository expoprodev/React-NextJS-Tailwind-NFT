import { Document, NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { prune , dedup, weld, textureResize } from '@gltf-transform/functions';
import dbConnect from './dbConnect'
import Wearable from '../models/wearable'

const fs = require('fs-extra');

dbConnect()

const mergeWearables = async (avatarId, wearables) => {
    const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
    const outputDocument = new Document()    

    const items = await Wearable.find({ _id: { $in: wearables}})
    
    await Promise.all(items.map(async (wearable) => {
        outputDocument.merge(await io.read(process.env.PROJECT_ROOT + '/public/wearables/' + wearable.external_link))
    }))

    const root = outputDocument.getRoot();
    const mainScene = root.listScenes()[0];

    for (const scene of root.listScenes()) {
        if (scene === mainScene) continue;

        for (const child of scene.listChildren()) {
            for (const node of child.listChildren()) {       
                mainScene.addChild(node)
            }
        }
        scene.dispose();
    }

    //merge animations
    const animations = []
    for (const animation of root.listAnimations()) {
        const isFound = animations.filter((anim) => anim.getName() === animation.getName())                    
        if (isFound.length > 0) {
            const index = animations.findIndex((anim) => anim.getName() === animation.getName())
            for (const channel of animation.listChannels()){
                animations[index].addChannel(channel)
            }

            for (const sampler of animation.listSamplers()){
                animations[index].addSampler(sampler)
            }
            animation.dispose();
        } else {
            animations.push(animation)
        }
    }

    await outputDocument.transform(dedup(), prune(), weld(), textureResize({size: [1024, 1024]}));

    const buffer = root.listBuffers()[0];
    root.listAccessors().forEach((a) => a.setBuffer(buffer));
    root.listBuffers().forEach((b, index) => index > 0 ? b.dispose() : null);
    fs.ensureDirSync(process.env.PROJECT_ROOT + `/assets/avatars`);
    await io.write(process.env.PROJECT_ROOT + `/assets/avatars/${avatarId}.glb`, outputDocument);
}

const optimizeWearables = async (collectionItem, externalLink) => {
    const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
   

    const outputDocument = await io.read(process.env.PROJECT_ROOT + `/public/wearables/${externalLink}`) 
    
    const root = outputDocument.getRoot();
    await outputDocument.transform(dedup(), prune(), weld(), textureResize({size: [1024, 1024]}));

    const buffer = root.listBuffers()[0];
    root.listAccessors().forEach((a) => a.setBuffer(buffer));
    root.listBuffers().forEach((b, index) => index > 0 ? b.dispose() : null);

    fs.ensureDirSync(process.env.PROJECT_ROOT + `/public/compressed/${collectionItem}/assets`);

    await io.write(process.env.PROJECT_ROOT + `/public/compressed/${externalLink}`, outputDocument);
}

export { mergeWearables, optimizeWearables }
