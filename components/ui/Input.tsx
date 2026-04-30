import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  prefix?: string;
  rightAccessory?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function Input({
  label,
  error,
  prefix,
  rightAccessory,
  containerStyle,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errorField,
        ]}
      >
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={Colors.onSurfaceVariant}
          style={[styles.input, rest.style]}
        />
        {rightAccessory}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function PasswordInput(props: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <Input
      {...props}
      secureTextEntry={hidden}
      rightAccessory={
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
          <MaterialIcons
            name={hidden ? 'visibility' : 'visibility-off'}
            size={22}
            color={Colors.onSurfaceVariant}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  label: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  field: {
    minHeight: 52,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focused: { borderColor: Colors.primary },
  errorField: { borderColor: Colors.error },
  prefix: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurface,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    color: Colors.onSurface,
    paddingVertical: 12,
    outlineStyle: 'none',
  } as TextStyle & { outlineStyle: string },
  errorText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
