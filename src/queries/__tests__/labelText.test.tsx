import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { render } from '../..';

const BUTTON_LABEL = 'cool button';
const BUTTON_HINT = 'click this button';
const TEXT_LABEL = 'cool text';
const TEXT_HINT = 'static text';
// Little hack to make all the methods happy with type
const NO_MATCHES_TEXT: any = 'not-existent-element';

const getMultipleInstancesFoundMessage = (value: string) => {
  return `Found multiple elements with accessibilityLabel: ${value}`;
};

const getNoInstancesFoundMessage = (value: string) => {
  return `Unable to find an element with accessibilityLabel: ${value}`;
};

const Typography = ({ children, ...rest }: any) => {
  return <Text {...rest}>{children}</Text>;
};

const Button = ({ children }: { children: React.ReactNode }) => (
  <TouchableOpacity
    accessibilityHint={BUTTON_HINT}
    accessibilityLabel={BUTTON_LABEL}
  >
    <Typography accessibilityHint={TEXT_HINT} accessibilityLabel={TEXT_LABEL}>
      {children}
    </Typography>
  </TouchableOpacity>
);

const Section = () => (
  <>
    <Typography accessibilityHint={TEXT_HINT} accessibilityLabel={TEXT_LABEL}>
      Title
    </Typography>
    <Button>{TEXT_LABEL}</Button>
  </>
);

test('getByLabelText, queryByLabelText, findByLabelText', async () => {
  const { getByLabelText, queryByLabelText, findByLabelText } = render(
    <Section />
  );

  expect(getByLabelText(BUTTON_LABEL).props.accessibilityLabel).toEqual(
    BUTTON_LABEL
  );
  const button = queryByLabelText(/button/g);
  expect(button?.props.accessibilityLabel).toEqual(BUTTON_LABEL);

  expect(() => getByLabelText(NO_MATCHES_TEXT)).toThrow(
    getNoInstancesFoundMessage(NO_MATCHES_TEXT)
  );
  expect(queryByLabelText(NO_MATCHES_TEXT)).toBeNull();

  expect(() => getByLabelText(TEXT_LABEL)).toThrow(
    getMultipleInstancesFoundMessage(TEXT_LABEL)
  );
  expect(() => queryByLabelText(TEXT_LABEL)).toThrow(
    getMultipleInstancesFoundMessage(TEXT_LABEL)
  );

  const asyncButton = await findByLabelText(BUTTON_LABEL);
  expect(asyncButton.props.accessibilityLabel).toEqual(BUTTON_LABEL);
  await expect(findByLabelText(NO_MATCHES_TEXT)).rejects.toThrow(
    getNoInstancesFoundMessage(NO_MATCHES_TEXT)
  );

  await expect(findByLabelText(TEXT_LABEL)).rejects.toThrow(
    getMultipleInstancesFoundMessage(TEXT_LABEL)
  );
});

test('getAllByLabelText, queryAllByLabelText, findAllByLabelText', async () => {
  const { getAllByLabelText, queryAllByLabelText, findAllByLabelText } = render(
    <Section />
  );

  expect(getAllByLabelText(TEXT_LABEL)).toHaveLength(2);
  expect(queryAllByLabelText(/cool/g)).toHaveLength(3);

  expect(() => getAllByLabelText(NO_MATCHES_TEXT)).toThrow(
    getNoInstancesFoundMessage(NO_MATCHES_TEXT)
  );
  expect(queryAllByLabelText(NO_MATCHES_TEXT)).toEqual([]);

  await expect(findAllByLabelText(TEXT_LABEL)).resolves.toHaveLength(2);
  await expect(findAllByLabelText(NO_MATCHES_TEXT)).rejects.toThrow(
    getNoInstancesFoundMessage(NO_MATCHES_TEXT)
  );
});

test('getAllByLabelText, queryAllByLabelText, findAllByLabelText with exact as false', async () => {
  const { getAllByLabelText, queryAllByLabelText, findAllByLabelText } = render(
    <Section />
  );

  expect(getAllByLabelText(TEXT_LABEL, { exact: false })).toHaveLength(2);
  expect(queryAllByLabelText(/cool/g, { exact: false })).toHaveLength(3);

  expect(() => getAllByLabelText(NO_MATCHES_TEXT, { exact: false })).toThrow(
    getNoInstancesFoundMessage(NO_MATCHES_TEXT)
  );
  expect(queryAllByLabelText(NO_MATCHES_TEXT, { exact: false })).toEqual([]);

  await expect(
    findAllByLabelText(TEXT_LABEL, { exact: false })
  ).resolves.toHaveLength(2);
  await expect(
    findAllByLabelText(NO_MATCHES_TEXT, { exact: false })
  ).rejects.toThrow(getNoInstancesFoundMessage(NO_MATCHES_TEXT));
});

describe('findBy options deprecations', () => {
  let warnSpy: jest.SpyInstance;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('findByText queries warn on deprecated use of WaitForOptions', async () => {
    const options = { timeout: 10 };
    // mock implementation to avoid warning in the test suite
    const view = render(<View />);
    await expect(
      view.findByLabelText('Some Text', options)
    ).rejects.toBeTruthy();

    setTimeout(
      () => view.rerender(<View accessibilityLabel="Some Text" />),
      20
    );
    await expect(view.findByLabelText('Some Text')).resolves.toBeTruthy();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Use of option "timeout"')
    );
  }, 20000);
});

test('byLabelText queries support hidden option', () => {
  const { getByLabelText, queryByLabelText } = render(
    <Text accessibilityLabel="hidden" style={{ display: 'none' }}>
      Hidden from accessibility
    </Text>
  );

  expect(getByLabelText('hidden')).toBeTruthy();
  expect(
    getByLabelText('hidden', { includeHiddenElements: true })
  ).toBeTruthy();

  expect(
    queryByLabelText('hidden', { includeHiddenElements: false })
  ).toBeFalsy();
  expect(() =>
    getByLabelText('hidden', { includeHiddenElements: false })
  ).toThrowErrorMatchingInlineSnapshot(
    `"Unable to find an element with accessibilityLabel: hidden"`
  );
});
