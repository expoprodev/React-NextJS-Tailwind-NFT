import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {  
    render() {
        return (
            <Html lang='en' >
                <Head />
                <body className="body bg-[#000203]">  
                    <Main />
                    <NextScript />        
                    <div id="modal-root"></div> 
                </body>
            </Html>
        )
    }
}

export default MyDocument