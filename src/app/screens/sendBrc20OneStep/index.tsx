import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useBtcClient from '@hooks/useBtcClient';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BRC20ErrorCode,
  brc20TransferEstimateFees,
  CoreError,
  getNonOrdinalUtxo,
  UTXO,
  validateBtcAddress,
} from '@secretkeylabs/xverse-core';
import { InputFeedbackProps, isDangerFeedback } from '@ui-library/inputFeedback';
import {
  Brc20TransferEstimateFeesParams,
  ConfirmBrc20TransferState,
  SendBrc20TransferState,
} from '@utils/brc20';
import { replaceCommaByDot } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Brc20TransferForm from './brc20TransferForm';

function SendBrc20Screen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  const navigate = useNavigate();
  const location = useLocation();
  const { btcAddress, ordinalsAddress, network, brcCoinsList } = useWalletSelector();
  const { data: feeRate } = useBtcFeeRate();
  const [amountError, setAmountError] = useState<InputFeedbackProps | null>(null);
  const [amountToSend, setAmountToSend] = useState('');
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const btcClient = useBtcClient();

  useResetUserFlow('/send-brc20');

  const isNextEnabled =
    !isDangerFeedback(amountError) &&
    !isDangerFeedback(recipientError) &&
    !!recipientAddress &&
    amountToSend !== '';

  const { fungibleToken: ft }: SendBrc20TransferState = location.state || {};
  const coinName = location.search ? location.search.split('coinName=')[1] : undefined;
  const fungibleToken = ft || brcCoinsList?.find((coin) => coin.name === coinName);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const validateAmount = (amountInput: string): boolean => {
    const amount = Number(replaceCommaByDot(amountInput));
    const balance = Number(fungibleToken.balance);
    if (!Number.isFinite(amount) || amount === 0) {
      setAmountError({ variant: 'danger', message: t('ERRORS.AMOUNT_REQUIRED') });
      return false;
    }
    if (!Number.isFinite(balance) || amount > Number(balance)) {
      setAmountError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE') });
      return false;
    }
    setAmountError(null);
    return true;
  };

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const resultRegex = /^\d*\.?\d*$/;
    if (resultRegex.test(newValue)) {
      validateAmount(newValue);
      setAmountToSend(newValue);
    }
  };

  const validateRecipientAddress = (address: string): boolean => {
    if (!address) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_REQUIRED') });
      return false;
    }
    if (
      !validateBtcAddress({
        btcAddress: address,
        network: network.type,
      })
    ) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_INVALID') });
      return false;
    }
    if (address === ordinalsAddress || address === btcAddress) {
      setRecipientError({ variant: 'info', message: t('YOU_ARE_TRANSFERRING_TO_YOURSELF') });
      return true;
    }
    setRecipientError(null);
    return true;
  };

  const onAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateRecipientAddress(e.target.value);
    setRecipientAddress(e.target.value);
  };

  const handleOnPressNext = async () => {
    try {
      if (
        !validateAmount(amountToSend) ||
        !validateRecipientAddress(recipientAddress) ||
        !feeRate
      ) {
        return;
      }
      setProcessing(true);

      // TODO get this from store or cache?
      const addressUtxos: UTXO[] = await getNonOrdinalUtxo(btcAddress, btcClient, network.type);
      const ticker = getFtTicker(fungibleToken);
      const numberAmount = Number(replaceCommaByDot(amountToSend));
      const estimateFeesParams: Brc20TransferEstimateFeesParams = {
        addressUtxos,
        tick: ticker,
        amount: numberAmount,
        revealAddress: ordinalsAddress,
        feeRate: feeRate?.regular,
        network: network.type,
      };
      const estimatedFees = await brc20TransferEstimateFees(estimateFeesParams);
      const state: ConfirmBrc20TransferState = {
        recipientAddress,
        estimateFeesParams,
        estimatedFees,
        token: fungibleToken,
      };
      navigate('/confirm-brc20-tx', { state });
    } catch (err) {
      const e = err as Error;
      if (
        CoreError.isCoreError(e) &&
        (e.code ?? '') in BRC20ErrorCode &&
        e.code === BRC20ErrorCode.INSUFFICIENT_FUNDS
      ) {
        setAmountError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE_FEES') });
      } else {
        setAmountError({ variant: 'danger', message: t('ERRORS.SERVER_ERROR') });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <Brc20TransferForm
        amountToSend={amountToSend}
        onAmountChange={onInputChange}
        amountError={amountError}
        token={fungibleToken}
        recipientAddress={recipientAddress}
        recipientError={recipientError}
        onAddressChange={onAddressInputChange}
        onPressNext={handleOnPressNext}
        processing={processing}
        isNextEnabled={isNextEnabled}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBrc20Screen;
