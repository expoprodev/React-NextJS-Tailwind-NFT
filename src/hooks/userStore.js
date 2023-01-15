import create from 'zustand'

const useTokenStore = create((set, get) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({
    accessToken: accessToken
  }),  
}))

export default useTokenStore