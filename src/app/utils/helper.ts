import {
  Account,
  BitcoinEsploraApiProvider,
  FungibleToken,
  getStacksInfo,
  microstacksToStx,
  NetworkType,
  NftData,
  satsToBtc,
  SettingsNetwork,
  StxMempoolTransactionData,
} from '@secretkeylabs/xverse-core';
import { ChainID } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { TFunction } from 'react-i18next';
import {
  BTC_TRANSACTION_STATUS_URL,
  BTC_TRANSACTION_TESTNET_STATUS_URL,
  MAX_ACC_NAME_LENGTH,
  TRANSACTION_STATUS_URL,
} from './constants';

const validUrl = require('valid-url');

export function initBigNumber(num: string | number | BigNumber) {
  return BigNumber.isBigNumber(num) ? num : new BigNumber(num);
}

export function ftDecimals(value: number | string | BigNumber, decimals: number): string {
  const amount = initBigNumber(value);
  return amount.shiftedBy(-decimals).toNumber().toString();
}

export function convertAmountToFtDecimalPlaces(
  value: number | string | BigNumber,
  decimals: number,
): number {
  const amount = initBigNumber(value);
  return amount.shiftedBy(+decimals).toNumber();
}

export function replaceCommaByDot(amount: string) {
  return amount.replace(/,/g, '.');
}

export const microStxToStx = (mStx: number | string | BigNumber) => {
  const microStacks = initBigNumber(mStx);
  return microStacks.shiftedBy(-6);
};

/**
 * get ticker from name
 */
export function getTicker(name: string) {
  if (name.includes('-')) {
    const parts = name.split('-');
    if (parts.length >= 3) {
      return `${parts[0][0]}${parts[1][0]}${parts[2][0]}`;
    }
    return `${parts[0][0]}${parts[1][0]}${parts[1][1]}`;
  }
  if (name.length >= 3) {
    return `${name[0]}${name[1]}${name[2]}`;
  }
  return name;
}

export function getTruncatedAddress(address: string, lengthToShow = 4) {
  return `${address.substring(0, lengthToShow)}...${address.substring(
    address.length - lengthToShow,
    address.length,
  )}`;
}

export function getShortTruncatedAddress(address: string) {
  if (address) {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8, address.length)}`;
  }
}

export function getAddressDetail(account: Account) {
  if (account.btcAddress && account.stxAddress) {
    return `${getTruncatedAddress(account.btcAddress)} / ${getTruncatedAddress(
      account.stxAddress,
    )}`;
  }
  if (account.btcAddress || account.stxAddress) {
    const existingAddress = account.btcAddress || account.stxAddress;
    return getTruncatedAddress(existingAddress);
  }
  return '';
}

export function getExplorerUrl(stxAddress: string): string {
  return `https://explorer.stacks.co/address/${stxAddress}?chain=mainnet`;
}

export function getStxTxStatusUrl(transactionId: string, currentNetwork: SettingsNetwork): string {
  return `${TRANSACTION_STATUS_URL}${transactionId}?chain=${currentNetwork.type.toLowerCase()}`;
}

export function getBtcTxStatusUrl(txId: string, network: SettingsNetwork) {
  if (network.type === 'Testnet') {
    return `${BTC_TRANSACTION_TESTNET_STATUS_URL}${txId}`;
  }
  return `${BTC_TRANSACTION_STATUS_URL}${txId}`;
}

export function getFetchableUrl(uri: string, protocol: string): string | undefined {
  const publicIpfs = 'https://gamma.mypinata.cloud/ipfs';
  if (protocol === 'http') return uri;
  if (protocol === 'ipfs') {
    const url = uri.split('//');
    return `${publicIpfs}/${url[1]}`;
  }
  return undefined;
}
/**
 * check if nft transaction exists in pending transactions
 * @param pendingTransactions
 * @param nft
 * @returns true if nft exists, false otherwise
 */
export function checkNftExists(
  pendingTransactions: StxMempoolTransactionData[],
  nft: NftData,
): boolean {
  const principal: string[] = nft?.fully_qualified_token_id?.split('::');
  const transaction = pendingTransactions.find(
    (tx) =>
      tx.contractCall?.contract_id === principal[0] &&
      tx.contractCall.function_args[0].repr.substring(1) === nft.token_id.toString(),
  );
  if (transaction) return true;
  return false;
}

export async function isValidStacksApi(url: string, type: NetworkType): Promise<boolean> {
  const networkChainId = type === 'Mainnet' ? ChainID.Mainnet : ChainID.Testnet;

  if (!validUrl.isUri(url)) {
    return false;
  }

  try {
    const response = await getStacksInfo(url);
    if (response) {
      if (response.network_id !== networkChainId) {
        // incorrect network
        return false;
      }
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
}

export async function isValidBtcApi(url: string, network: NetworkType) {
  if (!validUrl.isUri(url)) {
    return false;
  }

  const btcClient = new BitcoinEsploraApiProvider({
    network,
    url,
  });
  const defaultBtcClient = new BitcoinEsploraApiProvider({
    network,
  });

  try {
    const [customHash, defaultHash] = await Promise.all([
      btcClient.getBlockHash(1),
      defaultBtcClient.getBlockHash(1),
    ]);
    // this ensures the URL is for correct network
    return customHash === defaultHash;
  } catch (e) {
    return false;
  }

  return false;
}

export const getNetworkType = (stxNetwork) =>
  stxNetwork.chainId === ChainID.Mainnet ? 'Mainnet' : 'Testnet';

export const isHardwareAccount = (account: Account | null): boolean =>
  !!account?.accountType && account?.accountType !== 'software';

export const isLedgerAccount = (account: Account | null): boolean =>
  account?.accountType === 'ledger';

export const isInOptions = (): boolean => !!window.location?.pathname?.match(/options.html$/);

export function formatNumber(value?: string | number) {
  return value ? new Intl.NumberFormat().format(Number(value)) : '-';
}

export const handleKeyDownFeeRateInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // only allow positive integers
  // disable common special characters, including - and .
  // eslint-disable-next-line no-useless-escape
  if (e.key.match(/^[!-\/:-@[-`{-~]$/)) {
    e.preventDefault();
  }
};

export const validateAccountName = (
  name: string,
  t: TFunction<'translation', 'OPTIONS_DIALOG'>,
  accountsList: Account[],
  ledgerAccountsList: Account[],
) => {
  const regex = /^[a-zA-Z0-9 ]*$/;

  if (!name.length) {
    return t('RENAME_ACCOUNT_MODAL.REQUIRED_ERR');
  }

  if (name.length > MAX_ACC_NAME_LENGTH) {
    return t('RENAME_ACCOUNT_MODAL.MAX_SYMBOLS_ERR', {
      maxLength: MAX_ACC_NAME_LENGTH,
    });
  }

  if (
    ledgerAccountsList.find((account) => account.accountName === name) ||
    accountsList.find((account) => account.accountName === name)
  ) {
    return t('RENAME_ACCOUNT_MODAL.ALREADY_EXISTS_ERR');
  }

  if (!regex.test(name)) {
    return t('RENAME_ACCOUNT_MODAL.PROHIBITED_SYMBOLS_ERR');
  }

  return null;
};

export const calculateTotalBalance = ({
  stxBalance,
  btcBalance,
  ftCoinList,
  brcCoinsList,
  stxBtcRate,
  btcFiatRate,
  hideStx,
}: {
  stxBalance?: string;
  btcBalance?: string;
  ftCoinList: FungibleToken[] | null;
  brcCoinsList: FungibleToken[] | null;
  stxBtcRate: string;
  btcFiatRate: string;
  hideStx: boolean;
}) => {
  let totalBalance = new BigNumber(0);

  if (stxBalance && !hideStx) {
    const stxFiatEquiv = microstacksToStx(new BigNumber(stxBalance))
      .multipliedBy(new BigNumber(stxBtcRate))
      .multipliedBy(new BigNumber(btcFiatRate));
    totalBalance = totalBalance.plus(stxFiatEquiv);
  }

  if (btcBalance) {
    const btcFiatEquiv = satsToBtc(new BigNumber(btcBalance)).multipliedBy(
      new BigNumber(btcFiatRate),
    );
    totalBalance = totalBalance.plus(btcFiatEquiv);
  }

  if (ftCoinList) {
    totalBalance = ftCoinList.reduce((acc, coin) => {
      if (coin.visible && coin.tokenFiatRate && coin.decimals) {
        const tokenUnits = new BigNumber(10).exponentiatedBy(new BigNumber(coin.decimals));
        const coinFiatValue = new BigNumber(coin.balance)
          .dividedBy(tokenUnits)
          .multipliedBy(new BigNumber(coin.tokenFiatRate));
        return acc.plus(coinFiatValue);
      }

      return acc;
    }, totalBalance);
  }

  if (brcCoinsList) {
    totalBalance = brcCoinsList.reduce((acc, coin) => {
      if (coin.visible && coin.tokenFiatRate) {
        const coinFiatValue = new BigNumber(coin.balance).multipliedBy(
          new BigNumber(coin.tokenFiatRate),
        );
        return acc.plus(coinFiatValue);
      }

      return acc;
    }, totalBalance);
  }

  return totalBalance.toNumber().toFixed(2);
};
