import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TextInput as RNTextInput,
  StyleSheet,
} from "react-native";

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
) => {
  return useCssElement(RouterLink, props, { className: "style" });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

function fixLineHeights(style: any): any {
  if (!style) return style;

  if (Array.isArray(style)) {
    return style.map(fixLineHeights);
  }

  if (typeof style === "object") {
    const newStyle = { ...style };
    if (typeof newStyle.lineHeight === "number" && newStyle.lineHeight < 5) {
      const fs = typeof newStyle.fontSize === "number" ? newStyle.fontSize : 16;
      newStyle.lineHeight = Math.round(newStyle.lineHeight * fs);
    }
    return newStyle;
  }

  return style;
}

function fixElementStyles(element: any): any {
  if (!element || !React.isValidElement(element)) return element;

  const props: any = element.props || {};
  
  if (props.style) {
    const fixedStyle = fixLineHeights(props.style);
    return React.cloneElement(element, { style: fixedStyle });
  }

  if (props.children) {
    if (Array.isArray(props.children)) {
      const fixedChildren = props.children.map((child: any) => {
        if (React.isValidElement(child)) {
          return fixElementStyles(child);
        }
        return child;
      });
      return React.cloneElement(element, {}, ...fixedChildren);
    } else if (React.isValidElement(props.children)) {
      const fixedChild = fixElementStyles(props.children);
      return React.cloneElement(element, {}, fixedChild);
    }
  }

  return element;
}

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  const element = useCssElement(RNView, props, { className: "style" });
  return element;
};
View.displayName = "CSS(View)";

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
) => {
  const element = useCssElement(RNText, props, { className: "style" });
  return fixElementStyles(element);
};
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
) => {
  const element = useCssElement(RNTextInput, props, { className: "style" });
  return fixElementStyles(element);
};
TextInput.displayName = "CSS(TextInput)";

// AnimatedScrollView
export const AnimatedScrollView = (
  props: any
) => {
  return useCssElement(Animated.ScrollView as any, props, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  });
};

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: any
) {
  const flatStyle = (StyleSheet.flatten(props.style) as any) || {};
  const underlayColor = flatStyle?.underlayColor;
  const style = { ...flatStyle };
  delete style.underlayColor;
  return (
    <RNTouchableHighlight
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight>
) => {
  return useCssElement(XXTouchableHighlight, props, { className: "style" });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";
