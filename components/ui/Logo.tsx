import { Image, ImageStyle, StyleProp } from 'react-native';

const LOGO = require('@/assets/images/veribee-logo.png');

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ size = 56, style }: Props) {
  return (
    <Image
      source={LOGO}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}
