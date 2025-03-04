import useBtcClient from '@hooks/useBtcClient';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Brc20HistoryTransactionData, BtcTransactionData } from '@secretkeylabs/xverse-core';
import { fetchBtcTransactionsData, getBrc20History } from '@secretkeylabs/xverse-core';
import {
  AddressTransactionWithTransfers,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { useQuery } from '@tanstack/react-query';
import { CurrencyTypes, PAGINATION_LIMIT } from '@utils/constants';
import { getStxAddressTransactions } from '@utils/transactions/transactions';
import useNetworkSelector from '../useNetwork';

export default function useTransactions(coinType: CurrencyTypes, brc20Token: string | null) {
  const { network, stxAddress, btcAddress, ordinalsAddress, hasActivatedOrdinalsKey } =
    useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const btcClient = useBtcClient();

  const fetchTransactions = async (): Promise<
    | BtcTransactionData[]
    | (AddressTransactionWithTransfers | MempoolTransaction)[]
    | Brc20HistoryTransactionData[]
  > => {
    if (coinType === 'STX' || coinType === 'FT' || coinType === 'NFT') {
      return getStxAddressTransactions(stxAddress, selectedNetwork, 0, PAGINATION_LIMIT);
    }
    if (coinType === 'BTC') {
      const btcData = await fetchBtcTransactionsData(
        btcAddress,
        ordinalsAddress,
        btcClient,
        hasActivatedOrdinalsKey as boolean,
      );
      return btcData;
    }
    if (coinType === 'brc20' && brc20Token) {
      const brc20Data = await getBrc20History(network.type, ordinalsAddress, brc20Token);
      return brc20Data;
    }
    return [];
  };

  return useQuery({
    queryKey: [`transactions-${coinType}-${brc20Token}`],
    queryFn: fetchTransactions,
    refetchInterval: 10000,
  });
}
