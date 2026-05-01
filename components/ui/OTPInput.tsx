import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Radii } from '@/constants/radii';

type Props = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
};

export function OTPInput({ length = 6, value, onChange }: Props) {
  const refs = useRef<Array<TextInput | null>>([]);
  const [focusIdx, setFocusIdx] = useState(-1);

  useEffect(() => {
    if (value.length < length) {
      refs.current[value.length]?.focus();
    }
  }, [value, length]);

  const handle = (idx: number, ch: string) => {
    const digit = ch.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[idx] = digit;
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (digit && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx: number, key: string) => {
    if (key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
      const arr = value.split('');
      arr[idx - 1] = '';
      onChange(arr.join(''));
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            refs.current[i] = r;
          }}
          style={[
            styles.box,
            (focusIdx === i || (focusIdx === -1 && i === value.length)) && styles.focused,
          ]}
          value={value[i] ?? ''}
          onChangeText={(c) => handle(i, c)}
          onKeyPress={({ nativeEvent }) => handleKey(i, nativeEvent.key)}
          onFocus={() => setFocusIdx(i)}
          onBlur={() => setFocusIdx(-1)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  box: {
    width: 48,
    height: 56,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.onSurface,
    textAlign: 'center',
    padding: 0,
  },
  focused: { borderColor: Colors.primary },
});
