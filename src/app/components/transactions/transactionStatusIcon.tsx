import ContractIcon from '@assets/img/transactions/contract.svg';
import FailedIcon from '@assets/img/transactions/failed.svg';
import OrdinalsIcon from '@assets/img/transactions/ordinal.svg';
import PendingIcon from '@assets/img/transactions/pending.svg';
import ReceiveIcon from '@assets/img/transactions/received.svg';
import SendIcon from '@assets/img/transactions/sent.svg';
import {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';

interface TransactionStatusIconPros {
  transaction: StxTransactionData | BtcTransactionData | Brc20HistoryTransactionData;
  currency: CurrencyTypes;
}

function TransactionStatusIcon(props: TransactionStatusIconPros) {
  const { currency, transaction } = props;
  if (currency === 'STX' || currency === 'FT') {
    const tx = transaction as StxTransactionData;
    if (tx.txStatus === 'abort_by_response' || tx.txStatus === 'abort_by_post_condition') {
      return <img src={FailedIcon} alt="pending" />;
    }
    if (tx.txType === 'token_transfer' || tx.tokenType === 'fungible') {
      if (tx.txStatus === 'pending') {
        return <img src={PendingIcon} alt="pending" />;
      }
      if (tx.incoming) {
        return <img src={ReceiveIcon} alt="received" />;
      }
      return <img src={SendIcon} alt="sent" />;
    }
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    return <img src={ContractIcon} alt="contract-call" />;
  }
  if (currency === 'BTC') {
    const tx = transaction as BtcTransactionData;
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    if (tx.isOrdinal) {
      return <img src={OrdinalsIcon} alt="ordinals-transfer" />;
    }
    if (tx.incoming) {
      return <img src={ReceiveIcon} alt="received" />;
    }
    return <img src={SendIcon} alt="sent" />;
  }
  if (currency === 'brc20') {
    const tx = transaction as Brc20HistoryTransactionData;
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    if (tx.incoming) {
      return <img src={ReceiveIcon} alt="received" />;
    }
    if (tx.operation === 'transfer_send' && !tx.incoming) {
      return <img src={SendIcon} alt="sent" />;
    }
    return <img src={ContractIcon} alt="inscribe-transaction" />;
  }
  return <img src={ContractIcon} alt="contract" />;
}
export default TransactionStatusIcon;
