const ConfirmModal = ({ toggleConfirm,  confirmAction }) => {
    
    return (
        <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[100]">
             <div className='w-full max-w-[500px] bg-zinc-800 rounded-lg border border-2 border-white text-white pb-2'>
                <div className="modal-content py-4 text-left px-6">                    
                    <div className="flex justify-between items-center pb-3 font-roboto-b">
                        <p className="text-2xl font-bold">Confirm Minting</p>
                        <div onClick={()=> toggleConfirm(false)} className="modal-close cursor-pointer z-50">
                            <svg className="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                            <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                            </svg>
                        </div>
                    </div>

                    <p className="font-roboto-r">It seems that you don't own a token required for minting this token. For demo purposes please click confirm to claim avatar.</p>
                    
                    <div className="flex justify-end pt-5 gap-3">
                        <button onClick={()=> toggleConfirm(false)} className="rounded-2xl bg-zinc-800 hover:bg-zinc-900 w-[120px] p-3 items-center text-white font-roboto-h text-center">CANCEL</button>
                        <button onClick={confirmAction} className="rounded-2xl hover:bg-zinc-900 border w-[120px] p-3 items-center text-white font-roboto-h text-center">CONFIRM</button>
                    </div>
                    
                </div>

            </div>
        </div>
    )
}


export default ConfirmModal