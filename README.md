# dfns-figment-stake-eth

This repository demonstrates how to use Figment's API to stake ETH from DFNS wallet tech. 

Configure your .env file the same way you would in [this repo](https://github.com/dfns/dfns-sdk-ts/tree/m/examples/libs/solana/staking), except replace `AUTHORITY_WALLET_ID` with `FUNDING_WALLET_ID`, and add your Figment API key under `FIGMENT_API_KEY`. Find Figment's API authentication instructions [here](https://docs.figment.io/reference/authentication). 

Example .env
```
DFNS_API_URL='https://api.dfns.ninja'
DFNS_APP_ID=''
DFNS_CRED_ID=''
DFNS_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----'
DFNS_AUTH_TOKEN=''
FUNDING_WALLET_ID=''
FIGMENT_API_KEY=''
```