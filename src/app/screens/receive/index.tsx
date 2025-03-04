import Copy from '@assets/img/dashboard/copy_black_icon.svg';
import Tick from '@assets/img/dashboard/tick.svg';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import ShowBtcReceiveAlert from '@components/showBtcReceiveAlert';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import UpdatedReceive from './updatedReceiveScreen';

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TopTitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  textAlign: 'center',
}));

const ReceiveScreenText = styled.h1((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  marginTop: props.theme.spacing(3),
  color: props.theme.colors.white_200,
}));

const BnsNameText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
  marginBottom: 2,
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 16,
  flex: 1,
});

const AddressContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(24),
  marginRight: props.theme.spacing(24),
}));

const CopyContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 328,
  justifyContent: 'center',
  marginTop: props.theme.spacing(11),
}));

const QRCodeContainer = styled.div((props) => ({
  display: 'flex',
  aspectRatio: 1,
  backgroundColor: props.theme.colors.white_0,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginTop: props.theme.spacing(15),
  marginBottom: props.theme.spacing(12),
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  color: props.theme.colors.white_200,
  wordBreak: 'break-all',
}));

const BottomBarContainer = styled.div({
  marginTop: 22,
});

const InfoAlertContainer = styled.div({
  width: '100%',
});

function Receive(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RECEIVE' });
  const [addressCopied, setAddressCopied] = useState(false);
  const [isBtcReceiveAlertVisible, setIsBtcReceiveAlertVisible] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const navigate = useNavigate();
  const {
    stxAddress,
    btcAddress,
    ordinalsAddress,
    selectedAccount,
    showBtcReceiveAlert,
    showOrdinalReceiveAlert,
  } = useWalletSelector();

  const { currency } = useParams();

  const getAddress = () => {
    switch (currency) {
      case 'STX':
        return stxAddress;
      case 'BTC':
        return btcAddress;
      case 'FT':
        return stxAddress;
      case 'ORD':
        return ordinalsAddress;
      default:
        return '';
    }
  };
  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const renderHeading = () => {
    if (currency === 'BTC') {
      return <TopTitleText>{t('BTC_ADDRESS')}</TopTitleText>;
    }
    if (currency === 'ORD') {
      return <TopTitleText>{t('ORDINAL_ADDRESS')}</TopTitleText>;
    }
    return <TopTitleText>{t('STX_ADDRESS')}</TopTitleText>;
  };

  const onReceiveAlertClose = () => {
    setIsBtcReceiveAlertVisible(false);
  };

  const onOrdinalReceiveAlertClose = () => {
    setIsOrdinalReceiveAlertVisible(false);
  };

  const handleOnClick = () => {
    navigator.clipboard.writeText(getAddress());
    setAddressCopied(true);
    if (currency === 'BTC' && showBtcReceiveAlert) {
      setIsBtcReceiveAlertVisible(true);
    }
    if (currency === 'ORD' && showOrdinalReceiveAlert) {
      setIsOrdinalReceiveAlertVisible(true);
    }
  };

  // TODO: Shift UpdatedReceive logic in this file and handle STX & BTC UI
  return currency === 'ORD' ? (
    <UpdatedReceive />
  ) : (
    <>
      <TopRow title={t('RECEIVE')} onClick={handleBackButtonClick} />
      <OuterContainer>
        <Container>
          {renderHeading()}
          {currency !== 'BTC' && currency !== 'ORD' && (
            <ReceiveScreenText>{t('STX_ADDRESS_DESC')}</ReceiveScreenText>
          )}
          <QRCodeContainer>
            <QRCode value={getAddress()} size={150} />
          </QRCodeContainer>

          {currency !== 'BTC' && currency !== 'ORD' && !!selectedAccount?.bnsName && (
            <BnsNameText>{selectedAccount?.bnsName}</BnsNameText>
          )}
          <AddressContainer>
            <AddressText>{getAddress()}</AddressText>
          </AddressContainer>
        </Container>
        <CopyContainer>
          {currency === 'ORD' && (
            <InfoAlertContainer>
              <InfoContainer bodyText={t('ORDINALS_RECEIVE_MESSAGE')} />
            </InfoAlertContainer>
          )}
          {currency === 'BTC' && (
            <InfoAlertContainer>
              <InfoContainer bodyText={t('BTC_RECEIVE_MESSAGE')} />
            </InfoAlertContainer>
          )}
          {addressCopied ? (
            <ActionButton
              src={Tick}
              text={t('COPIED_ADDRESS')}
              onPress={handleOnClick}
              transparent
            />
          ) : (
            <ActionButton src={Copy} text={t('COPY_ADDRESS')} onPress={handleOnClick} />
          )}
        </CopyContainer>
      </OuterContainer>
      <BottomBarContainer>
        <BottomTabBar tab="dashboard" />
      </BottomBarContainer>
      {isBtcReceiveAlertVisible && (
        <ShowBtcReceiveAlert onReceiveAlertClose={onReceiveAlertClose} />
      )}
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}
    </>
  );
}

export default Receive;
