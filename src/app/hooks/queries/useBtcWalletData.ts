import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getBtcWalletData } from '@secretkeylabs/xverse-core/api/btc';
import { BtcAddressData } from '@secretkeylabs/xverse-core/types';
import { SetBtcWalletDataAction } from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '../useWalletSelector';

export const useBtcWalletData = () => {
  const dispatch = useDispatch();
  const { btcAddress, network } = useWalletSelector();

  const fetchBtcWalletData = async () => {
    try {
      const btcData: BtcAddressData = await getBtcWalletData(btcAddress, network.type);
      console.log("🚀 ~ file: useBtcWalletData.ts:16 ~ fetchBtcWalletData ~ btcData:", btcData)
      
      const btcBalance = new BigNumber(btcData.finalBalance);
      dispatch(SetBtcWalletDataAction(btcBalance));
      return btcData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return useQuery({
    queryKey: [`wallet-data-${btcAddress}`],
    queryFn: fetchBtcWalletData,
    refetchOnMount: false,
  });
};

export default useBtcWalletData;
