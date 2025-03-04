import { Tab, TabList } from 'react-tabs';
import styled from 'styled-components';
import type { Color, Typography } from 'theme';

/**
 * Typography
 *
 * Usage:
 *   <StyledHeading typography="headling_l">My heading</StyledHeading>
 *   <StyledP typography="body_m" color="white_200">My paragraph text</StyledP>
 *
 * ref: https://zeroheight.com/0683c9fa7/p/789eec-typography
 */
type TypographyProps = { typography: Typography; color?: Color };

export const StyledP = styled.p<TypographyProps>`
  ${(props) => props.theme[props.typography]}
  color: ${(props) => (props.color ? props.theme.colors[props.color] : 'inherit')}
`;

export const StyledHeading = styled.h1<TypographyProps>`
  ${(props) => props.theme.typography[props.typography]}
  color: ${(props) => (props.color ? props.theme.colors[props.color] : 'inherit')}
`;

/**
 * Common Layouts
 *
 * ref: https://zeroheight.com/0683c9fa7/p/5270b4-button/b/004697
 */
export const VerticalStackButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(6)}px;
`;

export const HorizontalSplitButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.space.s};
`;

// two buttons side by side - sticky bottom
export const StickyHorizontalSplitButtonContainer = styled(HorizontalSplitButtonContainer)`
  position: sticky;
  bottom: 0;
  padding-bottom: ${(props) => props.theme.space.l};
  padding-top: ${(props) => props.theme.space.l};
  background-color: ${(props) => props.theme.colors.elevation0};
`;

// single button - sticky bottom
export const StickyButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  padding-bottom: ${(props) => props.theme.space.l};
  padding-top: ${(props) => props.theme.space.l};
  background-color: ${(props) => props.theme.colors.elevation0};
`;

/*
 * Tabulations (styled react-tabs)
 *
 * ref: https://zeroheight.com/0683c9fa7/p/99c19e-tabulations/b/647c03
 */
export const StyledTabList = styled(TabList)`
  display: flex;
  gap: ${(props) => props.theme.spacing(2)}px;
  list-style: none;
`;

export const StyledTab = styled(Tab)`
  ${(props) => props.theme.typography.body_bold_s}
  padding: ${(props) => props.theme.spacing(4)}px ${(props) => props.theme.spacing(6)}px;
  border-radius: ${(props) => props.theme.radius(2)}px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${(props) => props.theme.colors.white_0};
  background-color: ${(props) => props.theme.colors.elevation0};

  :hover {
    background-color: ${(props) => props.theme.colors.elevation1};
  }

  &.react-tabs__tab--selected {
    background-color: ${(props) => props.theme.colors.elevation3};
  }

  :active {
    background-color: ${(props) => props.theme.colors.elevation5};
  }
`;
