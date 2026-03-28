import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { AppText } from './AppText';

describe('AppText', () => {
  it('renders children', () => {
    render(<AppText>Hello</AppText>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
