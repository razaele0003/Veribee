import * as React from 'react';
import type { StyleProp } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Polyline,
  Rect,
  type SvgProps,
} from 'react-native-svg';

const ICON_NAMES = [
  'Completed',
  'Disputed',
  'Shipping',
  'Verified',
  'account-balance',
  'account-balance-wallet',
  'account-circle',
  'add',
  'add-shopping-cart',
  'arrow-back',
  'arrow-downward',
  'arrow-forward',
  'arrow-right',
  'arrow-upward',
  'assignment-ind',
  'badge',
  'bolt',
  'bug-report',
  'call',
  'cancel',
  'category',
  'chat',
  'chat-bubble',
  'chat-bubble-outline',
  'check',
  'check-circle',
  'chevron-right',
  'close',
  'contact-page',
  'credit-card',
  'dashboard',
  'delete-outline',
  'delivery-dining',
  'description',
  'directions-walk',
  'door-front',
  'edit',
  'edit-note',
  'error-outline',
  'expand-more',
  'explore',
  'face',
  'fact-check',
  'filter-list',
  'fingerprint',
  'health-and-safety',
  'help',
  'help-outline',
  'history',
  'home',
  'how-to-reg',
  'image',
  'info',
  'info-outline',
  'inventory-2',
  'ios-share',
  'job-feed',
  'lightbulb',
  'local-mall',
  'local-offer',
  'local-shipping',
  'location-on',
  'lock',
  'lock-outline',
  'lock-reset',
  'logout',
  'mail',
  'manage-search',
  'map',
  'more-horiz',
  'more-vert',
  'my-location',
  'navigation',
  'near-me',
  'new',
  'notifications',
  'notifications-none',
  'open-in-new',
  'password',
  'payments',
  'person',
  'person-outline',
  'person-pin-circle',
  'phone-iphone',
  'photo-camera',
  'photo-library',
  'pin',
  'place',
  'processing',
  'qr-code-scanner',
  'radio-button-checked',
  'refresh',
  'remove',
  'report-problem',
  'schedule',
  'search',
  'search-off',
  'security',
  'settings',
  'shield',
  'shopping-bag',
  'shopping-cart',
  'sort',
  'sort-by-alpha',
  'star',
  'store',
  'storefront',
  'tune',
  'two-wheeler',
  'verified',
  'verified-user',
] as const;

export type MaterialIconName = (typeof ICON_NAMES)[number] | string;

export const glyphMap = Object.fromEntries(
  ICON_NAMES.map((name, index) => [name, index + 1]),
) as Record<string, number>;

type MaterialIconsProps = Omit<SvgProps, 'color' | 'style'> & {
  name: MaterialIconName;
  size?: number;
  color?: string;
  style?: StyleProp<unknown>;
};

type IconDrawProps = {
  color: string;
  strokeWidth: number;
};

const aliases: Record<string, string> = {
  Completed: 'check-circle',
  Disputed: 'report-problem',
  Shipping: 'local-shipping',
  Verified: 'verified',
  'account-balance': 'bank',
  'account-balance-wallet': 'wallet',
  'account-circle': 'account-circle',
  'add-shopping-cart': 'cart-add',
  'arrow-back': 'arrow-left',
  'arrow-downward': 'arrow-down',
  'arrow-forward': 'arrow-right-line',
  'arrow-right': 'chevron-right',
  'arrow-upward': 'arrow-up',
  'assignment-ind': 'badge',
  'bug-report': 'bug',
  'chat-bubble': 'chat',
  'chat-bubble-outline': 'chat',
  'check-circle': 'check-circle',
  'contact-page': 'contact-page',
  'credit-card': 'credit-card',
  'delete-outline': 'trash',
  'delivery-dining': 'delivery',
  'directions-walk': 'walk',
  'door-front': 'door',
  'edit-note': 'edit-note',
  'error-outline': 'alert',
  'expand-more': 'chevron-down',
  'fact-check': 'fact-check',
  'filter-list': 'filter',
  'health-and-safety': 'shield-check',
  'help-outline': 'help',
  'how-to-reg': 'person-check',
  'info-outline': 'info',
  'inventory-2': 'box',
  'ios-share': 'share',
  'job-feed': 'clipboard-clock',
  'local-mall': 'shopping-bag',
  'local-offer': 'tag',
  'local-shipping': 'truck',
  'location-on': 'pin',
  'lock-outline': 'lock',
  'lock-reset': 'lock-reset',
  devices: 'devices',
  inbox: 'inbox',
  inventory: 'box',
  'manage-search': 'manage-search',
  'more-horiz': 'dots-horizontal',
  'more-vert': 'dots-vertical',
  'my-location': 'target',
  'near-me': 'navigation',
  'notifications-none': 'bell',
  'open-in-new': 'open',
  'person-outline': 'person',
  'person-pin-circle': 'person-pin',
  'phone-iphone': 'phone-device',
  'photo-library': 'photo-library',
  'place': 'pin',
  processing: 'schedule',
  'qr-code-scanner': 'qr',
  'radio-button-checked': 'radio-checked',
  'pending-actions': 'schedule',
  'power-settings-new': 'power',
  'receipt-long': 'description',
  'report-problem': 'alert',
  route: 'route',
  'search-off': 'search-off',
  'sort-by-alpha': 'sort-alpha',
  storefront: 'store',
  'task-alt': 'check-circle',
  'two-wheeler': 'scooter',
  verified: 'verified',
  'verified-user': 'shield-check',
};

function iconKey(name: string) {
  return aliases[name] ?? name;
}

function UnknownIcon({ color, strokeWidth }: IconDrawProps) {
  return (
    <>
      <Rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="16" y1="8" x2="8" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </>
  );
}

function drawIcon(key: string, props: IconDrawProps): React.ReactNode {
  const { color, strokeWidth } = props;
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (key) {
    case 'add':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      );
    case 'remove':
      return <Line x1="5" y1="12" x2="19" y2="12" {...common} />;
    case 'check':
      return <Polyline points="5 12.5 10 17 19 7" {...common} />;
    case 'close':
    case 'cancel':
      return (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...common} />
          <Line x1="18" y1="6" x2="6" y2="18" {...common} />
        </>
      );
    case 'check-circle':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill={color} />
          <Polyline points="7.5 12.5 10.5 15.5 16.8 8.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'radio-checked':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="12" r="4.5" fill={color} />
        </>
      );
    case 'arrow-left':
      return (
        <>
          <Line x1="19" y1="12" x2="5" y2="12" {...common} />
          <Polyline points="12 5 5 12 12 19" {...common} />
        </>
      );
    case 'arrow-right-line':
      return (
        <>
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
          <Polyline points="12 5 19 12 12 19" {...common} />
        </>
      );
    case 'arrow-up':
      return (
        <>
          <Line x1="12" y1="19" x2="12" y2="5" {...common} />
          <Polyline points="5 12 12 5 19 12" {...common} />
        </>
      );
    case 'arrow-down':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Polyline points="5 12 12 19 19 12" {...common} />
        </>
      );
    case 'chevron-right':
      return <Polyline points="9 5 16 12 9 19" {...common} />;
    case 'chevron-down':
      return <Polyline points="6 9 12 15 18 9" {...common} />;
    case 'home':
      return (
        <>
          <Path d="M3.5 11.5 12 4l8.5 7.5" {...common} />
          <Path d="M6 10.5V20h4.5v-5.5h3V20H18v-9.5" {...common} />
        </>
      );
    case 'person':
      return (
        <>
          <Circle cx="12" cy="8" r="4" fill={color} />
          <Path d="M4.5 20c1.1-4 4-6 7.5-6s6.4 2 7.5 6" fill={color} />
        </>
      );
    case 'account-circle':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="9" r="3" fill={color} />
          <Path d="M6.5 18c1.1-3.1 3.1-4.6 5.5-4.6s4.4 1.5 5.5 4.6" fill={color} />
        </>
      );
    case 'person-check':
      return (
        <>
          {drawIcon('person', props)}
          <Polyline points="14 18 16 20 21 15" {...common} />
        </>
      );
    case 'person-pin':
      return (
        <>
          <Path d="M12 22s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="12" cy="9" r="2.2" fill={color} />
          <Path d="M8.5 15c.8-2 2-3 3.5-3s2.7 1 3.5 3" fill={color} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx="10.5" cy="10.5" r="6" {...common} />
          <Line x1="15" y1="15" x2="20" y2="20" {...common} />
        </>
      );
    case 'search-off':
      return (
        <>
          {drawIcon('search', props)}
          <Line x1="4" y1="4" x2="20" y2="20" {...common} />
        </>
      );
    case 'manage-search':
      return (
        <>
          {drawIcon('search', props)}
          <Line x1="4" y1="18" x2="10" y2="18" {...common} />
        </>
      );
    case 'shopping-cart':
      return (
        <>
          <Path d="M3.5 5h2l2 10h9.5l2-7H7" {...common} />
          <Circle cx="9" cy="19" r="1.6" fill={color} />
          <Circle cx="17" cy="19" r="1.6" fill={color} />
        </>
      );
    case 'cart-add':
      return (
        <>
          {drawIcon('shopping-cart', props)}
          <Line x1="16" y1="3.5" x2="16" y2="9.5" {...common} />
          <Line x1="13" y1="6.5" x2="19" y2="6.5" {...common} />
        </>
      );
    case 'shopping-bag':
      return (
        <>
          <Path d="M6 8h12l-1 12H7L6 8Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M9 8a3 3 0 0 1 6 0" {...common} />
        </>
      );
    case 'local-mall':
      return drawIcon('shopping-bag', props);
    case 'store':
      return (
        <>
          <Path d="M4 10h16l-1.5-5h-13L4 10Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M6 10v9h12v-9" {...common} />
          <Path d="M9 19v-5h6v5" {...common} />
        </>
      );
    case 'truck':
      return (
        <>
          <Path d="M3 7h11v9H3V7Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M14 10h3.5l2.5 3v3h-6v-6Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="7" cy="18" r="2" fill={color} />
          <Circle cx="17" cy="18" r="2" fill={color} />
        </>
      );
    case 'delivery':
    case 'scooter':
      return (
        <>
          <Circle cx="6.5" cy="17" r="3" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="17.5" cy="17" r="3" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M8 17h5l2-7h-4l-2 4" {...common} />
          <Path d="M15 10h3l2 3" {...common} />
          <Rect x="7" y="6" width="5" height="3" rx="1" fill={color} />
        </>
      );
    case 'pin':
      return (
        <>
          <Path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" fill={color} />
          <Circle cx="12" cy="10" r="2.8" fill="#fff" />
        </>
      );
    case 'navigation':
    case 'near-me':
      return <Path d="M5 21 12.5 3 19 21l-6.5-4L5 21Z" fill={color} />;
    case 'target':
      return (
        <>
          <Circle cx="12" cy="12" r="7" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="12" r="2.5" fill={color} />
          <Line x1="12" y1="2" x2="12" y2="5" {...common} />
          <Line x1="12" y1="19" x2="12" y2="22" {...common} />
          <Line x1="2" y1="12" x2="5" y2="12" {...common} />
          <Line x1="19" y1="12" x2="22" y2="12" {...common} />
        </>
      );
    case 'map':
      return (
        <>
          <Path d="M4 6.5 9 4l6 2.5 5-2.5v13.5L15 20l-6-2.5L4 20V6.5Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Line x1="9" y1="4" x2="9" y2="17.5" {...common} />
          <Line x1="15" y1="6.5" x2="15" y2="20" {...common} />
        </>
      );
    case 'route':
      return (
        <>
          <Circle cx="6" cy="18" r="2.5" fill={color} />
          <Circle cx="18" cy="6" r="2.5" fill={color} />
          <Path d="M8 18c5 0 2-12 8-12" {...common} />
        </>
      );
    case 'explore':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M15.5 8.5 13.5 14l-5 1.5 2-5.5 5-1.5Z" fill={color} />
        </>
      );
    case 'call':
      return <Path d="M7 4.5 10 8l-2 2c1.5 3 3.5 5 6.5 6.5l2-2 3 3c.4.4.4 1 0 1.4-1.2 1.3-2.8 1.6-4.7.9-5.1-1.8-8.7-5.4-10.5-10.5-.7-1.9-.4-3.5.9-4.7.4-.4 1-.4 1.8-.1Z" fill={color} />;
    case 'chat':
      return (
        <>
          <Path d="M4 5.5h16v11H9l-5 4v-15Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Line x1="8" y1="10" x2="16" y2="10" {...common} />
          <Line x1="8" y1="13.5" x2="13" y2="13.5" {...common} />
        </>
      );
    case 'mail':
      return (
        <>
          <Rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M5 8l7 5 7-5" {...common} />
        </>
      );
    case 'bell':
    case 'notifications':
      return (
        <>
          <Path d="M6.5 17h11c-1.2-1.5-1.8-3.2-1.8-5.2V10a3.7 3.7 0 0 0-7.4 0v1.8c0 2-.6 3.7-1.8 5.2Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M10 19a2.2 2.2 0 0 0 4 0" {...common} />
        </>
      );
    case 'trash':
      return (
        <>
          <Path d="M5 7h14" {...common} />
          <Path d="M9 7V5h6v2" {...common} />
          <Path d="M7 7l1 13h8l1-13" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Line x1="10" y1="10" x2="10" y2="17" {...common} />
          <Line x1="14" y1="10" x2="14" y2="17" {...common} />
        </>
      );
    case 'edit':
    case 'edit-note':
      return (
        <>
          <Path d="M5 18.5 6 14l9.5-9.5 4 4L10 18l-5 1Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Line x1="13.8" y1="6.2" x2="17.8" y2="10.2" {...common} />
        </>
      );
    case 'description':
    case 'contact-page':
      return (
        <>
          <Path d="M6 3.5h8l4 4V20H6V3.5Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M14 3.5V8h4" {...common} />
          <Line x1="8.5" y1="12" x2="15.5" y2="12" {...common} />
          <Line x1="8.5" y1="15.5" x2="14" y2="15.5" {...common} />
        </>
      );
    case 'badge':
      return (
        <>
          <Rect x="4" y="6" width="16" height="13" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="10" cy="11" r="2" fill={color} />
          <Path d="M7.5 16c.6-1.8 1.4-2.6 2.5-2.6s1.9.8 2.5 2.6" fill={color} />
          <Line x1="14.5" y1="10" x2="18" y2="10" {...common} />
          <Line x1="14.5" y1="13.5" x2="17" y2="13.5" {...common} />
        </>
      );
    case 'credit-card':
    case 'payments':
    case 'wallet':
      return (
        <>
          <Rect x="3.5" y="6" width="17" height="12" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="4" y1="10" x2="20" y2="10" {...common} />
          <Rect x="7" y="14" width="4" height="1.5" rx=".5" fill={color} />
        </>
      );
    case 'bank':
      return (
        <>
          <Path d="M4 9h16L12 4 4 9Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Line x1="6" y1="10" x2="6" y2="18" {...common} />
          <Line x1="10" y1="10" x2="10" y2="18" {...common} />
          <Line x1="14" y1="10" x2="14" y2="18" {...common} />
          <Line x1="18" y1="10" x2="18" y2="18" {...common} />
          <Line x1="4" y1="20" x2="20" y2="20" {...common} />
        </>
      );
    case 'dashboard':
    case 'category':
      return (
        <>
          <Rect x="4" y="4" width="7" height="7" rx="1.5" fill={color} />
          <Rect x="13" y="4" width="7" height="7" rx="1.5" fill={color} />
          <Rect x="4" y="13" width="7" height="7" rx="1.5" fill={color} />
          <Rect x="13" y="13" width="7" height="7" rx="1.5" fill={color} />
        </>
      );
    case 'box':
      return (
        <>
          <Path d="M4.5 7.5 12 4l7.5 3.5v9L12 20l-7.5-3.5v-9Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M5 8l7 3.5L19 8" {...common} />
          <Line x1="12" y1="11.5" x2="12" y2="20" {...common} />
        </>
      );
    case 'inbox':
      return (
        <>
          <Path d="M5 5h14l2 9v5H3v-5l2-9Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M3 14h5l1.5 3h5L16 14h5" {...common} />
        </>
      );
    case 'image':
    case 'photo-library':
      return (
        <>
          <Rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="9" cy="10" r="2" fill={color} />
          <Path d="M5.5 17 10 13l3 2.5 2.5-3L19 17" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </>
      );
    case 'photo-camera':
      return (
        <>
          <Path d="M5 8h3l1.5-2h5L16 8h3v11H5V8Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="12" cy="13.5" r="3.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
        </>
      );
    case 'qr':
      return (
        <>
          <Rect x="4" y="4" width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Rect x="14" y="4" width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Rect x="4" y="14" width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M14 14h2v2h-2v4h6v-3" {...common} />
        </>
      );
    case 'lock':
    case 'password':
      return (
        <>
          <Rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3" {...common} />
        </>
      );
    case 'lock-reset':
      return (
        <>
          {drawIcon('lock', props)}
          <Path d="M17.5 5.5A6.5 6.5 0 0 0 7 7" {...common} />
          <Polyline points="7 3 7 7 11 7" {...common} />
        </>
      );
    case 'shield':
    case 'security':
      return <Path d="M12 3.5 19 6v5.5c0 4.5-2.7 7.6-7 9-4.3-1.4-7-4.5-7-9V6l7-2.5Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />;
    case 'shield-check':
    case 'verified':
      return (
        <>
          <Path d="M12 3.5 19 6v5.5c0 4.5-2.7 7.6-7 9-4.3-1.4-7-4.5-7-9V6l7-2.5Z" fill={color} />
          <Polyline points="8.2 12 10.8 14.6 16 9.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'fingerprint':
      return (
        <>
          <Path d="M7 10a5 5 0 0 1 10 0" {...common} />
          <Path d="M5 13a7 7 0 0 1 14 0" {...common} />
          <Path d="M9 13c0-2 1-3 3-3s3 1 3 3c0 3-1 4.5-2 6" {...common} />
          <Path d="M10 17c-.8-1-1-2-1-4" {...common} />
        </>
      );
    case 'schedule':
    case 'history':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 7v5l3.5 2" {...common} />
        </>
      );
    case 'star':
      return <Path d="M12 3.8 14.5 9l5.7.7-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4L9.5 9 12 3.8Z" fill={color} />;
    case 'alert':
      return (
        <>
          <Path d="M12 4 21 20H3L12 4Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Line x1="12" y1="9" x2="12" y2="14" {...common} />
          <Circle cx="12" cy="17" r="1.2" fill={color} />
        </>
      );
    case 'info':
    case 'help':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeWidth} />
          {key === 'help' ? (
            <>
              <Path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.2-1.6 2.7" {...common} />
              <Circle cx="12" cy="17" r="1" fill={color} />
            </>
          ) : (
            <>
              <Line x1="12" y1="11" x2="12" y2="17" {...common} />
              <Circle cx="12" cy="7.8" r="1.2" fill={color} />
            </>
          )}
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5 6.8 15M17.2 9l2.6-1.5" {...common} />
        </>
      );
    case 'tune':
    case 'filter':
      return (
        <>
          <Line x1="4" y1="7" x2="20" y2="7" {...common} />
          <Line x1="4" y1="12" x2="20" y2="12" {...common} />
          <Line x1="4" y1="17" x2="20" y2="17" {...common} />
          <Circle cx="9" cy="7" r="2" fill={color} />
          <Circle cx="15" cy="12" r="2" fill={color} />
          <Circle cx="11" cy="17" r="2" fill={color} />
        </>
      );
    case 'sort':
    case 'sort-alpha':
      return (
        <>
          <Line x1="6" y1="7" x2="18" y2="7" {...common} />
          <Line x1="6" y1="12" x2="15" y2="12" {...common} />
          <Line x1="6" y1="17" x2="12" y2="17" {...common} />
        </>
      );
    case 'refresh':
      return (
        <>
          <Path d="M19 8a7 7 0 0 0-12-2l-2 2" {...common} />
          <Polyline points="5 4 5 8 9 8" {...common} />
          <Path d="M5 16a7 7 0 0 0 12 2l2-2" {...common} />
          <Polyline points="19 20 19 16 15 16" {...common} />
        </>
      );
    case 'logout':
      return (
        <>
          <Path d="M10 5H6v14h4" {...common} />
          <Line x1="10" y1="12" x2="20" y2="12" {...common} />
          <Polyline points="16 8 20 12 16 16" {...common} />
        </>
      );
    case 'open':
      return (
        <>
          <Path d="M9 5H5v14h14v-4" {...common} />
          <Path d="M13 5h6v6" {...common} />
          <Line x1="11" y1="13" x2="19" y2="5" {...common} />
        </>
      );
    case 'share':
      return (
        <>
          <Path d="M12 16V4" {...common} />
          <Polyline points="8 8 12 4 16 8" {...common} />
          <Path d="M5 12v7h14v-7" {...common} />
        </>
      );
    case 'phone-device':
      return (
        <>
          <Rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="10" y1="18" x2="14" y2="18" {...common} />
        </>
      );
    case 'devices':
      return (
        <>
          <Rect x="3.5" y="5" width="11" height="14" rx="2" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Rect x="15" y="10" width="5.5" height="9" rx="1.3" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="7" y1="16" x2="11" y2="16" {...common} />
        </>
      );
    case 'walk':
      return (
        <>
          <Circle cx="13" cy="5" r="2" fill={color} />
          <Path d="M11 9l-2 4 4 2 1 5M12 9l4 3M9 13l-2 6" {...common} />
        </>
      );
    case 'face':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Path d="M8.5 14.5c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2" {...common} />
        </>
      );
    case 'lightbulb':
      return (
        <>
          <Path d="M8 11a4 4 0 1 1 8 0c0 1.5-.8 2.6-2 3.5V17h-4v-2.5c-1.2-.9-2-2-2-3.5Z" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="10" y1="20" x2="14" y2="20" {...common} />
        </>
      );
    case 'bolt':
      return <Path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z" fill={color} />;
    case 'power':
      return (
        <>
          <Line x1="12" y1="4" x2="12" y2="12" {...common} />
          <Path d="M7.5 7.5a7 7 0 1 0 9 0" {...common} />
        </>
      );
    case 'tag':
      return (
        <>
          <Path d="M4 11V5h6l10 10-6 6L4 11Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Circle cx="8" cy="8" r="1.4" fill={color} />
        </>
      );
    case 'clipboard-clock':
      return (
        <>
          <Path d="M8 5H6v15h12V5h-2" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Rect x="9" y="3.5" width="6" height="3" rx="1" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="13" cy="13" r="3.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M13 11v2.5l1.7 1" {...common} />
        </>
      );
    case 'fact-check':
      return (
        <>
          <Path d="M5 5h14v14H5V5Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Polyline points="8 10 9.5 11.5 12 8.5" {...common} />
          <Line x1="13.5" y1="10" x2="17" y2="10" {...common} />
          <Polyline points="8 15 9.5 16.5 12 13.5" {...common} />
          <Line x1="13.5" y1="15" x2="17" y2="15" {...common} />
        </>
      );
    case 'door':
      return (
        <>
          <Path d="M7 4h10v16H7V4Z" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="14.5" cy="12" r="1" fill={color} />
        </>
      );
    case 'dots-horizontal':
      return (
        <>
          <Circle cx="6" cy="12" r="2" fill={color} />
          <Circle cx="12" cy="12" r="2" fill={color} />
          <Circle cx="18" cy="12" r="2" fill={color} />
        </>
      );
    case 'dots-vertical':
      return (
        <>
          <Circle cx="12" cy="6" r="2" fill={color} />
          <Circle cx="12" cy="12" r="2" fill={color} />
          <Circle cx="12" cy="18" r="2" fill={color} />
        </>
      );
    case 'bug':
      return (
        <>
          <Ellipse cx="12" cy="13" rx="5" ry="6" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="8" y1="4" x2="10" y2="8" {...common} />
          <Line x1="16" y1="4" x2="14" y2="8" {...common} />
          <Line x1="4" y1="11" x2="7" y2="11" {...common} />
          <Line x1="17" y1="11" x2="20" y2="11" {...common} />
          <Line x1="4" y1="16" x2="7.5" y2="15" {...common} />
          <Line x1="16.5" y1="15" x2="20" y2="16" {...common} />
        </>
      );
    case 'new':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill={color} />
          <Path d="M8 15V9l4 6V9M16 9v6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    default:
      return <UnknownIcon {...props} />;
  }
}

function MaterialIconComponent({
  name,
  size = 24,
  color = '#000',
  style,
  strokeWidth = 2,
  ...props
}: MaterialIconsProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style as SvgProps['style']}
      accessibilityRole="image"
      {...props}
    >
      {drawIcon(iconKey(String(name)), { color, strokeWidth: Number(strokeWidth) || 2 })}
    </Svg>
  );
}

MaterialIconComponent.glyphMap = glyphMap;

export const MaterialIcons = MaterialIconComponent;
