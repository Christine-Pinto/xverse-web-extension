import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TopRow from '@components/topRow';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Copy from '@assets/img/dashboard/Copy.svg';
import Tick from '@assets/img/dashboard/tick.svg';
import { useState } from 'react';
import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import BottomTabBar from '@components/tabBar';

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
  marginBottom: props.theme.spacing(4),
}));

const ReceiveScreenText = styled.h1((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
}));

const BnsNameText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 16,
  flex: 1,
});

const InfoContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(8),
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
  backgroundColor: props.theme.colors.white['0'],
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
  color: props.theme.colors.white['200'],
  wordBreak: 'break-all',
}));

const BottomBarContainer = styled.div({
  marginTop: 32,
});

function Receive(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RECEIVE' });
  const [addressCopied, setAddressCopied] = useState(false);
  const navigate = useNavigate();
  const { stxAddress, btcAddress, selectedAccount, dlcBtcAddress } = useWalletSelector();

  const { currency } = useParams();

  const getAddress = () => {
    switch (currency) {
      case 'STX':
        return stxAddress;
      case 'BTC':
        return btcAddress;
      case 'FT':
        return stxAddress;
      case 'BTC-DLC':
        return dlcBtcAddress;
      default:
        return '';
    }
  };
  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const renderHeading = () => {
    switch (currency) {
      case 'BTC':
        return <TopTitleText>{t('BTC_ADDRESS')}</TopTitleText>;
      case 'STX':
      case 'FT':
        return <TopTitleText>{t('STX_ADDRESS')}</TopTitleText>;
      case 'BTC-DLC':
        return <TopTitleText>{'DLC BTC ADDRESS'}</TopTitleText>;
    }
  };

  const handleOnClick = () => {
    navigator.clipboard.writeText(getAddress());
    setAddressCopied(true);
  };
  return (
    <>
      <TopRow title={t('RECEIVE')} onClick={handleBackButtonClick} />
      <OuterContainer>
        <Container>
          {renderHeading()}
          {currency !== 'BTC' && currency !== 'BTC-DLC' && (
            <ReceiveScreenText>{t('STX_ADDRESS_DESC')}</ReceiveScreenText>
          )}
          <QRCodeContainer>
            <QRCode value={getAddress()} size={150} />
          </QRCodeContainer>

          {currency !== 'BTC' && currency !== 'BTC-DLC' && !!selectedAccount?.bnsName && (
            <BnsNameText>{selectedAccount?.bnsName}</BnsNameText>
          )}
          <InfoContainer>
            <AddressText>{getAddress()}</AddressText>
          </InfoContainer>
        </Container>
        {addressCopied ? (
          <CopyContainer>
            <ActionButton
              src={Tick}
              text={t('COPIED_ADDRESS')}
              onPress={handleOnClick}
              transparent
            />
          </CopyContainer>
        ) : (
          <CopyContainer>
            <ActionButton src={Copy} text={t('COPY_ADDRESS')} onPress={handleOnClick} />
          </CopyContainer>
        )}
      </OuterContainer>
      <BottomBarContainer>
        <BottomTabBar tab="dashboard" />
      </BottomBarContainer>
    </>
  );
}

export default Receive;
