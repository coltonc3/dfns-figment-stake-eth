require('dotenv').config()
const { DfnsApiClient } = require('@dfns/sdk')
const { DfnsWallet } = require('@dfns/lib-ethersjs6')
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
const initDfnsWallet = async (walletId) => { return DfnsWallet.init({ walletId, dfnsClient }) }

const signWithDfns = async (dfnsWallet, unsignedTransaction) => {
  try {
    const walletId = process.env.FUNDING_WALLET_ID

    console.log('unsigned tx: ' + unsignedTransaction.unsigned_transaction_serialized)

    const signedTransaction = await dfnsClient.wallets.generateSignature({
      walletId, 
      body: { kind: 'Transaction', transaction: unsignedTransaction.unsigned_transaction_serialized}
    })

    return signedTransaction.signature.encoded
  } catch(e) {
    console.log(e.context)
  }
}

const createValidators = async (withdrawalAddress, validatorsCount, network) => {
  try {
    const resp = await axios.post(`${figmentApiUrl}/ethereum/validators`, {
      withdrawal_address: withdrawalAddress,
      validators_count: validatorsCount,
      network: network
    },
    HEADERS);
    
    return resp.data.meta.staking_transaction
  } catch (e) {
    console.log(e.response.data.error)
  }
}

const broadcastTransaction = async (signature, unsignedTransactionSerialized) => {
  try {
    const resp = await axios.post(`${figmentApiUrl}/ethereum/broadcast`, {
      network: network,
      signature: signature,
      unsigned_transaction_serialized: unsignedTransactionSerialized
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
  const signature = await signWithDfns(dfnsWallet, unsignedTransaction)
  console.log('signed transaction')
  const txHash = await broadcastTransaction(signature, unsignedTransaction.unsigned_transaction_serialized)
  console.log(`broadcasted transaction. explorer link: https://${network == 'holesky' ? 'holesky.' : ''}etherscan.io/tx/${txHash}`)
}

main()
