export const data = {
  walletCreatedTitle: 'Wallet created successfully',
  walletCreatedSubtitle:
    'Your new wallet has been created successfully, you can now connect to your wallet.',
  walletRestoredTitle: 'Wallet restored',
  walletRestoredSubtitle: 'Your wallet has been successfully restored.',
  //passwords should either be saved in a env variable or created via faker.js
  walletPassword: 'Admin@1234',
  seedPhrase: process.env.SEED_PHRASE as string,
};
