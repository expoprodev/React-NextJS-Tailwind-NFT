const getAverageColor = (img) => {
    const max = 10; // Max size (Higher num = better precision but slower)
    const {naturalWidth: iw, naturalHeight: ih} = img;
    const ctx = document.createElement`canvas`.getContext`2d`; 
    const sr = Math.min(max / iw, max / ih); // Scale ratio
    const w = Math.ceil(iw * sr); // Width
    const h = Math.ceil(ih * sr); // Height
    const a = w * h;              // Area
    
    img.crossOrigin = 1;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    
    const data = ctx.getImageData(0, 0, w, h).data;
    let r = g = b = 0;
    
    for (let i=0; i<data.length; i+=4) {
        r += data[i];
        g += data[i+1];
        b += data[i+2];
    }

    r = ~~(r/a);
    g = ~~(g/a);
    b = ~~(b/a);

    return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


export  { getAverageColor }
