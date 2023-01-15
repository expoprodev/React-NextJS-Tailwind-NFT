const LoadingModal = ({ message }) => {
    
    return (
        <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[100] font-roboto-b">
             <div className='w-full max-w-[500px] min-h-[200px] bg-zinc-800 rounded-lg border border-2 border-white text-white pb-2'>
                <div className="modal-content py-5 text-center px-6 flex flex-col items-center justify-between">           
                    <div className="pb-3">
                        <p className="text-xl font-bold">Please wait...</p>
                        <p>{message}</p>
                    </div>         
                    <div className='my-5 w-11 rotate text-center'>
                        <svg width={49} height={49} viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.0416 4.65421L15.3333 8.62223M24.4999 1.58337V6.16671V1.58337ZM35.9582 4.65421L33.6666 8.62223L35.9582 4.65421ZM44.3457 13.0417L40.3766 15.3334L44.3457 13.0417ZM47.4166 24.5H42.8332H47.4166ZM44.3457 35.9584L40.3766 33.6667L44.3457 35.9584ZM35.9582 44.3459L33.6666 40.3767L35.9582 44.3459ZM24.4999 47.4167V42.8334V47.4167ZM13.0416 44.3459L15.3333 40.3767L13.0416 44.3459ZM4.65408 35.9584L8.62211 33.6667L4.65408 35.9584ZM1.58325 24.5H6.16658H1.58325ZM4.65408 13.0417L8.62211 15.3334L4.65408 13.0417Z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>                
                    
                </div>
            </div>
        </div>
    )
}

export { LoadingModal } 