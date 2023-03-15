import ActionButton from '@components/button';
import useSignPsbtTx from '@hooks/useSignPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import { parsePsbt } from '@secretkeylabs/xverse-core/transactions/psbt';
import { useTranslation } from 'react-i18next';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import styled from 'styled-components';
import { getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import InputOutputComponent from '@components/confirmBtcTransactionComponent/inputOutputComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import AccountHeaderComponent from '@components/accountHeader';
import BtcRecipientComponent from '@components/confirmBtcTransactionComponent/btcRecipientComponent';
import { useNavigate } from 'react-router-dom';

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  textAlign: 'left',
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginTop: 8,
  textAlign: 'left',
  marginBottom: props.theme.spacing(16),
}));

function SignPsbtRequest() {
  const {
    btcAddress, ordinalsAddress, selectedAccount, network, btcFiatRate,
  } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const { payload, confirmSignPsbt, cancelSignPsbt, getSigningAddresses } = useSignPsbtTx();
  const [isSigning, setIsSigning] = useState(false);

  const parsedPsbt = useMemo(() => parsePsbt(
    selectedAccount!,
    payload.inputsToSign,
    payload.psbtBase64,
  ), [selectedAccount, payload.psbtBase64]);

  const signingAddresses = useMemo(
    () => getSigningAddresses(payload.inputsToSign),
    [payload.inputsToSign],
  );

  const checkIfMismatch = () => {
    if (payload.network !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
    }
    if (payload.inputsToSign) {
      payload.inputsToSign.forEach((input) => {
        if (input.address !== btcAddress && input.address !== ordinalsAddress) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error: t('ADDRESS_MISMATCH'),
              browserTx: true,
            },
          });
        }
      });
    }
  };

  useEffect(() => {
    checkIfMismatch();
  }, []);

  const onSignPsbtConfirmed = async () => {
    try {
      setIsSigning(true);
      const response = await confirmSignPsbt();
      setIsSigning(false);
      if (payload.broadcast) {
        navigate('/tx-status', {
          state: {
            txid: response.txId,
            currency: 'BTC',
            error: '',
            browserTx: true,
          },
        });
      } else {
        window.close();
      }
    } catch (err) {
      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            error: err.message,
            browserTx: true,
          },
        });
      }
    }
  };

  const onCancelClick = async () => {
    cancelSignPsbt();
    window.close();
  };

  const expandInputOutputSection = () => {
    setExpandInputOutputView(!expandInputOutputView);
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch disableCopy />
      <OuterContainer>
        <Container>
          <ReviewTransactionText>{t('REVIEW_TRNSACTION')}</ReviewTransactionText>
          {payload.appDetails.name ? <DappTitle>{`Requested by ${payload.appDetails?.name}`}</DappTitle> : null}
          <BtcRecipientComponent
            value={`${satsToBtc(new BigNumber(parsedPsbt?.netAmount))
              .toString()
              .replace('-', '')} BTC`}
            subValue={getBtcFiatEquivalent(new BigNumber(parsedPsbt.netAmount), btcFiatRate)}
            icon={IconBitcoin}
            title={t('AMOUNT')}
            heading="You will transfer "
          />
          <InputOutputComponent
            parsedPsbt={parsedPsbt}
            isExpanded={expandInputOutputView}
            address={signingAddresses}
            onArrowClick={expandInputOutputSection}
          />

          <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
          <TransactionDetailComponent
            title={t('FEES')}
            value={`${parsedPsbt?.fees.toString()} ${t('SATS')}`}
            subValue={getBtcFiatEquivalent(new BigNumber(parsedPsbt?.fees), btcFiatRate)}
          />
        </Container>
      </OuterContainer>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton text={t('CANCEL')} transparent onPress={onCancelClick} />
        </TransparentButtonContainer>
        <ActionButton text={t('CONFIRM')} onPress={onSignPsbtConfirmed} processing={isSigning} />
      </ButtonContainer>
    </>
  );
}

export default SignPsbtRequest;
