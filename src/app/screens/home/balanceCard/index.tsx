import BarLoader from '@components/barLoader';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import useWalletSelector from '@hooks/useWalletSelector';
import { currencySymbolMap, microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core';
import { LoaderSize } from '@utils/constants';
import { calculateTotalBalance } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(11),
}));

const BalanceHeadingText = styled.h3((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_200,
  textTransform: 'uppercase',
  opacity: 0.7,
}));

const CurrencyText = styled.label((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_0,
  fontSize: 13,
}));

const BalanceAmountText = styled.p((props) => ({
  ...props.theme.headline_xl,
  color: props.theme.colors.white_0,
}));

const BarLoaderContainer = styled.div((props) => ({
  display: 'flex',
  maxWidth: 300,
  marginTop: props.theme.spacing(5),
}));

const CurrencyCard = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: props.theme.colors.elevation3,
  width: 45,
  borderRadius: 30,
  marginLeft: props.theme.spacing(4),
}));

const BalanceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  gap: props.theme.spacing(5),
}));

const ReloadContainer = styled.div({
  marginBottom: 11,
});

interface BalanceCardProps {
  isLoading: boolean;
  isRefetching: boolean;
}

function BalanceCard(props: BalanceCardProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const {
    fiatCurrency,
    btcFiatRate,
    stxBtcRate,
    stxBalance,
    btcBalance,
    btcAddress,
    hideStx,
    coinsList,
    selectedAccount,
    accountBalances,
    brcCoinsList,
  } = useWalletSelector();
  const { setAccountBalance } = useAccountBalance();
  const { isLoading, isRefetching } = props;
  const oldTotalBalance = accountBalances[btcAddress];

  const balance = calculateTotalBalance({
    stxBalance,
    btcBalance,
    ftCoinList: coinsList,
    brcCoinsList,
    btcFiatRate,
    stxBtcRate,
    hideStx,
  });

  useEffect(() => {
    if (!balance || !selectedAccount || isLoading || isRefetching) {
      return;
    }

    if (oldTotalBalance !== balance) {
      setAccountBalance(selectedAccount, balance);
    }
  }, [balance, oldTotalBalance, selectedAccount, isLoading, isRefetching]);

  return (
    <>
      <RowContainer>
        <BalanceHeadingText>{t('TOTAL_BALANCE')}</BalanceHeadingText>
        <CurrencyCard>
          <CurrencyText>{fiatCurrency}</CurrencyText>
        </CurrencyCard>
      </RowContainer>
      {isLoading ? (
        <BarLoaderContainer>
          <BarLoader loaderSize={LoaderSize.LARGE} />
        </BarLoaderContainer>
      ) : (
        <BalanceContainer>
          <NumericFormat
            value={balance}
            displayType="text"
            prefix={`${currencySymbolMap[fiatCurrency]}`}
            thousandSeparator
            renderText={(value: string) => <BalanceAmountText>{value}</BalanceAmountText>}
          />
          {isRefetching && (
            <ReloadContainer>
              <MoonLoader color="white" size={16} />
            </ReloadContainer>
          )}
        </BalanceContainer>
      )}
    </>
  );
}

export default BalanceCard;
