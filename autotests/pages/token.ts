import { expect, type Locator, type Page } from '@playwright/test';

export class Token {
  readonly allTokenImg: Locator;
  readonly allUnselectedToken: Locator;
  readonly allSelectedToken: Locator;
  readonly backButton: Locator;

  constructor(readonly page: Page) {
    this.allTokenImg = page.locator('div > div.TokenContainer-sc-19ldcpb > div img');
    this.allUnselectedToken = page.locator('h1.UnSelectedCoinTitleText-sc-1kql8uo');
    this.allSelectedToken = page.locator('h1.SelectedCoinTitleText-sc-hkryj5');
    this.backButton = page.locator('img[alt="back button"]');
  }

  async checkVisuals(selected: number, unselected: number) {
    await expect(this.page.url()).toContain('manage-tokens');

    //check if all token provider are displayed
    // TODO check if that number of token provider is fixed or instable and might need to change this check
    await expect(this.allTokenImg).toHaveCount(13);
    await expect(this.allUnselectedToken).toHaveCount(unselected);
    await expect(this.allSelectedToken).toHaveCount(selected);
  }

  async enableARandomToken(): Promise<string> {
    // Same number of unselected_tokens as switch toggle to them
    const switch_toggle = this.page.locator(
      'div.RowContainer-sc-nvec8f:has(h1.UnSelectedCoinTitleText-sc-1kql8uo) div.react-switch-handle',
    );
    const number_of_unselected_tokens = await this.allUnselectedToken.count();

    // Generate a random number within the range of available select elements
    const chosen_number = Math.floor(Math.random() * number_of_unselected_tokens) + 1;

    // Access the nth select element (note the adjustment for zero-based indexing)
    const adjust_chosen_number = chosen_number - 1;
    const chosen_switch_toggle = switch_toggle.nth(adjust_chosen_number);
    const chosen_unselected_token = this.allUnselectedToken.nth(adjust_chosen_number);
    const enabled_token_name = (await chosen_unselected_token.innerText()).toString();
    // Example action on the chosen select element
    // This could be clicking it, selecting an option, etc., depending on your needs
    await chosen_switch_toggle.click();
    await expect(this.allSelectedToken.getByText(enabled_token_name)).toBeVisible();
    return enabled_token_name;
  }

  async disableARandomToken(): Promise<string> {
    // Same number of unselected_tokens as switch toggle to them
    const switch_toggle = this.page.locator(
      'div.RowContainer-sc-nvec8f:has(h1.SelectedCoinTitleText-sc-hkryj5) div.react-switch-handle',
    );
    const number_of_selected_tokens = await this.allSelectedToken.count();

    // Generate a random number within the range of available select elements
    const chosen_number = Math.floor(Math.random() * number_of_selected_tokens) + 1;

    // Access the nth select element (note the adjustment for zero-based indexing)
    const adjust_chosen_number = chosen_number - 1;
    const chosen_switch_toggle = switch_toggle.nth(adjust_chosen_number);
    const chosen_selected_token = this.allSelectedToken.nth(adjust_chosen_number);
    const disabled_token_name = (await chosen_selected_token.innerText()).toString();
    // Example action on the chosen select element
    // This could be clicking it, selecting an option, etc., depending on your needs
    await chosen_switch_toggle.click();
    await expect(this.allUnselectedToken.getByText(disabled_token_name)).toBeVisible();
    return disabled_token_name;
  }
}
