import ActionButton from '@components/button';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  ErrorCodes,
  getBtcFiatEquivalent,
  isOrdinalOwnedByAccount,
  ResponseError,
  SignedBtcTx,
  signOrdinalSendTransaction,
  UTXO,
  validateBtcAddress,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import Callout from '@ui-library/callout';
import { StickyButtonContainer, StyledHeading } from '@ui-library/common.styled';
import { InputFeedback, InputFeedbackProps, isDangerFeedback } from '@ui-library/inputFeedback';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`;

const StyledSendTo = styled(StyledHeading)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const InputGroup = styled.div`
  margin-top: ${(props) => props.theme.spacing(8)}px;
`;

const Label = styled.label((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flex: 1,
}));

const AmountInputContainer = styled.div<{ error: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? `1px solid ${props.theme.colors.danger_dark_200}`
    : `1px solid ${props.theme.colors.white_800}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.typography.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  width: '100%',
  border: 'transparent',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(12),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const StyledCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.spacing(14)}px;
`;

function SendOrdinal() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { selectedOrdinal } = useNftDataSelector();
  const btcClient = useBtcClient();
  const location = useLocation();
  const { network, ordinalsAddress, btcAddress, selectedAccount, btcFiatRate } =
    useWalletSelector();
  const { getSeed } = useSeedVault();
  const [ordinalUtxo, setOrdinalUtxo] = useState<UTXO | undefined>(undefined);
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress ?? '');
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);

  useResetUserFlow('/send-ordinal');

  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<SignedBtcTx | undefined, ResponseError, string>({
    mutationFn: async (recipient) => {
      const seedPhrase = await getSeed();
      const addressUtxos = await btcClient.getUnspentUtxos(ordinalsAddress);
      const ordUtxo = addressUtxos.find(
        (utxo) => `${utxo.txid}:${utxo.vout}` === selectedOrdinal?.output,
      );
      setOrdinalUtxo(ordUtxo);
      if (ordUtxo) {
        const signedTx = await signOrdinalSendTransaction(
          recipient,
          ordUtxo,
          btcAddress,
          Number(selectedAccount?.id),
          seedPhrase,
          btcClient,
          network.type,
          [ordUtxo],
        );
        return signedTx;
      }
    },
  });

  useEffect(() => {
    if (txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setRecipientError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE') });
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setRecipientError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE_FEES') });
      } else {
        setRecipientError({ variant: 'danger', message: txError.toString() });
      }
    }
  }, [txError, t]);

  useEffect(() => {
    if (data) {
      navigate(`/nft-dashboard/confirm-ordinal-tx/${selectedOrdinal?.id}`, {
        state: {
          signedTxHex: data.signedTx,
          recipientAddress,
          fee: data.fee,
          feePerVByte: data.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data.fee, BigNumber(btcFiatRate)),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, BigNumber(btcFiatRate)),
          ordinalUtxo,
        },
      });
    }
  }, [data]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const activeAccountOwnsOrdinal =
    selectedOrdinal && selectedAccount && isOrdinalOwnedByAccount(selectedOrdinal, selectedAccount);

  const validateRecipientAddress = (address: string): boolean => {
    if (!activeAccountOwnsOrdinal) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ORDINAL_NOT_OWNED') });
      return false;
    }
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

  const onPressNext = async () => {
    if (validateRecipientAddress(recipientAddress)) {
      mutate(recipientAddress);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateRecipientAddress(e.target.value);
    setRecipientAddress(e.target.value);
  };

  const isNextEnabled = !isDangerFeedback(recipientError) && !!recipientAddress;

  // hide back button if there is no history
  const hideBackButton = location.key === 'default';

  return (
    <SendLayout
      selectedBottomTab="nft"
      onClickBack={handleBackButtonClick}
      hideBackButton={hideBackButton}
    >
      <Container>
        <div>
          <StyledSendTo typography="headline_xs" color="white_0">
            {t('SEND_TO')}
          </StyledSendTo>
          <InputGroup>
            <RowContainer>
              <Label>{t('RECIPIENT')}</Label>
            </RowContainer>
            <AmountInputContainer error={isDangerFeedback(recipientError)}>
              <InputFieldContainer>
                <InputField
                  value={recipientAddress}
                  placeholder={t('ORDINAL_RECIPIENT_PLACEHOLDER')}
                  onChange={handleAddressChange}
                />
              </InputFieldContainer>
            </AmountInputContainer>
            <ErrorContainer>
              {recipientError && <InputFeedback {...recipientError} />}
            </ErrorContainer>
          </InputGroup>
          <StyledCallout bodyText={t('MAKE_SURE_THE_RECIPIENT')} />
        </div>
        <StickyButtonContainer>
          <ActionButton
            text={t('NEXT')}
            disabled={!isNextEnabled}
            processing={isLoading}
            onPress={onPressNext}
          />
        </StickyButtonContainer>
      </Container>
    </SendLayout>
  );
}

export default SendOrdinal;
