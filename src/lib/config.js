export const ironOptions = {
    cookieName: "avatar-demo",
    password: "complex_password_at_least_32_characters_long",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
};

export const networks ={
    1:  {
        name: 'Ethereum',
        type: 'mainnets',
        chainId: '1',
        symbol: 'ETH'
    },
    137: {
        name: 'Polygon',
        type: 'mainnets',
        chainId: '137',
        symbol: 'MATIC'
    },
    4: {
        name: 'Rinkeby',
        type: 'testnets',
        chainId: '4',
        symbol: 'ETH'
    },
    5: {
        name: 'Goerli',
        type: 'testnets',
        chainId: '5',
        symbol: 'ETH'
    },
    80001: {
        name: 'Mumbai',
        type: 'testnets',
        chainId: '80001',
        symbol: 'MATIC'
    }
}