import { expect, type Locator, type Page } from '@playwright/test';

export class StartPage {
  //readonly page: Page;
  readonly balance: Locator;
  readonly tokens: Locator;
  readonly allupperButtons: Locator;
  readonly manageTokenButton: Locator;
  readonly allTokensNames: Locator;

  constructor(readonly page: Page) {
    // this.page = page;
    //expect(page.url()).toContain("options.html");
    this.balance = page.locator('div.BalanceContainer-sc-1ks78fh > p');
    this.tokens = page.locator('h1.CoinBalanceText-sc-wr88cs');
    this.allupperButtons = page.locator('div.RowButtonContainer-sc-1cgcddu > div');
    this.manageTokenButton = page.locator(
      'button, input[type="button"] >> text="Manage token list"',
    );
    this.allTokensNames = page.locator('h1.SubText-sc-18704il');
  }

  async checkVisuals() {
    //Check if specific visual elements are loaded
    // TODO : create more stable selectors (eg. ids or data-attributes)
    await expect(this.balance).toBeVisible();
    await expect(this.manageTokenButton).toBeVisible();
    // Check if all 4 buttons (send, receive, swap, buy) are visible
    // TODO : create more stable selector for all 4 buttons to be able to check all 4 individually
    await expect(this.allupperButtons).toHaveCount(4);
  }

  async getBalancefloat(): Promise<number> {
    const Balance = await this.balance.textContent();
    if (Balance !== null) {
      const cleaned_balance = Balance.replace(/[^\d.-]/g, '');
      const balanceFloat = parseFloat(cleaned_balance);
      return balanceFloat;
    } else {
      // Handle the case where Balance is null
      console.error('Failed to retrieve balance text content');
      return 0;
    }
  }

  async getBalancefloat_fromAllTokens(): Promise<number> {
    const count = await this.tokens.count();
    // Initialize a variable to hold the sum of all amounts
    let totalSum = 0;
    // Iterate through all found elements
    for (let i = 0; i < count; i++) {
      // Get the amount from the text
      const balanceToken = await this.tokens.nth(i).textContent();
      if (balanceToken !== null) {
        // Use a regular expression to remove non-numeric characters except the decimal point as the format is "$ 0.00 USD"
        const cleanedText = balanceToken.replace(/[^\d.-]/g, '');
        const amountFloat = parseFloat(cleanedText);

        // Check if the parsed value is a valid number before adding to the total sum
        if (!isNaN(amountFloat)) {
          totalSum += amountFloat;
        }
      } else {
        // Handle the case where Balance is null
        console.error('Failed to retrieve balance text content');
      }
    }
    return totalSum;
  }
}
