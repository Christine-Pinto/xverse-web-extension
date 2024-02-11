import { expect, test } from '../fixtures/base';
import { data } from '../fixtures/data';
import Onboarding from '../pages/onboarding';
import { StartPage } from '../pages/startPage';
import { Token } from '../pages/token';

//Main Issue with this testcase is that it depends currently on the successfull creation of a wallet (code for that was copied from onboarding.spec.ts)
// TODO add either a mock for a created wallet or put creating of a wallet into a pageObject
test.describe('Manage Tokens', () => {
  let onboarding: Onboarding;
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });
  test.afterEach(async ({ context }) => {
    await context.close();
  });
  test('Create wallet and manage tokens', async ({ context, landing, page, extensionId }) => {
    await test.step('open create wallet page in a new tab', async () => {
      await landing.buttonCreateWallet.click();
      expect(context.pages()).toHaveLength(2);
      const [, newPage] = context.pages();
      await newPage.waitForURL('**/onboarding');
      onboarding = new Onboarding(newPage);
    });
    await test.step('skip onboarding pages and accept legal', async () => {
      await onboarding.buttonSkip.click();
      await onboarding.buttonAccept.click();
    });
    await test.step('backup later', async () => {
      await onboarding.buttonBackupLater.click();
    });
    await test.step('create password', async () => {
      await onboarding.inputPassword.fill(data.walletPassword);
      await onboarding.buttonContinue.click();
      await onboarding.inputPassword.fill(data.walletPassword);
      await onboarding.buttonContinue.click();
    });
    await test.step('verify wallet is created successfully', async () => {
      await onboarding.page.getByText(data.walletCreatedTitle, { exact: true }).waitFor();
      await onboarding.page.getByText(data.walletCreatedSubtitle, { exact: true }).waitFor();
      await expect(onboarding.instruction).toBeVisible();
      await onboarding.buttonCloseTab.click();
      expect(context.pages()).toHaveLength(1);
    });
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    let startPage = new StartPage(page);
    // Variable to check the changed balance after enable and disable a token
    let balanceFloat = await startPage.getBalancefloat();
    let balanceTokensFloat = await startPage.getBalancefloat_fromAllTokens();
    await startPage.checkVisuals();
    await test.step('manage Tokens', async () => {
      await startPage.manageTokenButton.click();
      let token = new Token(page);
      await token.checkVisuals(0, 13);

      await test.step('enable a random Tokens', async () => {
        // TODO add a  check if unselected tokens are avaible to enable a token better
        const enabled_token_name = await token.enableARandomToken();
        await token.backButton.click();
        await startPage.checkVisuals();
        await expect(startPage.allTokensNames.getByText(enabled_token_name)).toBeVisible();

        const newBalanceTokensFloat = await startPage.getBalancefloat_fromAllTokens();
        const newBalanceFloat = await startPage.getBalancefloat();
        await expect(newBalanceFloat).toEqual(newBalanceTokensFloat);
        const differenceInBalance = balanceTokensFloat + newBalanceTokensFloat;
        await expect(newBalanceFloat).toEqual(balanceFloat + differenceInBalance);
      });

      await test.step('disable a random Tokens', async () => {
        // when switching from startpage to manage token the app had sometimes the problem with the status change and didn't show the enabled button, with adding this addiotnoial visual check the test got more stable be adding one more check
        // TODO figure out why app doesn't show enabled token in the fast switch --> potential bug !!!!
        // TODO change the check as the number only works if that was the frist token to be added
        await expect(startPage.allTokensNames).toHaveCount(3);
        await startPage.manageTokenButton.click();
        await token.checkVisuals(1, 12);

        const disabled_token_name = await token.disableARandomToken();
        await token.backButton.click();
        await expect(startPage.balance).toBeVisible();
        await expect(startPage.allTokensNames.getByText(disabled_token_name)).toBeHidden();

        // Check if the new Balance is correct and compare with the original values
        const newBalanceTokensFloat = await startPage.getBalancefloat_fromAllTokens();
        const newBalanceFloat = await startPage.getBalancefloat();

        await expect(newBalanceFloat).toEqual(newBalanceTokensFloat);
        const differenceInBalance = balanceTokensFloat - newBalanceTokensFloat;
        await expect(newBalanceFloat).toEqual(balanceFloat - differenceInBalance);
      });
    });
  });
});
