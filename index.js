require('dotenv').config()
const { DfnsApiClient } = require('@dfns/sdk')
const { DfnsWallet } = require('@dfns/lib-ethersjs5')
const { TransactionRequest } = require('@ethersproject/abstract-provider')
const { AsymmetricKeySigner } = require('@dfns/sdk-keysigner')
const axios = require('axios')
const HEADERS = { 
  headers: {
    'x-api-key': process.env.FIGMENT_API_KEY
  }
}
const validatorsCount = 1
const network = 'holesky'
const figmentApiUrl = 'https://api.figment.io'

const initDfnsWallet = async (walletId) => {
  const signer = new AsymmetricKeySigner({
    credId: process.env.DFNS_CRED_ID,
    privateKey: process.env.DFNS_PRIVATE_KEY,
  })

  const dfnsClient = new DfnsApiClient({
    appId: process.env.DFNS_APP_ID,
    authToken: process.env.DFNS_AUTH_TOKEN,
    baseUrl: process.env.DFNS_API_URL,
    signer,
  })

  return DfnsWallet.init({ walletId, dfnsClient })
}

const signWithDfns = async (dfnsWallet, unsignedTransaction) => {
  const formattedUnsignedTransaction = {
    to: unsignedTransaction.to,
    from: unsignedTransaction.from,
    data: unsignedTransaction.contract_call_data,
    value: unsignedTransaction.amount_wei.toString(),
    type: 2 // use eip1559 transaction type so we don't serialize value
  }

  const signedTransaction = await dfnsWallet.signTransaction(formattedUnsignedTransaction)

  return signedTransaction
}

const createValidators = async (withdrawalAddress, validatorsCount, network) => {
  const resp = await axios.post(`${figmentApiUrl}/ethereum/validators`, {
    withdrawal_address: withdrawalAddress,
    validators_count: validatorsCount,
    network: network
  },
  HEADERS);
  
  return resp.data.meta.staking_transaction
}

const broadcastTransaction = async (signedTransaction) => {
  try {
    const resp = await axios.post(`${figmentApiUrl}/ethereum/broadcast`, {
      network: network,
      signed_transaction: signedTransaction
    },
    HEADERS);
    
    return resp.data.data.transaction_hash
  } catch (e) {
    console.log(e.response.data.error)
  }
}


const main = async () => {
  const dfnsWallet = await initDfnsWallet(process.env.FUNDING_WALLET_ID)

  const unsignedTransaction = await createValidators(await dfnsWallet.getAddress(), validatorsCount, network)
  console.log('created validators')
  const signedTransaction = await signWithDfns(dfnsWallet, unsignedTransaction)
  console.log('signed transaction')
  const txHash = await broadcastTransaction(signedTransaction)
  // console.log(`broadcasted transaction. explorer link: https://etherscan.io/tx/${txHash}`)
}

main()
